/**
 * Domain model for the clinic platform.
 *
 * Deliberate privacy decision: the platform stores **operational** data only
 * (identity for contact, appointment logistics, queue state). It stores no
 * diagnoses, prescriptions, medical history, radiographs or clinical notes.
 * See `src/lib/privacy.ts` for the enforced allow-list.
 */

export type LanguageCode = 'ar' | 'fr' | 'en';

export type Direction = 'rtl' | 'ltr';

export const SERVICE_IDS = [
  'odf',
  'soins',
  'protheses',
  'extractions',
  'radio',
  'blanchiment',
  'petite-chirurgie',
] as const;

export type ServiceId = (typeof SERVICE_IDS)[number];

/** How the appointment entered the system. */
export type AppointmentType = 'scheduled' | 'walkin' | 'emergency';

/** Full lifecycle status. Keep in sync with `STATUS_META` in `src/lib/status.ts`. */
export type AppointmentStatus =
  | 'booked'
  | 'confirmed'
  | 'arrived'
  | 'waiting'
  | 'in_consultation'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'skipped'
  | 'emergency';

export type WaitingMode = 'inside' | 'outside';

export type StaffRole = 'owner' | 'doctor' | 'receptionist';

export type NotificationEvent =
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'patient_checked_in'
  | 'queue_approaching'
  | 'three_patients_remaining'
  | 'one_patient_remaining'
  | 'patient_is_next'
  | 'doctor_delay'
  | 'appointment_cancelled';

export type NotificationChannelId = 'in_app' | 'sms' | 'whatsapp' | 'push';

export interface AuditEvent {
  at: string; // ISO timestamp
  actor: string; // 'patient' | 'reception' | 'doctor' | 'system'
  action: string;
  detail?: string;
}

export interface Patient {
  id: string;
  fullName: string;
  phone: string; // normalised E.164-ish, e.g. +213558418073
  createdAt: string;
  /** Operational counters only — never clinical data. */
  cancellationCount: number;
  noShowCount: number;
}

export interface Appointment {
  id: string;
  /** Short human-readable reference (e.g. KM-4821). Safe to say over the phone. */
  ref: string;
  /** Opaque, unguessable capability token. This is what appears in URLs. */
  token: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  serviceId: ServiceId;
  type: AppointmentType;
  status: AppointmentStatus;
  /** Local calendar date, YYYY-MM-DD (clinic time zone). */
  date: string;
  /** Booked slot HH:MM, or null for walk-ins / emergencies. */
  slot: string | null;
  /** Printed ticket number, assigned at check-in. */
  queueNumber: number | null;
  checkedInAt: string | null;
  consultationStartedAt: string | null;
  completedAt: string | null;
  waitingMode: WaitingMode | null;
  /** Operational note (logistics only). Explicitly NOT a clinical note. */
  operationalNote?: string;
  /** Minutes actually spent in consultation, measured by the clinic. */
  measuredDurationMinutes?: number;
  createdAt: string;
  updatedAt: string;
  history: AuditEvent[];
}

export interface StaffAccount {
  id: string;
  name: string;
  login: string;
  role: StaffRole;
  /** SHA-256 hex of `salt + secret`. The plaintext is never stored. */
  secretHash: string;
  salt: string;
  active: boolean;
  createdAt: string;
}

export interface ClinicSettings {
  doctorName: string;
  doctorTitle: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  wilaya: string;
  country: string;
  phones: { label: string; value: string; international: string }[];
  whatsappInternational: string;
  /**
   * Opening hours are NOT confirmed. Every entry defaults to `null` and the UI
   * renders "Horaires à confirmer" until the clinic fills them in.
   */
  openingHours: Record<number, OpeningHoursDay | null>;
  /** Google Maps query string — address text only, never invented coordinates. */
  mapsQuery: string;
  doctorPhotoDataUrl: string | null;
  eta: EtaConfig;
  /** Working window used to generate bookable slots. */
  bookingWindow: {
    firstSlot: string; // HH:MM
    lastSlot: string; // HH:MM
    slotStepMinutes: number;
    /** Weekday indexes (0=Sunday) that accept bookings. */
    openWeekdays: number[];
    maxPerSlot: number;
    horizonDays: number;
  };
  notifications: Record<NotificationChannelId, { enabled: boolean; provider: string | null }>;
}

