import { describe, expect, it } from 'vitest';
import { computeEta, formatEtaRange } from './eta';
import type { EtaConfig } from './types';

const config: EtaConfig = {
  defaultConsultationMinutes: 25,
  serviceDurations: {} as EtaConfig['serviceDurations'],
  bufferMinutes: 5,
  emergencyInterruptMinutes: 20,
  rangeSpreadMinutes: 10,
  rangeSpreadRatio: 0.15,
};

const now = new Date(2026, 8, 5, 10, 0, 0, 0);

function eta(patientsAhead: number, extra: Partial<Parameters<typeof computeEta>[0]> = {}) {
  return computeEta({
    patientsAhead,
    averageDurationMinutes: config.defaultConsultationMinutes,
    currentPatientElapsedMinutes: null,
    currentPatientExpectedMinutes: null,
    clinicDelayMinutes: 0,
    emergencyPending: 0,
    bufferMinutes: config.bufferMinutes,
    emergencyInterruptMinutes: config.emergencyInterruptMinutes,
    rangeSpreadMinutes: config.rangeSpreadMinutes,
    rangeSpreadRatio: config.rangeSpreadRatio,
    now,
    ...extra,
  });
}

describe('computeEta', () => {
  it('always returns a range, never a single guaranteed time', () => {
    const result = eta(3);
    expect(result.isRange).toBe(true);
    expect(result.toMinutes).toBeGreaterThan(result.fromMinutes);
    expect(result.fromTime).not.toBe(result.toTime);
  });

  it('grows with the number of patients ahead', () => {
    const few = eta(1);
    const many = eta(5);
    expect(many.fromMinutes).toBeGreaterThan(few.fromMinutes);
    expect(many.toMinutes).toBeGreaterThan(few.toMinutes);
  });

  it('applies the declared clinic delay', () => {
    const base = eta(2);
    const delayed = eta(2, { clinicDelayMinutes: 20 });
    expect(delayed.fromMinutes).toBeGreaterThanOrEqual(base.fromMinutes + 15);
  });

  it('accounts for pending emergencies', () => {
    const base = eta(2);
    const emergency = eta(2, { emergencyPending: 1 });
    expect(emergency.fromMinutes).toBeGreaterThan(base.fromMinutes);
  });

  it('subtracts elapsed time of the patient in the chair', () => {
    const justStarted = eta(1, {
      currentPatientElapsedMinutes: 0,
      currentPatientExpectedMinutes: 25,
    });
    const almostDone = eta(1, {
      currentPatientElapsedMinutes: 20,
      currentPatientExpectedMinutes: 25,
    });
    expect(almostDone.fromMinutes).toBeLessThan(justStarted.fromMinutes);
  });

  it('never reports zero or negative wait when people are ahead', () => {
    const result = eta(3);
    expect(result.fromMinutes).toBeGreaterThanOrEqual(5);
  });

  it('formats the range as from–to', () => {
    const result = eta(2);
    const text = formatEtaRange(result);
    expect(text).toMatch(/\d{2}:\d{2} – \d{2}:\d{2}/);
  });

  it('confidence drops for long, interrupted queues', () => {
    expect(eta(1).confidence).toBe('high');
    expect(eta(4).confidence).toBe('medium');
    expect(eta(9).confidence).toBe('low');
  });
});
