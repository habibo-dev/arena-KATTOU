import type { AppointmentStatus, AppointmentType } from './types';

/**
 * One consistent visual language for status across the whole product.
 * `tone` maps to a small, closed set of colour pairs defined in `Badge`.
 */
export type StatusTone = 'neutral' | 'info' | 'success' | 'warn' | 'danger' | 'accent';

export const STATUS_META: Record<
  AppointmentStatus,
  { ar: string; fr: string; en: string; tone: StatusTone; solid?: boolean }
> = {
  booked: { ar: 'محجوز', fr: 'Réservé', en: 'Booked', tone: 'neutral' },
  confirmed: { ar: 'مؤكد', fr: 'Confirmé', en: 'Confirmed', tone: 'info' },
  arrived: { ar: 'وصل إلى العيادة', fr: 'Arrivé au cabinet', en: 'Checked in', tone: 'accent' },
  waiting: { ar: 'قيد الانتظار', fr: 'En attente', en: 'Waiting', tone: 'warn' },
  in_consultation: {
    ar: 'قيد العلاج',
    fr: 'En consultation',
    en: 'In consultation',
    tone: 'success',
    solid: true,
  },
  completed: { ar: 'مكتمل', fr: 'Terminé', en: 'Completed', tone: 'success' },
  cancelled: { ar: 'ملغى', fr: 'Annulé', en: 'Cancelled', tone: 'danger' },
  no_show: { ar: 'لم يحضر', fr: 'Absent', en: 'No-show', tone: 'danger' },
  skipped: { ar: 'تم تخطيه', fr: 'Passé', en: 'Skipped', tone: 'neutral' },
  emergency: { ar: 'حالة طارئة', fr: 'Urgence', en: 'Emergency', tone: 'danger', solid: true },
};

export const TYPE_META: Record<
  AppointmentType,
  { ar: string; fr: string; en: string; tone: StatusTone }
> = {
  scheduled: { ar: 'موعد', fr: 'Rendez-vous', en: 'Appointment', tone: 'info' },
  walkin: { ar: 'بدون موعد', fr: 'Sans rendez-vous', en: 'Walk-in', tone: 'neutral' },
  emergency: { ar: 'حالة طارئة', fr: 'Urgence', en: 'Emergency', tone: 'danger' },
};

export const STATUS_ORDER: AppointmentStatus[] = [
  'booked',
  'confirmed',
  'arrived',
  'waiting',
  'in_consultation',
  'completed',
  'cancelled',
  'no_show',
  'skipped',
  'emergency',
];

/** Which status transitions the UI is allowed to offer, per actor. */
export const STATUS_TRANSITIONS: Partial<Record<AppointmentStatus, AppointmentStatus[]>> = {
  booked: ['confirmed', 'arrived', 'cancelled', 'no_show', 'emergency'],
  confirmed: ['arrived', 'cancelled', 'no_show', 'emergency'],
  arrived: ['waiting', 'in_consultation', 'cancelled', 'no_show', 'emergency'],
  waiting: ['in_consultation', 'skipped', 'cancelled', 'no_show', 'emergency'],
  in_consultation: ['completed', 'skipped', 'emergency'],
  skipped: ['waiting', 'in_consultation', 'cancelled', 'no_show'],
  emergency: ['in_consultation', 'waiting', 'completed', 'cancelled'],
  completed: [],
  cancelled: [],
  no_show: [],
};

export function canTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return (STATUS_TRANSITIONS[from] ?? []).includes(to);
}

export function statusLabel(status: AppointmentStatus, lang: 'ar' | 'fr' | 'en'): string {
  return STATUS_META[status]?.[lang] ?? status;
}

export function typeLabel(type: AppointmentType, lang: 'ar' | 'fr' | 'en'): string {
  return TYPE_META[type]?.[lang] ?? type;
}
