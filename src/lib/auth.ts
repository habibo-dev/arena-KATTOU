import type { StaffAccount, StaffRole } from './types';
import { shortId, uuid } from './id';

/**
 * AUTHENTICATION + RBAC
 *
 * Local-first implementation: staff secrets are stored as SHA-256(salt+secret)
 * and the plaintext is never persisted. Sessions live in `sessionStorage`
 * (not `localStorage`) so a shared reception computer does not keep a
 * permanent login.
 *
 * Route guards in `src/components/guards/` re-check the capability on every
 * render — least privilege, not just hidden menu items.
 *
 * NOTE: a browser-only check is not a security boundary. When a backend is
 * connected, this module becomes the client of a real auth endpoint and the
 * capability checks are duplicated server-side.
 */

export type Capability =
  | 'appointments:read'
  | 'appointments:create'
  | 'appointments:update'
  | 'appointments:cancel'
  | 'queue:read'
  | 'queue:manage'
  | 'checkin:perform'
  | 'consultation:control'
  | 'emergency:flag'
  | 'delay:declare'
  | 'patients:read'
  | 'analytics:read'
  | 'settings:read'
  | 'settings:write'
  | 'staff:manage'
  | 'notifications:configure';

const OWNER: Capability[] = [
  'appointments:read',
  'appointments:create',
  'appointments:update',
  'appointments:cancel',
  'queue:read',
  'queue:manage',
  'checkin:perform',
  'consultation:control',
  'emergency:flag',
  'delay:declare',
  'patients:read',
  'analytics:read',
  'settings:read',
  'settings:write',
  'staff:manage',
  'notifications:configure',
];

const DOCTOR: Capability[] = [
  'appointments:read',
  'appointments:update',
  'queue:read',
  'queue:manage',
  'consultation:control',
  'emergency:flag',
  'patients:read',
  'delay:declare',
];

const RECEPTIONIST: Capability[] = [
  'appointments:read',
  'appointments:create',
  'appointments:update',
  'appointments:cancel',
  'queue:read',
  'queue:manage',
  'checkin:perform',
  'emergency:flag',
  'delay:declare',
  'patients:read',
];

export const ROLE_CAPABILITIES: Record<StaffRole, Capability[]> = {
  owner: OWNER,
  doctor: DOCTOR,
  receptionist: RECEPTIONIST,
};

export const ROLE_LABELS: Record<StaffRole, { ar: string; fr: string; en: string }> = {
  owner: { ar: 'المالك', fr: 'Propriétaire', en: 'Owner' },
  doctor: { ar: 'الطبيب', fr: 'Praticien', en: 'Doctor' },
  receptionist: { ar: 'الاستقبال', fr: 'Réception', en: 'Receptionist' },
};

export function can(role: StaffRole | null, capability: Capability): boolean {
  if (!role) return false;
  return ROLE_CAPABILITIES[role].includes(capability);
}

/* ------------------------------------------------------------------ */
/* Secret hashing (Web Crypto, with a synchronous test-safe fallback)  */
/* ------------------------------------------------------------------ */

export async function hashSecret(secret: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${salt}:${secret}`);
  if (globalThis.crypto?.subtle) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // FNV-1a — deterministic, non-cryptographic; only reached outside secure
  // contexts (e.g. plain http) and flagged as such in Settings.
  let h = 0x811c9dc5;
  for (let i = 0; i < data.length; i += 1) {
    h ^= data[i];
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `fnv${h.toString(16).padStart(8, '0')}`;
}

export function randomSalt(): string {
  return shortId('s').replace('s_', '');
}

export async function createStaffAccount(
  input: { name: string; login: string; role: StaffRole; secret: string },
  now = new Date(),
): Promise<StaffAccount> {
  const salt = randomSalt();
  return {
    id: uuid(),
    name: input.name.trim(),
    login: input.login.trim().toLowerCase(),
    role: input.role,
    salt,
    secretHash: await hashSecret(input.secret, salt),
    active: true,
    createdAt: now.toISOString(),
  };
}

export async function verifySecret(
  account: StaffAccount,
  secret: string,
): Promise<boolean> {
  if (!account.active) return false;
  const candidate = await hashSecret(secret, account.salt);
  // Constant-time-ish comparison.
  if (candidate.length !== account.secretHash.length) return false;
  let diff = 0;
  for (let i = 0; i < candidate.length; i += 1) {
    diff |= candidate.charCodeAt(i) ^ account.secretHash.charCodeAt(i);
  }
  return diff === 0;
}

/* ------------------------------------------------------------------ */
/* Session                                                             */
/* ------------------------------------------------------------------ */

export interface Session {
  staffId: string;
  name: string;
  login: string;
  role: StaffRole;
  startedAt: string;
}

const SESSION_KEY = 'kattou.session.v1';

export function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.staffId || !parsed?.role) return null;
    if (!(parsed.role in ROLE_CAPABILITIES)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(session: Session): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* storage disabled — session simply won't persist */
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* no-op */
  }
}
