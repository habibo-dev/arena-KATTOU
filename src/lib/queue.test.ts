import { describe, expect, it } from 'vitest';
import { buildQueueSnapshot, compareQueue, nextQueueNumber, patientsAheadOf } from './queue';
import type { Appointment, QueueEntry } from './types';

const now = new Date(2026, 8, 5, 10, 0, 0, 0);
const date = '2026-09-05';

function makeAppointment(overrides: Partial<Appointment>): Appointment {
  return {
    id: `a${Math.random()}`,
    ref: 'KM-0000',
    token: 't',
    patientId: 'p',
    patientName: 'Test Patient',
    patientPhone: '+213550000000',
    serviceId: 'soins',
    type: 'scheduled',
    status: 'waiting',
    date,
    slot: null,
    queueNumber: 1,
    checkedInAt: now.toISOString(),
    consultationStartedAt: null,
    completedAt: null,
    waitingMode: 'inside',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    history: [],
    ...overrides,
  };
}

describe('buildQueueSnapshot', () => {
  it('orders emergencies first, then by ticket number', () => {
    const appointments = [
      makeAppointment({ id: '1', queueNumber: 19, status: 'waiting' }),
      makeAppointment({ id: '2', queueNumber: 20, status: 'in_consultation' }),
      makeAppointment({ id: '3', queueNumber: 18, status: 'emergency', type: 'emergency' }),
      makeAppointment({ id: '4', queueNumber: 21, status: 'waiting' }),
    ];
    const snapshot = buildQueueSnapshot(appointments, date, now);
    expect(snapshot.current?.appointmentId).toBe('2');
    expect(snapshot.waiting.map((e) => e.appointmentId)).toEqual(['3', '1', '4']);
    expect(snapshot.emergencyPending).toBe(1);
  });

  it('ignores appointments from other days', () => {
    const appointments = [
      makeAppointment({ id: '1', date: '2026-09-04', status: 'waiting' }),
      makeAppointment({ id: '2', status: 'waiting' }),
    ];
    const snapshot = buildQueueSnapshot(appointments, date, now);
    expect(snapshot.entries).toHaveLength(1);
    expect(snapshot.entries[0].appointmentId).toBe('2');
  });
});

describe('patientsAheadOf', () => {
  it('counts patients standing before the target', () => {
    const appointments = [
      makeAppointment({ id: 'c', status: 'in_consultation', queueNumber: 18 }),
      makeAppointment({ id: '1', status: 'waiting', queueNumber: 19 }),
      makeAppointment({ id: '2', status: 'waiting', queueNumber: 20 }),
      makeAppointment({ id: 'me', status: 'waiting', queueNumber: 21 }),
    ];
    const snapshot = buildQueueSnapshot(appointments, date, now);
    expect(patientsAheadOf(snapshot, 'me')).toBe(2);
    expect(patientsAheadOf(snapshot, '1')).toBe(0);
  });
});

describe('nextQueueNumber', () => {
  it('starts at 1 and increments', () => {
    const empty = nextQueueNumber([], date);
    expect(empty).toBe(1);
    const withOne = nextQueueNumber([makeAppointment({ queueNumber: 20 })], date);
    expect(withOne).toBe(21);
  });
});

describe('compareQueue', () => {
  it('keeps a stable deterministic order', () => {
    const a: QueueEntry = {
      appointmentId: 'a',
      ref: 'A',
      queueNumber: 5,
      patientName: 'x',
      patientPhone: '',
      serviceId: 'soins',
      type: 'scheduled',
      status: 'waiting',
      slot: null,
      checkedInAt: null,
      waitingMode: null,
      waitingMinutes: 0,
      inProgressMinutes: 0,
    };
    const b: QueueEntry = { ...a, appointmentId: 'b', ref: 'B', queueNumber: 3 };
    expect(compareQueue(a, b)).toBeGreaterThan(0);
    expect(compareQueue(b, a)).toBeLessThan(0);
  });
});
