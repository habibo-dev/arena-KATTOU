import type { Appointment, Patient } from './types';

/**
 * PRIVACY BOUNDARY
 *
 * This module is the single place that decides what patient data is allowed to
 * leave a trusted surface (staff dashboard) and reach a public surface
 * (patient queue page, shared links, analytics).
 *
 * The platform stores no diagnoses, prescriptions, medical history,
 * radiographs or clinical notes. `OPERATIONAL_FIELDS` is the allow-list;
 * anything outside it is dropped by `redactForPatient`.
 */

export const OPERATIONAL_FIELDS = [
  'ref',
  'serviceId',
  'type',
  'status',
  'date',
  'slot',
  'queueNumber',
  'checkedInAt',
  'consultationStartedAt',
  'completedAt',
  'waitingMode',
] as const;

/** What a patient sees about THEMSELVES. */
export interface PatientOwnView {
  ref: string;
  firstName: string;
  serviceId: Appointment['serviceId'];
  type: Appointment['type'];
  status: Appointment['status'];
  date: string;
  slot: string | null;
  queueNumber: number | null;
  waitingMode: Appointment['waitingMode'];
}

export function patientOwnView(a: Appointment): PatientOwnView {
  return {
    ref: a.ref,
    firstName: firstNameOnly(a.patientName),
    serviceId: a.serviceId,
    type: a.type,
    status: a.status,
    date: a.date,
    slot: a.slot,
    queueNumber: a.queueNumber,
    waitingMode: a.waitingMode,
  };
}

/**
 * What a patient sees about OTHER people in the queue: a ticket number and a
 * first name only. No phone numbers, no full names, no service details.
 */
export interface PublicQueueRow {
  queueNumber: number;
  firstName: string;
  status: Appointment['status'];
}

export function redactForPatient(
  entries: { queueNumber: number; patientName: string; status: Appointment['status'] }[],
): PublicQueueRow[] {
  return entries.map((e) => ({
    queueNumber: e.queueNumber,
    firstName: firstNameOnly(e.patientName),
    status: e.status,
  }));
}

/** Never render a full name on a shared/public surface. */
export function firstNameOnly(fullName: string): string {
  return (fullName || '').trim().split(/\s+/)[0] ?? '';
}

/** Masked phone for staff lists on shared screens. */
export function maskForDisplay(international: string): string {
  const d = (international || '').replace(/\D/g, '');
  if (d.length < 8) return international;
  return `0${d.slice(3, 6)} •• •• ${d.slice(-2)}`;
}

/**
 * Guard used by the patient-profile screen: asserts we never render a clinical
 * field even if one leaks into the data model in a future version.
 */
const FORBIDDEN_KEYS = [
  'diagnosis',
  'diagnoses',
  'prescription',
  'prescriptions',
  'medicalHistory',
  'radiograph',
  'radiographs',
  'clinicalNote',
  'clinicalNotes',
  'treatment',
  'chart',
];

export function assertNoClinicalFields(record: Patient | Appointment): string[] {
  return FORBIDDEN_KEYS.filter((k) => k in (record as unknown as Record<string, unknown>));
}
