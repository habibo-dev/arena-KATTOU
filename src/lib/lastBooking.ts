/**
 * Convenience link back to the patient's own appointment on the same device.
 * Stores only the opaque capability token — no personal data in storage.
 */
const KEY = 'kattou.lastBooking.v1';

export function setLastBookingToken(token: string): void {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    /* private mode — the confirmation screen still shows the reference */
  }
}

export function getLastBookingToken(): string | null {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearLastBookingToken(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* no-op */
  }
}
