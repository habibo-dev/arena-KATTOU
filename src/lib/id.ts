/** Identifier + capability-token generation. */

const REF_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no 0/O/1/I — phone-friendly

function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

export function uuid(): string {
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  const b = randomBytes(16);
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Short reference meant to be read aloud: e.g. "KM-7Q4H". */
export function bookingReference(prefix = 'KM'): string {
  const bytes = randomBytes(4);
  let out = '';
  for (let i = 0; i < 4; i += 1) out += REF_ALPHABET[bytes[i] % REF_ALPHABET.length];
  return `${prefix}-${out}`;
}

/**
 * Opaque capability token used in patient URLs.
 * 128 bits of entropy — the URL grants access, so it must be unguessable.
 */
export function capabilityToken(): string {
  const b = randomBytes(16);
  let out = '';
  for (let i = 0; i < b.length; i += 1) out += b[i].toString(16).padStart(2, '0');
  return out;
}

export function shortId(prefix: string): string {
  const b = randomBytes(4);
  return `${prefix}_${[...b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}
