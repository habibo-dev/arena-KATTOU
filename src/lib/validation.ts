import { isServiceId } from './clinic';
import type { ServiceId } from './types';

/**
 * Input validation. Everything crossing a boundary (booking form, staff forms,
 * URL params, storage hydration) is passed through here — no unchecked values
 * reach state.
 */

export const MAX_NAME = 90;
export const MAX_NOTE = 240;

export function cleanName(raw: string): string {
  // Letters (Arabic + Latin), spaces, hyphen, apostrophe. Control chars stripped.
  return raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/[<>{}[\]()/\\`$]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_NAME);
}

export function validateName(raw: string): string | null {
  const name = cleanName(raw);
  if (name.length < 3) return 'name_too_short';
  if (!/^[\p{L}\p{M}\s'’.\-]+$/u.test(name)) return 'name_invalid';
  return null;
}

/**
 * Algerian phone numbers. Accepts local mobile ("0558 41 80 73"), local
 * landline ("027 56 94 94") and international ("+213…", "00213…") forms.
 * Returns the normalised +213… form.
 */
export function normaliseAlgerianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;

  // Strip any international prefix down to the national number.
  let local = digits;
  if (digits.startsWith('00213')) local = digits.slice(5);
  else if (digits.startsWith('213')) local = digits.slice(3);
  else if (digits.startsWith('0')) local = digits.slice(1);

  // Mobile: 0[567] + 8 digits (9 after the leading zero).
  if (/^[567]\d{8}$/.test(local)) return `+213${local}`;
  // Landline: 0[1-4] + 7 digits (8 after the leading zero).
  if (/^[1-4]\d{7}$/.test(local)) return `+213${local}`;
  return null;
}

export function validatePhone(raw: string): string | null {
  return normaliseAlgerianPhone(raw) ? null : 'phone_invalid';
}

/** Display form used on screen: 0558 41 80 73 */
export function formatPhone(international: string): string {
  const d = international.replace(/\D/g, '');
  if (!d.startsWith('213') || d.length !== 12) return international;
  const local = `0${d.slice(3)}`;
  return `${local.slice(0, 4)} ${local.slice(4, 6)} ${local.slice(6, 8)} ${local.slice(8, 10)}`;
}

/** Last four digits only — for confirmation screens, never the full number. */
export function maskPhone(international: string): string {
  const d = international.replace(/\D/g, '');
  if (d.length < 4) return '••••';
  return `••• ${d.slice(-4)}`;
}

export function validateService(raw: string): ServiceId | null {
  return isServiceId(raw) ? (raw as ServiceId) : null;
}

export function validateDate(raw: string, horizonDays = 60): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return 'date_invalid';
  const d = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(d.getTime())) return 'date_invalid';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d < today) return 'date_past';
  const limit = new Date(today);
  limit.setDate(limit.getDate() + horizonDays);
  if (d > limit) return 'date_out_of_range';
  return null;
}

export function validateSlot(raw: string): string | null {
  return /^\d{2}:\d{2}$/.test(raw) ? null : 'slot_invalid';
}

export function cleanNote(raw: string): string {
  // eslint-disable-next-line no-control-regex
  return raw.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_NOTE);
}

/** Reject anything that is not a plain, positive, bounded integer. */
export function safeInt(raw: unknown, min: number, max: number, fallback: number): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.round(n);
  if (i < min || i > max) return fallback;
  return i;
}
