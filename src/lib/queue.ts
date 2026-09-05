import type {
  Appointment,
  AppointmentStatus,
  ClinicHistoryMetrics,
  EtaConfig,
  EtaResult,
  QueueEntry,
  QueueSnapshot,
  ServiceAverage,
  ServiceId,
} from './types';
import { computeEta } from './eta';
import { minutesBetween, minutesBetweenISO, weekdayOf } from './time';

/**
 * LIVE QUEUE — the product's signature feature.
 *
 * Ordering rule (explicit and explainable to staff):
 *   1. Emergencies flagged by clinic staff come first (staff decision only,
 *      never automatic — see `src/lib/emergency.ts`).
 *   2. Everyone else follows their printed ticket number, i.e. check-in order.
 * Only appointments that have physically checked in are in the live queue.
 */

const TYPE_RANK: Record<string, number> = {
  emergency: 0,
  walkin: 1,
  scheduled: 1,
};

export const IN_QUEUE_STATUSES: AppointmentStatus[] = [
  'arrived',
  'waiting',
  'in_consultation',
  'emergency',
];

export function isInQueue(status: AppointmentStatus): boolean {
  return IN_QUEUE_STATUSES.includes(status);
}

export function isOpenStatus(status: AppointmentStatus): boolean {
  return (
    status === 'booked' ||
    status === 'confirmed' ||
    status === 'arrived' ||
    status === 'waiting' ||
    status === 'in_consultation' ||
    status === 'emergency' ||
    status === 'skipped'
  );
}

export function toEntry(a: Appointment, now: Date): QueueEntry {
  return {
    appointmentId: a.id,
    ref: a.ref,
    queueNumber: a.queueNumber ?? 0,
    patientName: a.patientName,
    patientPhone: a.patientPhone,
    serviceId: a.serviceId,
    type: a.type,
    status: a.status,
    slot: a.slot,
    checkedInAt: a.checkedInAt,
    waitingMode: a.waitingMode,
    waitingMinutes: a.checkedInAt ? minutesBetween(a.checkedInAt, now) : 0,
    inProgressMinutes: a.consultationStartedAt ? minutesBetween(a.consultationStartedAt, now) : 0,
  };
}

/** Deterministic ordering used everywhere: staff list, patient queue, ETA. */
export function compareQueue(a: QueueEntry, b: QueueEntry): number {
  const ra = TYPE_RANK[a.type] ?? 1;
  const rb = TYPE_RANK[b.type] ?? 1;
  if (ra !== rb) return ra - rb;
  if (a.queueNumber !== b.queueNumber) return a.queueNumber - b.queueNumber;
  return a.ref.localeCompare(b.ref);
}

export function buildQueueSnapshot(
  appointments: Appointment[],
  date: string,
  now: Date,
  clinicDelayMinutes = 0,
): QueueSnapshot {
  const day = appointments.filter((a) => a.date === date);
  const queued = day
    .filter((a) => isInQueue(a.status))
    .map((a) => toEntry(a, now))
    .sort(compareQueue);

  const current = queued.find((e) => e.status === 'in_consultation') ?? null;
  const waiting = queued.filter((e) => e.status !== 'in_consultation');
  const next = waiting[0] ?? null;

  return {
    date,
    generatedAt: now.toISOString(),
    entries: queued,
    current,
    next,
    waiting,
    completedCount: day.filter((a) => a.status === 'completed').length,
    cancelledCount: day.filter((a) => a.status === 'cancelled').length,
    noShowCount: day.filter((a) => a.status === 'no_show').length,
    totalScheduled: day.length,
    clinicDelayMinutes,
    emergencyPending: waiting.filter((e) => e.type === 'emergency').length,
  };
}

/** Patients standing between the current consultation and this patient. */
export function patientsAheadOf(snapshot: QueueSnapshot, appointmentId: string): number {
  const idx = snapshot.entries.findIndex((e) => e.appointmentId === appointmentId);
  if (idx < 0) return 0;
  return snapshot.entries.slice(0, idx).filter((e) => e.status !== 'in_consultation').length;
}

export interface EtaContext {
  snapshot: QueueSnapshot;
  etaConfig: EtaConfig;
  /**
   * Historical average per service, measured by the clinic. When absent the
   * engine falls back to the editable planning duration — never invented data.
   */
  measuredAverages: Partial<Record<ServiceId, number>>;
  now: Date;
}

export function etaForAppointment(
  appointment: Appointment,
  ctx: EtaContext,
): EtaResult | null {
  if (!isInQueue(appointment.status)) return null;

  const ahead = patientsAheadOf(ctx.snapshot, appointment.id);
  const inProgress = ctx.snapshot.current?.status === 'in_consultation' ? ctx.snapshot.current : null;

  // Ahead-of-me patients: plan with the average of the services actually ahead.
  const aheadEntries = ctx.snapshot.entries
    .slice(0, ctx.snapshot.entries.findIndex((e) => e.appointmentId === appointment.id))
    .filter((e) => e.status !== 'in_consultation');

  const averageDurationMinutes =
    aheadEntries.length > 0
      ? aheadEntries.reduce(
          (sum, e) => sum + planningMinutes(e.serviceId, ctx),
          0,
        ) / aheadEntries.length
      : planningMinutes(appointment.serviceId, ctx);

  return computeEta({
    patientsAhead: ahead,
    averageDurationMinutes,
    currentPatientElapsedMinutes: inProgress ? inProgress.inProgressMinutes : null,
    currentPatientExpectedMinutes: inProgress
      ? planningMinutes(inProgress.serviceId, ctx)
      : null,
    clinicDelayMinutes: ctx.snapshot.clinicDelayMinutes,
    emergencyPending: aheadEntries.filter((e) => e.type === 'emergency').length,
    bufferMinutes: ctx.etaConfig.bufferMinutes,
    emergencyInterruptMinutes: ctx.etaConfig.emergencyInterruptMinutes,
    rangeSpreadMinutes: ctx.etaConfig.rangeSpreadMinutes,
    rangeSpreadRatio: ctx.etaConfig.rangeSpreadRatio,
    now: ctx.now,
  });
}

