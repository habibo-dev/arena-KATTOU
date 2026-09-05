import { describe, expect, it } from 'vitest';
import {
  cleanName,
  formatPhone,
  maskPhone,
  normaliseAlgerianPhone,
  validateName,
  validatePhone,
} from './validation';

describe('normaliseAlgerianPhone', () => {
  it('accepts the local mobile form', () => {
    expect(normaliseAlgerianPhone('0558 41 80 73')).toBe('+213558418073');
  });
  it('accepts the international form', () => {
    expect(normaliseAlgerianPhone('+213558418073')).toBe('+213558418073');
    expect(normaliseAlgerianPhone('00213558418073')).toBe('+213558418073');
  });
  it('accepts the fixed-line form', () => {
    expect(normaliseAlgerianPhone('027569494')).toBe('+21327569494');
  });
  it('rejects invalid numbers', () => {
    expect(normaliseAlgerianPhone('12345')).toBeNull();
    expect(normaliseAlgerianPhone('055841807')).toBeNull();
  });
  it('rejects empty', () => {
    expect(normaliseAlgerianPhone('')).toBeNull();
  });
});

describe('validatePhone', () => {
  it('mirrors the normaliser', () => {
    expect(validatePhone('0558 41 80 73')).toBeNull();
    expect(validatePhone('nope')).toBe('phone_invalid');
  });
});

describe('validateName', () => {
  it('accepts Arabic and Latin names', () => {
    expect(validateName('محمد بن يحيى')).toBeNull();
    expect(validateName('Sara Kattou')).toBeNull();
  });
  it('rejects too-short or symbol-only names', () => {
    expect(validateName('م')).toBe('name_too_short');
    expect(validateName('!!!')).toBe('name_invalid');
  });
});

describe('cleanName', () => {
  it('strips markup, control characters and trims', () => {
    const cleaned = cleanName('  Sara   K <b>x</b> ');
    expect(cleaned).not.toMatch(/[<>/{}[\]()\\`$]/);
    expect(cleaned).toContain('Sara');
    expect(cleaned.startsWith(' ')).toBe(false);
  });
  it('caps length', () => {
    expect(cleanName('a'.repeat(200)).length).toBeLessThanOrEqual(90);
  });
});

describe('maskPhone', () => {
  it('never exposes the full number', () => {
    const masked = maskPhone('+213558418073');
    expect(masked).toContain('•••');
    expect(masked).not.toContain('5584180');
  });
});

describe('formatPhone', () => {
  it('renders the readable local form', () => {
    expect(formatPhone('+213558418073')).toBe('0558 41 80 73');
  });
});
