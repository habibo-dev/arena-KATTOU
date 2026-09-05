/**
 * PERSISTENCE ADAPTER
 *
 * The whole app talks to `ClinicRepository`, never to `localStorage` directly.
 * Swapping in a real backend means providing another implementation of this
 * interface — no component changes required.
 */
import type { Appointment, ClinicSettings, Patient, StaffAccount } from './types';

export interface ClinicSnapshot {
  version: number;
  settings: ClinicSettings;
  patients: Patient[];
  appointments: Appointment[];
  staff: StaffAccount[];
  clinicDelay: { date: string; minutes: number } | null;
}

export interface ClinicRepository {
  load(): Promise<ClinicSnapshot | null>;
  save(snapshot: ClinicSnapshot): Promise<void>;
  clear(): Promise<void>;
}

export const SCHEMA_VERSION = 1;

const STORAGE_KEY = 'kattou.clinic.v1';

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Browser implementation. Everything is namespaced + versioned. */
export class LocalStorageRepository implements ClinicRepository {
  constructor(private readonly key = STORAGE_KEY) {}

  async load(): Promise<ClinicSnapshot | null> {
    if (typeof localStorage === 'undefined') return null;
    const raw = safeParse<ClinicSnapshot>(localStorage.getItem(this.key));
    if (!raw || raw.version !== SCHEMA_VERSION) return null;
    return raw;
  }

  async save(snapshot: ClinicSnapshot): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this.key, JSON.stringify(snapshot));
    } catch {
      /* quota exceeded — the in-memory store keeps working for this session */
    }
  }

  async clear(): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(this.key);
  }
}

/** In-memory implementation used by tests and by the demo/preview sandbox. */
export class MemoryRepository implements ClinicRepository {
  private snapshot: ClinicSnapshot | null = null;
  async load(): Promise<ClinicSnapshot | null> {
    return this.snapshot;
  }
  async save(snapshot: ClinicSnapshot): Promise<void> {
    this.snapshot = structuredClone(snapshot);
  }
  async clear(): Promise<void> {
    this.snapshot = null;
  }
}
