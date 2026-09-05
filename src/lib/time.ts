/**
 * Time helpers. All clinic-facing time is handled as *local* wall-clock
 * strings ("HH:MM") plus a "YYYY-MM-DD" date, because a waiting-room clock is
 * what patients read — not UTC offsets.
 */

export function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Format an "HH:MM" string (already local) — identity for our storage format. */
export function formatHHMM(hhmm: string): string {
  return hhmm;
}

export function parseHHMM(hhmm: string): { hours: number; minutes: number } | null {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) return null;
  const hours = Number(m[1]);
  const minutes = Number(m[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

export function hhmmToMinutes(hhmm: string): number {
  const parsed = parseHHMM(hhmm);
  if (!parsed) return 0;
  return parsed.hours * 60 + parsed.minutes;
}

export function minutesToHHMM(base: Date, addMinutes: number): string {
  const total = base.getHours() * 60 + base.getMinutes() + addMinutes;
  const wrapped = ((total % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(wrapped / 60))}:${pad2(wrapped % 60)}`;
}

export function nowHHMM(now = new Date()): string {
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function todayISO(now = new Date()): string {
  return toISODate(now);
}

export function addDays(iso: string, days: number): string {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

/** 0 = Sunday … 6 = Saturday (matches JS Date#getDay). */
export function weekdayOf(iso: string): number {
  return fromISODate(iso).getDay();
}

export function minutesBetween(fromISO: string, now: Date): number {
  return Math.max(0, Math.round((now.getTime() - new Date(fromISO).getTime()) / 60000));
}

export function minutesBetweenISO(fromISO: string, toISO: string): number {
  return Math.max(0, Math.round((new Date(toISO).getTime() - new Date(fromISO).getTime()) / 60000));
}

/** Human duration: "1 h 05" / "52 min". */
export function humanDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest === 0 ? `${h} h` : `${h} h ${pad2(rest)}`;
}

export function slotEnd(slot: string, durationMinutes: number): string {
  const total = hhmmToMinutes(slot) + durationMinutes;
  return `${pad2(Math.floor((total % 1440) / 60))}:${pad2(total % 60)}`;
}

/** Inclusive list of slots between two HH:MM bounds at a given step. */
export function slotsBetween(first: string, last: string, stepMinutes: number): string[] {
  const out: string[] = [];
  if (stepMinutes <= 0) return out;
  const start = hhmmToMinutes(first);
  const end = hhmmToMinutes(last);
  for (let t = start; t <= end; t += stepMinutes) {
    out.push(`${pad2(Math.floor(t / 60))}:${pad2(t % 60)}`);
  }
  return out;
}