function planningMinutes(serviceId: ServiceId, ctx: EtaContext): number {
  const measured = ctx.measuredAverages[serviceId];
  if (typeof measured === 'number' && measured > 0) return measured;
  return ctx.etaConfig.serviceDurations[serviceId] ?? ctx.etaConfig.defaultConsultationMinutes;
}

/** Next ticket number for the day — printed at check-in. */
export function nextQueueNumber(appointments: Appointment[], date: string): number {
  const used = appointments
    .filter((a) => a.date === date && a.queueNumber !== null)
    .map((a) => a.queueNumber as number);
  return used.length === 0 ? 1 : Math.max(...used) + 1;
}

/* ------------------------------------------------------------------ */
/* History — computed only from measured records                       */
/* ------------------------------------------------------------------ */

/**
 * Everything here is derived from appointments the clinic actually processed.
 * A brand-new clinic returns `sampleSize: 0`, and the UI renders an empty
 * state instead of fabricated numbers.
 */
export function computeHistoryMetrics(appointments: Appointment[]): ClinicHistoryMetrics {
  const completed = appointments.filter((a) => a.status === 'completed');
  const measured = completed.filter(
    (a) => typeof a.measuredDurationMinutes === 'number' && a.measuredDurationMinutes! > 0,
  );

  const byService = new Map<ServiceId, number[]>();
  for (const a of measured) {
    const arr = byService.get(a.serviceId) ?? [];
    arr.push(a.measuredDurationMinutes as number);
    byService.set(a.serviceId, arr);
  }

  const averageDurationByService: ServiceAverage[] = [...byService.entries()]
    .map(([serviceId, values]) => ({
      serviceId,
      count: values.length,
      averageMinutes: Math.round(values.reduce((s, v) => s + v, 0) / values.length),
    }))
    .sort((a, b) => b.count - a.count);

  const waiting = completed.filter((a) => a.checkedInAt && a.consultationStartedAt);
  const waitingMinutes = waiting.map((a) =>
    minutesBetweenISO(a.checkedInAt as string, a.consultationStartedAt as string),
  );

  const delayed = completed.filter(
    (a) => a.slot && a.checkedInAt && a.consultationStartedAt,
  );
  const delayMinutes = delayed.map((a) => {
    const started = new Date(a.consultationStartedAt as string);
    const planned = hhmmOnDate(a.date, a.slot as string);
    return Math.max(0, Math.round((started.getTime() - planned.getTime()) / 60000));
  });

  const peak = new Map<number, number>();
  for (const a of completed) {
    const hour = a.consultationStartedAt
      ? new Date(a.consultationStartedAt).getHours()
      : a.slot
        ? Number(a.slot.slice(0, 2))
        : null;
    if (hour === null) continue;
    peak.set(hour, (peak.get(hour) ?? 0) + 1);
  }

  const days = new Map<number, number>();
  for (const a of appointments) {
    const w = weekdayOf(a.date);
    days.set(w, (days.get(w) ?? 0) + 1);
  }

  const finished =
    completed.length +
    appointments.filter((a) => a.status === 'cancelled').length +
    appointments.filter((a) => a.status === 'no_show').length;

  return {
    sampleSize: measured.length,
    appointments: appointments.length,
    completed: completed.length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    noShow: appointments.filter((a) => a.status === 'no_show').length,
    averageWaitingMinutes: waitingMinutes.length
      ? Math.round(waitingMinutes.reduce((s, v) => s + v, 0) / waitingMinutes.length)
      : null,
    averageVisitMinutes: measured.length
      ? Math.round(
          measured.reduce((s, a) => s + (a.measuredDurationMinutes as number), 0) /
            measured.length,
        )
      : null,
    averageDelayMinutes: delayMinutes.length
      ? Math.round(delayMinutes.reduce((s, v) => s + v, 0) / delayMinutes.length)
      : null,
    averageDurationByService,
    peakHours: [...peak.entries()]
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => b.count - a.count),
    busiestDays: [...days.entries()]
      .map(([weekday, count]) => ({ weekday, count }))
      .sort((a, b) => b.count - a.count),
    completionRate: finished > 0 ? completed.length / finished : null,
  };
}

function hhmmOnDate(date: string, hhmm: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = hhmm.split(':').map(Number);
  return new Date(y, m - 1, d, h, min, 0, 0);
}

/**
 * Per-service averages in the shape the ETA engine consumes.
 * Only services with at least `minSample` measured visits are used; anything
 * thinner falls back to the staff-edited planning value.
 */
export function measuredAveragesForEta(
  metrics: ClinicHistoryMetrics,
  minSample = 3,
): Partial<Record<ServiceId, number>> {
  const out: Partial<Record<ServiceId, number>> = {};
  for (const row of metrics.averageDurationByService) {
    if (row.count >= minSample) out[row.serviceId] = row.averageMinutes;
  }
  return out;
}
