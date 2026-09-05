import type { EtaConfig, EtaResult } from './types';
import { formatHHMM, minutesToHHMM } from './time';

/**
 * SMART ETA ENGINE
 * ----------------
 * A transparent, configurable estimator. No black-box "AI" claim is made
 * anywhere in the UI: every number shown to a patient is derived from the
 * inputs listed in `EtaResult.inputs`.
 *
 * Two hard product rules are enforced in code, not just in copy:
 *   1. The result is ALWAYS a range (from/to), never a single guaranteed time.
 *   2. The estimate is never negative and never below a floor, so a patient is
 *      never told "0 minutes" when people are still ahead of them.
 *
 * The engine is intentionally pure so it can be unit-tested and later reused
 * server-side once historical measurements replace the manual planning values.
 */

export interface EtaInput {
  /** Patients ahead in the live queue (already checked in). */
  patientsAhead: number;
  /** Planning average per patient, minutes. */
  averageDurationMinutes: number;
  /**
   * Minutes already spent on the patient currently in the chair.
   * `null` when no consultation is in progress.
   */
  currentPatientElapsedMinutes: number | null;
  /** Expected length of the consultation in progress. `null` if unknown. */
  currentPatientExpectedMinutes: number | null;
  /** Delay declared by the reception ("تأخير الطبيب"). */
  clinicDelayMinutes: number;
  /** Emergencies queued ahead that have not been served yet. */
  emergencyPending: number;
  /** Turnaround between patients. */
  bufferMinutes: number;
  /** Minutes an emergency insertion pushes everyone else. */
  emergencyInterruptMinutes: number;
  /** Minimum half-width of the range. */
  rangeSpreadMinutes: number;
  /** Proportional half-width, as a fraction of the point estimate. */
  rangeSpreadRatio: number;
  /** Reference instant — injected so tests are deterministic. */
  now: Date;
  /** Floor in minutes; below this we still show the floor, not zero. */
  floorMinutes?: number;
}

const DEFAULT_FLOOR = 5;
/** Sanity guard: never plan a consultation of 0 minutes. */
const MIN_DURATION = 5;

export function computeEta(input: EtaInput): EtaResult {
  const duration = Math.max(MIN_DURATION, roundTo(input.averageDurationMinutes, 1));
  const floor = input.floorMinutes ?? DEFAULT_FLOOR;

  // 1. Remaining time of the consultation currently in the chair.
  let currentRemaining = 0;
  if (input.currentPatientElapsedMinutes !== null) {
    const expected = input.currentPatientExpectedMinutes ?? duration;
    currentRemaining = Math.max(0, expected - input.currentPatientElapsedMinutes);
  }

  // 2. Patients ahead, each taking the average duration plus a turnaround.
  const aheadMinutes =
    input.patientsAhead > 0
      ? input.patientsAhead * duration + Math.max(0, input.patientsAhead - 1) * input.bufferMinutes
      : 0;

  // 3. Emergency interruptions and declared clinic delay.
  const emergencyMinutes = Math.max(0, input.emergencyPending) * input.emergencyInterruptMinutes;
  const delayMinutes = Math.max(0, input.clinicDelayMinutes);

  const point = currentRemaining + aheadMinutes + emergencyMinutes + delayMinutes;

  // 4. Range: fixed spread, widened proportionally for long waits.
  const proportional = point * input.rangeSpreadRatio;
  const spread = Math.max(input.rangeSpreadMinutes, proportional);

  const fromRaw = point - spread;
  const toRaw = point + spread;

  const fromMinutes = Math.max(floor, roundTo5(fromRaw));
  const toMinutes = Math.max(fromMinutes + 5, roundTo5(toRaw));

  const fromTime = minutesToHHMM(input.now, fromMinutes);
  const toTime = minutesToHHMM(input.now, toMinutes);

  return {
    fromMinutes,
    toMinutes,
    fromTime,
    toTime,
    isRange: true,
    confidence: confidenceOf(input),
    patientsAhead: input.patientsAhead,
    inputs: {
      patientsAhead: input.patientsAhead,
      averageDurationMinutes: duration,
      currentPatientRemainingMinutes: Math.round(currentRemaining),
      clinicDelayMinutes: delayMinutes,
      emergencyPending: Math.max(0, input.emergencyPending),
    },
  };
}

/**
 * Confidence is honest bookkeeping: short queues with no interruptions are
 * more predictable than a full waiting room with a declared delay.
 */
function confidenceOf(input: EtaInput): EtaResult['confidence'] {
  if (input.patientsAhead <= 2 && input.emergencyPending === 0 && input.clinicDelayMinutes <= 5) {
    return 'high';
  }
  if (input.patientsAhead <= 6 && input.emergencyPending <= 1) return 'medium';
  return 'low';
}

/** Turn an `EtaConfig` plus live numbers into the input shape the engine takes. */
export function etaInputFromConfig(
  config: EtaConfig,
  live: Omit<
    EtaInput,
    | 'averageDurationMinutes'
    | 'bufferMinutes'
    | 'emergencyInterruptMinutes'
    | 'rangeSpreadMinutes'
    | 'rangeSpreadRatio'
  > & { averageDurationMinutes: number },
): EtaInput {
  return {
    ...live,
    bufferMinutes: config.bufferMinutes,
    emergencyInterruptMinutes: config.emergencyInterruptMinutes,
    rangeSpreadMinutes: config.rangeSpreadMinutes,
    rangeSpreadRatio: config.rangeSpreadRatio,
  };
}

/** "10:50 – 11:15" — the only ETA format the patient ever sees. */
export function formatEtaRange(eta: EtaResult, separator = '–'): string {
  return `${formatHHMM(eta.fromTime)} ${separator} ${formatHHMM(eta.toTime)}`;
}

export function formatWaitMinutes(from: number, to: number): string {
  return `${from}–${to} min`;
}

export function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function roundTo5(value: number): number {
  return Math.round(value / 5) * 5;
}
