import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  ClinicHistoryMetrics,
  ClinicSettings,
  NotificationEvent,
  NotificationRecord,
  Patient,
  QueueSnapshot,
  ServiceId,
  StaffAccount,
  WaitingMode,
} from '@/lib/types';
import { DEFAULT_CLINIC_SETTINGS, serviceById } from '@/lib/clinic';
import {
  buildQueueSnapshot,
  computeHistoryMetrics,
  etaForAppointment,
  measuredAveragesForEta,
  nextQueueNumber,
} from '@/lib/queue';
import type { EtaResult } from '@/lib/types';
import { todayISO, weekdayOf } from '@/lib/time';
import { bookingReference, capabilityToken, shortId, uuid } from '@/lib/id';
import {
  cleanName,
  cleanNote,
  normaliseAlgerianPhone,
  validateDate,
  validateName,
  validatePhone,
} from '@/lib/validation';
import {
  LocalStorageRepository,
  SCHEMA_VERSION,
  type ClinicRepository,
  type ClinicSnapshot,
} from '@/lib/storage';
import {
  InAppChannel,
  PushChannel,
  SmsChannel,
  WhatsAppChannel,
  notificationBus,
} from '@/lib/notifications';
import { createStaffAccount } from '@/lib/auth';
import { useI18n } from '@/i18n';
import { useToast } from '@/components/ui/Toast';
import { createDemoAppointments } from '@/lib/demo';

/**
 * THE CLINIC STORE
 *
 * Single source of truth for the whole product. Every mutation goes through
 * an action here, is validated, is written to the audit trail on the
 * appointment, and is persisted via `ClinicRepository`.
 *
 * Swapping `LocalStorageRepository` for an HTTP implementation turns this
 * into a thin client of a real backend with no component changes.
 */

export type ActionResult =
  | { ok: true; appointment?: Appointment; error?: undefined }
  | { ok: false; error: string; appointment?: undefined };

export interface BookInput {
  serviceId: ServiceId;
  date: string;
  slot: string;
  fullName: string;
  phone: string;
}

interface ClinicApi {
  ready: boolean;
  settings: ClinicSettings;
  appointments: Appointment[];
  patients: Patient[];
  staff: StaffAccount[];
  clinicDelayMinutes: number;
  demoMode: boolean;

  today: string;
  snapshot: QueueSnapshot;
  snapshotFor: (date: string) => QueueSnapshot;
  metrics: ClinicHistoryMetrics;
  etaFor: (appointment: Appointment) => EtaResult | null;

  findByToken: (token: string) => Appointment | undefined;
  findByRefAndPhone: (ref: string, phone: string) => Appointment | undefined;
  appointmentsForDate: (date: string) => Appointment[];
  remainingForSlot: (date: string, slot: string) => number;
  slotsForDate: (date: string) => { time: string; remaining: number; capacity: number }[];
  isBookableDay: (date: string) => boolean;

  book: (input: BookInput) => Promise<ActionResult>;
  cancelAppointment: (id: string, actor: string) => Promise<ActionResult>;
  requestReschedule: (id: string, actor: string) => Promise<ActionResult>;
  checkIn: (id: string, actor: string) => Promise<ActionResult>;
  setWaitingMode: (id: string, mode: WaitingMode) => Promise<ActionResult>;
  startConsultation: (id: string, actor: string) => Promise<ActionResult>;
  completeConsultation: (
    id: string,
    actor: string,
    durationMinutes?: number,
  ) => Promise<ActionResult>;
  skipAppointment: (id: string, actor: string) => Promise<ActionResult>;
  markEmergency: (id: string, actor: string) => Promise<ActionResult>;
  markNoShow: (id: string, actor: string) => Promise<ActionResult>;
  setStatus: (id: string, status: AppointmentStatus, actor: string) => Promise<ActionResult>;
  addWalkIn: (input: {
    fullName: string;
    phone: string;
    type: AppointmentType;
    serviceId: ServiceId;
    actor: string;
  }) => Promise<ActionResult>;
  callNext: (actor: string) => Promise<ActionResult>;
  declareDelay: (minutes: number, actor: string) => Promise<ActionResult>;
  clearDelay: (actor: string) => Promise<ActionResult>;

