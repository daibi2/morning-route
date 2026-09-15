import { describe, expect, it } from 'vitest';
import { addDays, isValidLocalDate, todayLocalDate } from './dates';

describe('isValidLocalDate', () => {
  it('accepts real calendar days', () => {
    expect(isValidLocalDate('2024-02-29')).toBe(true);
    expect(isValidLocalDate('2026-09-15')).toBe(true);
  });

  it('rejects malformed or impossible dates', () => {
    expect(isValidLocalDate('2024-2-9')).toBe(false);
    expect(isValidLocalDate('2023-02-29')).toBe(false);
    expect(isValidLocalDate('not-a-date')).toBe(false);
  });
});

describe('addDays', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2025-12-31', 1)).toBe('2026-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('todayLocalDate', () => {
  it('formats the runtime local calendar day', () => {
    expect(todayLocalDate(new Date(2026, 8, 15, 7, 30))).toBe('2026-09-15');
  });
});