export interface OpeningHoursDay {
  /** "09:00" | null when closed or unconfirmed */
  open: string | null;
  close: string | null;
}

export interface EtaConfig {
  /** Fallback consultation length when no measurement exists for a service. */
  defaultConsultationMinutes: number;
  /** Per-service planning durations (editable, no medical claims). */
  serviceDurations: Record<ServiceId, number>;
  /** Turnaround between two patients. */
  bufferMinutes: number;
  /** Minutes an emergency insertion pushes the rest of the queue. */
  emergencyInterruptMinutes: number;
  /** Minimum half-width of the displayed ETA range. */
  rangeSpreadMinutes: number;
  /** Proportional half-width (fraction of the computed wait). */
  rangeSpreadRatio: number;
}

/* ------------------------------------------------------------------ */
/* Derived read models                                                 */
/* ------------------------------------------------------------------ */

export interface QueueEntry {
  appointmentId: string;
  ref: string;
  queueNumber: number;
  patientName: string;
  patientPhone: string;
  serviceId: ServiceId;
  type: AppointmentType;
  status: AppointmentStatus;
  slot: string | null;
  checkedInAt: string | null;
  waitingMode: WaitingMode | null;
  /** Minutes since check-in. */
  waitingMinutes: number;
  /** Minutes elapsed inside the current consultation, if this entry is in progress. */
  inProgressMinutes: number;
}

export interface QueueSnapshot {
  date: string;
  generatedAt: string;
  /** Ordered by (emergency first, then ticket number). */
  entries: QueueEntry[];
  current: QueueEntry | null;
  next: QueueEntry | null;
  waiting: QueueEntry[];
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  totalScheduled: number;
  clinicDelayMinutes: number;
  emergencyPending: number;
}

export interface EtaResult {
  /** Lower bound, minutes from `now`. */
  fromMinutes: number;
  /** Upper bound, minutes from `now`. */
  toMinutes: number;
  /** Local HH:MM strings, preformatted for display. */
  fromTime: string;
  toTime: string;
  /** The ETA is ALWAYS a range — never a single guaranteed minute. */
  isRange: true;
  confidence: 'low' | 'medium' | 'high';
  patientsAhead: number;
  inputs: {
    patientsAhead: number;
    averageDurationMinutes: number;
    currentPatientRemainingMinutes: number;
    clinicDelayMinutes: number;
    emergencyPending: number;
  };
}

export interface DeliveryResult {
  channel: NotificationChannelId;
  delivered: boolean;
  /** Machine-readable reason when not delivered, e.g. 'channel_not_configured'. */
  reason?: string;
}

export interface NotificationRecord {
  id: string;
  at: string;
  event: NotificationEvent;
  appointmentRef: string | null;
  patientName: string | null;
  title: string;
  body: string;
  channel: NotificationChannelId;
  delivered: boolean;
  reason?: string;
}

export interface ServiceAverage {
  serviceId: ServiceId;
  count: number;
  averageMinutes: number;
}

export interface ClinicHistoryMetrics {
  /**
   * Number of *measured* completed visits behind these figures.
   * When 0 the UI must show an empty state — historical data is never fabricated.
   */
  sampleSize: number;
  appointments: number;
  completed: number;
  cancelled: number;
  noShow: number;
  averageWaitingMinutes: number | null;
  averageVisitMinutes: number | null;
  averageDelayMinutes: number | null;
  averageDurationByService: ServiceAverage[];
  peakHours: { hour: number; count: number }[];
  busiestDays: { weekday: number; count: number }[];
  completionRate: number | null;
}

export interface TimeSlot {
  time: string; // HH:MM
  remaining: number;
  capacity: number;
}