  updateSettings: (patch: Partial<ClinicSettings>) => Promise<void>;
  addStaff: (input: {
    name: string;
    login: string;
    role: StaffAccount['role'];
    secret: string;
  }) => Promise<ActionResult>;
  toggleStaff: (id: string, active: boolean) => Promise<void>;

  notifications: NotificationRecord[];
  loadDemoData: () => Promise<void>;
  resetData: () => Promise<void>;
  exportData: () => string;
}

const ClinicContext = createContext<ClinicApi | null>(null);

const DEFAULT_STAFF_PASSWORD = 'Kattou@2025';

export function ClinicProvider({ children }: { children: ReactNode }) {
  const repository = useRef<ClinicRepository>(new LocalStorageRepository());
  const { t, lang, formatDate } = useI18n();

  const [settings, setSettings] = useState<ClinicSettings>(DEFAULT_CLINIC_SETTINGS);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [staff, setStaff] = useState<StaffAccount[]>([]);
  const [delay, setDelay] = useState<{ date: string; minutes: number } | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [ready, setReady] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);

  /* -------------------------------------------------------------- */
  /* Bootstrap                                                       */
  /* -------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Register notification channels. External ones report honestly as
      // unconfigured until a provider is wired up in Settings.
      notificationBus.register(new InAppChannel());
      notificationBus.register(
        new SmsChannel(settings.notifications.sms),
      );
      notificationBus.register(new WhatsAppChannel(settings.notifications.whatsapp));
      notificationBus.register(new PushChannel(settings.notifications.push));

      const stored = await repository.current.load();
      if (cancelled) return;

      if (stored) {
        setSettings({
          ...DEFAULT_CLINIC_SETTINGS,
          ...stored.settings,
          eta: { ...DEFAULT_CLINIC_SETTINGS.eta, ...stored.settings?.eta },
        });
        setAppointments(stored.appointments ?? []);
        setPatients(stored.patients ?? []);
        setStaff(stored.staff ?? []);
        setDelay(stored.clinicDelay ?? null);
        setDemoMode(Boolean((stored as ClinicSnapshot & { demoMode?: boolean }).demoMode));
      } else {
        // First run: seed the staff accounts so the clinic can sign in.
        const seeded = await Promise.all([
          createStaffAccount({
            name: 'DR M. KATTOU',
            login: 'dr.kattou',
            role: 'doctor',
            secret: DEFAULT_STAFF_PASSWORD,
          }),
          createStaffAccount({
            name: 'Réception',
            login: 'reception',
            role: 'receptionist',
            secret: DEFAULT_STAFF_PASSWORD,
          }),
          createStaffAccount({
            name: 'Administration',
            login: 'admin',
            role: 'owner',
            secret: DEFAULT_STAFF_PASSWORD,
          }),
        ]);
        setStaff(seeded);
      }
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
    // Settings are only read for channel registration on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Persist on every meaningful change. */
  const persist = useCallback(
    async (next: {
      settings: ClinicSettings;
      appointments: Appointment[];
      patients: Patient[];
      staff: StaffAccount[];
      delay: { date: string; minutes: number } | null;
      demo: boolean;
    }) => {
      await repository.current.save({
        version: SCHEMA_VERSION,
        settings: next.settings,
        appointments: next.appointments,
        patients: next.patients,
        staff: next.staff,
        clinicDelay: next.delay,
        ...(next.demo ? { demoMode: true } : {}),
      } as ClinicSnapshot);
    },
    [],
  );

  useEffect(() => {
    if (!ready) return;
    void persist({ settings, appointments, patients, staff, delay, demo: demoMode });
  }, [ready, settings, appointments, patients, staff, delay, demoMode, persist]);

  /* Notification centre subscription. */
  useEffect(() => {
    return notificationBus.subscribe((record) => {
      setNotifications((list) => [record, ...list].slice(0, 60));
    });
  }, []);

  /* -------------------------------------------------------------- */
  /* Live clock — drives waiting durations and ETA refresh           */
  /* -------------------------------------------------------------- */

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);

  const today = useMemo(() => todayISO(now), [now]);
  const clinicDelayMinutes = delay && delay.date === today ? delay.minutes : 0;

  const snapshotFor = useCallback(
    (date: string) =>
      buildQueueSnapshot(
        appointments,
        date,
        now,
        delay && delay.date === date ? delay.minutes : 0,
      ),
    [appointments, now, delay],
  );

  const snapshot = useMemo(() => snapshotFor(today), [snapshotFor, today]);

  const metrics = useMemo(() => computeHistoryMetrics(appointments), [appointments]);
  const measured = useMemo(() => measuredAveragesForEta(metrics), [metrics]);

  const etaFor = useCallback(
    (appointment: Appointment) =>
      etaForAppointment(appointment, {
        snapshot: snapshotFor(appointment.date),
        etaConfig: settings.eta,
        measuredAverages: measured,
        now,
      }),
    [snapshotFor, settings.eta, measured, now],
  );

  /* -------------------------------------------------------------- */
  /* Queue milestone notifications (3 ahead / 1 ahead / next)        */
  /* -------------------------------------------------------------- */

  const emitted = useRef<Map<string, Set<NotificationEvent>>>(new Map());

  useEffect(() => {
    for (const entry of snapshot.waiting) {
      const appointment = appointments.find((a) => a.id === entry.appointmentId);
      if (!appointment) continue;
      const eta = etaForAppointment(appointment, {
        snapshot,
        etaConfig: settings.eta,
        measuredAverages: measured,
        now,
      });
      if (!eta) continue;

      const ahead = eta.patientsAhead;
      const milestone: NotificationEvent | null =
        ahead === 0
          ? 'patient_is_next'
          : ahead === 1
            ? 'one_patient_remaining'
            : ahead === 3
              ? 'three_patients_remaining'
              : null;
      if (!milestone) continue;

      const seen = emitted.current.get(appointment.id) ?? new Set<NotificationEvent>();
      if (seen.has(milestone)) continue;
      seen.add(milestone);
      emitted.current.set(appointment.id, seen);

      void notificationBus.emit({
        event: milestone,
        appointmentRef: appointment.ref,
        patientName: appointment.patientName,
        phoneInternational: appointment.patientPhone,
        title: t(`notification.${milestone}`),
        body:
          milestone === 'patient_is_next'
            ? t('queue.comeToClinic')
            : t('queue.remoteBody'),
        data: {
          ref: appointment.ref,
          queueNumber: appointment.queueNumber ?? 0,
          patientsAhead: ahead,
          etaFrom: eta.fromTime,
          etaTo: eta.toTime,
        },
      });
    }
  }, [snapshot, appointments, settings.eta, measured, now, etaFor, t]);

  /* -------------------------------------------------------------- */
  /* Mutations                                                       */
  /* -------------------------------------------------------------- */

  const touch = (a: Appointment, actor: string, action: string, detail?: string): Appointment => ({
    ...a,
    updatedAt: new Date().toISOString(),
    history: [...a.history, { at: new Date().toISOString(), actor, action, detail }],
  });

  const upsertPatient = useCallback(
    (fullName: string, phone: string, list: Patient[]): { patient: Patient; list: Patient[] } => {
      const existing = list.find((p) => p.phone === phone);
      if (existing) {
        return { patient: { ...existing, fullName }, list };
      }
      const patient: Patient = {
        id: shortId('pat'),
        fullName,
        phone,
        createdAt: new Date().toISOString(),
        cancellationCount: 0,
        noShowCount: 0,
      };
      return { patient, list: [...list, patient] };
    },
    [],
  );

  const book = useCallback<ClinicApi['book']>(
    async (input) => {
      const name = cleanName(input.fullName);
      const nameError = validateName(name);
      if (nameError) return { ok: false, error: nameError };

      const phone = normaliseAlgerianPhone(input.phone);
      if (!phone) return { ok: false, error: validatePhone(input.phone) ?? 'phone_invalid' };

      const dateError = validateDate(input.date, settings.bookingWindow.horizonDays);
      if (dateError) return { ok: false, error: dateError };

      if (!settings.bookingWindow.openWeekdays.includes(weekdayOf(input.date))) {
        return { ok: false, error: 'closedDay' };
      }

      const existing = appointments.filter(
        (a) => a.date === input.date && a.slot === input.slot && a.status !== 'cancelled',
      );
      if (existing.length >= settings.bookingWindow.maxPerSlot) {
        return { ok: false, error: 'slotUnavailable' };
      }

      const { patient, list: nextPatients } = upsertPatient(name, phone, patients);

      const nowIso = new Date().toISOString();
      const appointment: Appointment = {
        id: uuid(),
        ref: bookingReference(),
        token: capabilityToken(),
        patientId: patient.id,
        patientName: name,
        patientPhone: phone,
        serviceId: input.serviceId,
        type: 'scheduled',
        status: 'confirmed',
        date: input.date,
        slot: input.slot,
        queueNumber: null,
        checkedInAt: null,
        consultationStartedAt: null,
        completedAt: null,
        waitingMode: null,
        createdAt: nowIso,
        updatedAt: nowIso,
        history: [
          { at: nowIso, actor: 'patient', action: 'booked', detail: `${input.date} ${input.slot}` },
          { at: nowIso, actor: 'system', action: 'confirmed' },
        ],
      };

      setPatients(nextPatients);
      setAppointments((list) => [...list, appointment]);

      await notificationBus.emit({
        event: 'appointment_confirmed',
        appointmentRef: appointment.ref,
        patientName: name,
        phoneInternational: phone,
        title: t('notification.appointment_confirmed'),
        body: `${serviceById(input.serviceId)[lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr' : 'en']} — ${formatDate(input.date)} ${input.slot}`,
        data: {
          ref: appointment.ref,
          date: appointment.date,
          slot: appointment.slot ?? '',
          service: serviceById(input.serviceId).code,
        },
      });

      return { ok: true, appointment };
    },
    [appointments, patients, settings.bookingWindow, upsertPatient, t, lang, formatDate],
  );

  const mutate = useCallback(
    (
      id: string,
      _actor: string,
      updater: (a: Appointment) => Appointment,
      options?: { event?: NotificationEvent; title?: string; body?: string },
    ) => {
      let updated: Appointment | undefined;
      setAppointments((list) =>
        list.map((a) => {
          if (a.id !== id) return a;
          updated = updater(a);
          return updated;
        }),
      );

      if (updated && options?.event) {
        const appointment = updated as Appointment;
        void notificationBus.emit({
          event: options.event,
          appointmentRef: appointment.ref,
          patientName: appointment.patientName,
          phoneInternational: appointment.patientPhone,
          title: options.title ?? t(`notification.${options.event}`),
          body: options.body ?? '',
          data: { ref: appointment.ref, status: appointment.status },
        });
      }
      return updated;
    },
    [t],
  );

  const cancelAppointment = useCallback<ClinicApi['cancelAppointment']>(
    async (id, actor) => {
      const target = appointments.find((a) => a.id === id);
      if (!target) return { ok: false, error: 'notFound' };
      if (target.status === 'completed' || target.status === 'in_consultation') {
        return { ok: false, error: 'actionsBlocked' };
      }
      mutate(
        id,
        actor,
        (a) =>
          touch(
            { ...a, status: 'cancelled', waitingMode: null, queueNumber: a.queueNumber },
            actor,
            'cancelled',
          ),
        { event: 'appointment_cancelled' },
      );
      setPatients((list) =>
        list.map((p) =>
          p.id === target.patientId ? { ...p, cancellationCount: p.cancellationCount + 1 } : p,
        ),
      );
      return { ok: true };
    },
    [appointments, mutate],
  );

  const requestReschedule = useCallback<ClinicApi['requestReschedule']>(
    async (id, actor) => {
      const updated = mutate(id, actor, (a) =>
        touch(
          {
            ...a,
            operationalNote: cleanNote(
              `${a.operationalNote ? `${a.operationalNote} · ` : ''}reschedule_requested`,
            ),
          },
          actor,
          'reschedule_requested',
        ),
      );
      return updated ? { ok: true, appointment: updated } : { ok: false, error: 'notFound' };
    },
    [mutate],
  );

  const checkIn = useCallback<ClinicApi['checkIn']>(
    async (id, actor) => {
      const target = appointments.find((a) => a.id === id);
      if (!target) return { ok: false, error: 'notFound' };
      if (target.status === 'completed' || target.status === 'cancelled') {
        return { ok: false, error: 'actionsBlocked' };
      }
      const number = target.queueNumber ?? nextQueueNumber(appointments, target.date);
      const updated = mutate(id, actor, (a) =>
        touch(
          {
            ...a,
            status: 'waiting',
            queueNumber: number,
            checkedInAt: a.checkedInAt ?? new Date().toISOString(),
            waitingMode: a.waitingMode ?? 'inside',
          },
          actor,
          'checked_in',
          `#${number}`,
        ),
        { event: 'patient_checked_in', body: `#${number}` },
      );
      return updated ? { ok: true, appointment: updated } : { ok: false, error: 'notFound' };
    },
    [appointments, mutate],
  );

  const setWaitingMode = useCallback<ClinicApi['setWaitingMode']>(
    async (id, mode) => {
      const updated = mutate(id, 'patient', (a) =>
        touch({ ...a, waitingMode: mode }, 'patient', 'waiting_mode', mode),
      );
      return updated ? { ok: true, appointment: updated } : { ok: false, error: 'notFound' };
    },
    [mutate],
  );

  const startConsultation = useCallback<ClinicApi['startConsultation']>(
    async (id, actor) => {
      // Only one consultation runs at a time per queue.
      setAppointments((list) =>
        list.map((a) =>
          a.status === 'in_consultation' && a.id !== id
            ? touch({ ...a, status: 'waiting' }, actor, 'returned_to_waiting')
            : a,
        ),
      );
      const updated = mutate(id, actor, (a) =>
        touch(
          {
            ...a,
            status: 'in_consultation',
            consultationStartedAt: new Date().toISOString(),
            checkedInAt: a.checkedInAt ?? new Date().toISOString(),
            queueNumber: a.queueNumber ?? nextQueueNumber(appointments, a.date),
          },
          actor,
          'consultation_started',
        ),
      );
      return updated ? { ok: true, appointment: updated } : { ok: false, error: 'notFound' };
    },
    [appointments, mutate],
  );

  const completeConsultation = useCallback<ClinicApi['completeConsultation']>(
    async (id, actor, durationMinutes) => {
      const target = appointments.find((a) => a.id === id);
      if (!target) return { ok: false, error: 'notFound' };

      const measured =
        durationMinutes ??
        (target.consultationStartedAt
          ? Math.max(
              1,
              Math.round(
                (Date.now() - new Date(target.consultationStartedAt).getTime()) / 60000,
              ),
            )
          : settings.eta.serviceDurations[target.serviceId]);

      const updated = mutate(id, actor, (a) =>
        touch(
          {
            ...a,
            status: 'completed',
            completedAt: new Date().toISOString(),
            consultationStartedAt: a.consultationStartedAt ?? new Date().toISOString(),
            measuredDurationMinutes: measured,
          },
          actor,
          'completed',
          `${measured} min`,
        ),
      );
      return updated ? { ok: true, appointment: updated } : { ok: false, error: 'notFound' };
    },
    [appointments, mutate, settings.eta.serviceDurations],
  );

  const skipAppointment = useCallback<ClinicApi['skipAppointment']>(
    async (id, actor) => {
      const updated = mutate(id, actor, (a) => touch({ ...a, status: 'skipped' }, actor, 'skipped'));
      return updated ? { ok: true, appointment: updated } : { ok: false, error: 'notFound' };
    },
    [mutate],
  );

  const markEmergency = useCallback<ClinicApi['markEmergency']>(
    async (id, actor) => {
      const updated = mutate(id, actor, (a) =>
        touch(
          {
            ...a,
            status: 'emergency',
            type: 'emergency',
            checkedInAt: a.checkedInAt ?? new Date().toISOString(),
            queueNumber: a.queueNumber ?? nextQueueNumber(appointments, a.date),
          },
          actor,
          'marked_emergency',
        ),
        { event: 'queue_approaching', title: t('notification.doctor_delay'), body: t('queue.emergencyNotice') },
      );
      return updated ? { ok: true, appointment: updated } : { ok: false, error: 'notFound' };
    },
    [appointments, mutate, t],
  );

  const markNoShow = useCallback<ClinicApi['markNoShow']>(
    async (id, actor) => {
      const target = appointments.find((a) => a.id === id);
      mutate(id, actor, (a) => touch({ ...a, status: 'no_show' }, actor, 'no_show'));
      if (target) {
        setPatients((list) =>
          list.map((p) =>
            p.id === target.patientId ? { ...p, noShowCount: p.noShowCount + 1 } : p,
          ),
        );
      }
      return target ? { ok: true } : { ok: false, error: 'notFound' };
    },
    [appointments, mutate],
  );

  const setStatus = useCallback<ClinicApi['setStatus']>(
    async (id, status, actor) => {
      if (status === 'cancelled') return cancelAppointment(id, actor);
      if (status === 'no_show') return markNoShow(id, actor);
      if (status === 'in_consultation') return startConsultation(id, actor);
      if (status === 'completed') return completeConsultation(id, actor);
      if (status === 'emergency') return markEmergency(id, actor);
      if (status === 'skipped') return skipAppointment(id, actor);

      const updated = mutate(id, actor, (a) =>
        touch(
          {
            ...a,
            status,
            queueNumber:
              status === 'waiting' && a.queueNumber === null
                ? nextQueueNumber(appointments, a.date)
                : a.queueNumber,
            checkedInAt:
              (status === 'waiting' || status === 'arrived') && !a.checkedInAt
                ? new Date().toISOString()
                : a.checkedInAt,
          },
          actor,
          `status_${status}`,
        ),
      );
      return updated ? { ok: true, appointment: updated } : { ok: false, error: 'notFound' };
    },
    [
      appointments,
      cancelAppointment,
      completeConsultation,
      markEmergency,
      markNoShow,
      mutate,
      skipAppointment,
      startConsultation,
    ],
  );

  const addWalkIn = useCallback<ClinicApi['addWalkIn']>(
    async ({ fullName, phone, type, serviceId, actor }) => {
      const name = cleanName(fullName);
      const nameError = validateName(name);
      if (nameError) return { ok: false, error: nameError };
      const normalised = normaliseAlgerianPhone(phone);
      if (!normalised) return { ok: false, error: 'phone_invalid' };

      const { patient, list: nextPatients } = upsertPatient(name, normalised, patients);
      const nowIso = new Date().toISOString();
      const date = today;

      const appointment: Appointment = {
        id: uuid(),
        ref: bookingReference(),
        token: capabilityToken(),
        patientId: patient.id,
        patientName: name,
        patientPhone: normalised,
        serviceId,
        type,
        status: type === 'emergency' ? 'emergency' : 'waiting',
        date,
        slot: null,
        queueNumber: nextQueueNumber(appointments, date),
        checkedInAt: nowIso,
        consultationStartedAt: null,
        completedAt: null,
        waitingMode: 'inside',
        createdAt: nowIso,
        updatedAt: nowIso,
        history: [{ at: nowIso, actor, action: 'walk_in_created', detail: type }],
      };

      setPatients(nextPatients);
      setAppointments((list) => [...list, appointment]);
      return { ok: true, appointment };
    },
    [appointments, patients, today, upsertPatient],
  );

  /** "المريض التالي" — finishes the current consultation and starts the next. */
  const callNext = useCallback<ClinicApi['callNext']>(
    async (actor) => {
      const current = snapshot.current;
      if (current) {
        await completeConsultation(current.appointmentId, actor);
      }
      const next = snapshot.next ?? snapshot.waiting.find((e) => e.status !== 'in_consultation');
      if (!next) return current ? { ok: true } : { ok: false, error: 'notFound' };
      return startConsultation(next.appointmentId, actor);
    },
    [snapshot, completeConsultation, startConsultation],
  );

  const declareDelay = useCallback<ClinicApi['declareDelay']>(
    async (minutes, actor) => {
      setDelay({ date: today, minutes });
      await notificationBus.emit({
        event: 'doctor_delay',
        appointmentRef: null,
        patientName: null,
        phoneInternational: null,
        title: t('notification.doctor_delay'),
        body: t('queue.delayNotice'),
        data: { minutes },
      });
      void actor;
      return { ok: true };
    },
    [today, t],
  );

  const clearDelay = useCallback<ClinicApi['clearDelay']>(
    async (actor) => {
      setDelay(null);
      void actor;
      return { ok: true };
    },
    [],
  );

  const updateSettings = useCallback<ClinicApi['updateSettings']>(async (patch) => {
    setSettings((current) => ({
      ...current,
      ...patch,
      eta: { ...current.eta, ...(patch.eta ?? {}) },
      bookingWindow: { ...current.bookingWindow, ...(patch.bookingWindow ?? {}) },
      notifications: { ...current.notifications, ...(patch.notifications ?? {}) },
      openingHours: { ...current.openingHours, ...(patch.openingHours ?? {}) },
    }));
  }, []);

  const addStaff = useCallback<ClinicApi['addStaff']>(async (input) => {
    if (input.login.trim().length < 3) return { ok: false, error: 'required' };
    if (input.secret.length < 8) return { ok: false, error: 'required' };
    const account = await createStaffAccount({
      name: input.name,
      login: input.login,
      role: input.role,
      secret: input.secret,
    });
    setStaff((list) => [...list, account]);
    return { ok: true };
  }, []);

  const toggleStaff = useCallback(async (id: string, active: boolean) => {
    setStaff((list) => list.map((s) => (s.id === id ? { ...s, active } : s)));
  }, []);

  /* -------------------------------------------------------------- */
  /* Read helpers                                                    */
  /* -------------------------------------------------------------- */

  const findByToken = useCallback(
    (token: string) => appointments.find((a) => a.token === token),
    [appointments],
  );

  const findByRefAndPhone = useCallback(
    (ref: string, phone: string) => {
      const normalised = normaliseAlgerianPhone(phone);
      if (!normalised) return undefined;
      return appointments.find(
        (a) => a.ref.toLowerCase() === ref.trim().toLowerCase() && a.patientPhone === normalised,
      );
    },
    [appointments],
  );

  const appointmentsForDate = useCallback(
    (date: string) =>
      appointments
        .filter((a) => a.date === date)
        .sort((a, b) => {
          const order = (x: Appointment) =>
            x.status === 'in_consultation'
              ? 0
              : x.status === 'waiting' || x.status === 'emergency'
                ? 1
                : x.status === 'booked' || x.status === 'confirmed'
                  ? 2
                  : 3;
          const byOrder = order(a) - order(b);
          if (byOrder !== 0) return byOrder;
          return (a.slot ?? '99:99').localeCompare(b.slot ?? '99:99');
        }),
    [appointments],
  );

  const isBookableDay = useCallback(
    (date: string) => settings.bookingWindow.openWeekdays.includes(weekdayOf(date)),
    [settings.bookingWindow.openWeekdays],
  );

  const remainingForSlot = useCallback(
    (date: string, slot: string) => {
      const taken = appointments.filter(
        (a) => a.date === date && a.slot === slot && a.status !== 'cancelled',
      ).length;
      return Math.max(0, settings.bookingWindow.maxPerSlot - taken);
    },
    [appointments, settings.bookingWindow.maxPerSlot],
  );

  const slotsForDate = useCallback(
    (date: string) => {
      const { firstSlot, lastSlot, slotStepMinutes, maxPerSlot } = settings.bookingWindow;
      const out: { time: string; remaining: number; capacity: number }[] = [];
      const [fh, fm] = firstSlot.split(':').map(Number);
      const [lh, lm] = lastSlot.split(':').map(Number);
      const start = fh * 60 + fm;
      const end = lh * 60 + lm;
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const isToday = date === today;
      for (let m = start; m <= end; m += slotStepMinutes) {
        const time = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
        // Slots that already started today are not offered.
        if (isToday && m <= nowMinutes) continue;
        out.push({ time, remaining: remainingForSlot(date, time), capacity: maxPerSlot });
      }
      return out;
    },
    [settings.bookingWindow, remainingForSlot, now, today],
  );

  /* -------------------------------------------------------------- */
  /* Data management                                                 */
  /* -------------------------------------------------------------- */

  const loadDemoData = useCallback(async () => {
    const { appointments: demo, patients: demoPatients } = createDemoAppointments(today);
    setAppointments((list) => [...list, ...demo]);
    setPatients((list) => {
      const byPhone = new Map(list.map((p) => [p.phone, p]));
      for (const p of demoPatients) if (!byPhone.has(p.phone)) byPhone.set(p.phone, p);
      return [...byPhone.values()];
    });
    setDemoMode(true);
  }, [today]);

  const resetData = useCallback(async () => {
    setAppointments([]);
    setPatients([]);
    setDelay(null);
    setDemoMode(false);
    emitted.current.clear();
    notificationBus.clear();
    setNotifications([]);
    await repository.current.clear();
  }, []);

  const exportData = useCallback(
    () =>
      JSON.stringify(
        {
          version: SCHEMA_VERSION,
          exportedAt: new Date().toISOString(),
          settings: { ...settings, doctorPhotoDataUrl: settings.doctorPhotoDataUrl ? '[omitted]' : null },
          appointments,
          patients,
          clinicDelay: delay,
        },
        null,
        2,
      ),
    [settings, appointments, patients, delay],
  );

  const value = useMemo<ClinicApi>(
    () => ({
      ready,
      settings,
      appointments,
      patients,
      staff,
      clinicDelayMinutes,
      demoMode,
      today,
      snapshot,
      snapshotFor,
      metrics,
      etaFor,
      findByToken,
      findByRefAndPhone,
      appointmentsForDate,
      remainingForSlot,
      slotsForDate,
      isBookableDay,
      book,
      cancelAppointment,
      requestReschedule,
      checkIn,
      setWaitingMode,
      startConsultation,
      completeConsultation,
      skipAppointment,
      markEmergency,
      markNoShow,
      setStatus,
      addWalkIn,
      callNext,
      declareDelay,
      clearDelay,
      updateSettings,
      addStaff,
      toggleStaff,
      notifications,
      loadDemoData,
      resetData,
      exportData,
    }),
    [
      ready,
      settings,
      appointments,
      patients,
      staff,
      clinicDelayMinutes,
      demoMode,
      today,
      snapshot,
      snapshotFor,
      metrics,
      etaFor,
      findByToken,
      findByRefAndPhone,
      appointmentsForDate,
      remainingForSlot,
      slotsForDate,
      isBookableDay,
      book,
      cancelAppointment,
      requestReschedule,
      checkIn,
      setWaitingMode,
      startConsultation,
      completeConsultation,
      skipAppointment,
      markEmergency,
      markNoShow,
      setStatus,
      addWalkIn,
      callNext,
      declareDelay,
      clearDelay,
      updateSettings,
      addStaff,
      toggleStaff,
      notifications,
      loadDemoData,
      resetData,
      exportData,
    ],
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): ClinicApi {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic must be used inside <ClinicProvider>');
  return ctx;
}

/** Convenience helper for the many places that need a translated error. */
export function useErrorLabel() {
  const { t } = useI18n();
  const toast = useToast();
  return useCallback(
    (code: string | undefined, fallbackTitle?: string) => {
      const known = [
        'name_too_short',
        'name_invalid',
        'phone_invalid',
        'date_invalid',
        'date_past',
        'date_out_of_range',
        'slot_invalid',
        'slotUnavailable',
        'notFound',
        'required',
      ];
      const key = code ?? '';
      const message = known.includes(key)
        ? t(`errors.${key as 'name_too_short'}`)
        : key === 'closedDay'
          ? t('booking.closedDay')
          : key === 'actionsBlocked'
            ? t('appointment.actionsBlocked')
            : t('errors.generic');
      if (fallbackTitle) {
        toast.push({ tone: 'danger', title: fallbackTitle, body: message });
      }
      return message;
    },
    [t, toast],
  );
}
