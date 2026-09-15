import { describe, expect, it } from 'vitest';
import { computeStreak, dateRangeInclusive } from './streak';

describe('computeStreak', () => {
  it('counts consecutive days ending today when today is checked in', () => {
    expect(computeStreak(['2026-02-27', '2026-02-28', '2026-03-01'], '2026-03-01')).toEqual({
      todayCheckedIn: true,
      currentStreak: 3,
    });
  });

  it('counts from yesterday when today is not checked in', () => {
    expect(computeStreak(['2026-02-27', '2026-02-28'], '2026-03-01')).toEqual({
      todayCheckedIn: false,
      currentStreak: 2,
    });
  });

  it('breaks on a missed day', () => {
    expect(computeStreak(['2026-03-01', '2026-02-27'], '2026-03-01')).toEqual({
      todayCheckedIn: true,
      currentStreak: 1,
    });
  });

  it('is zero when neither today nor yesterday is checked', () => {
    expect(computeStreak(['2026-02-20'], '2026-03-01')).toEqual({
      todayCheckedIn: false,
      currentStreak: 0,
    });
  });
});

describe('dateRangeInclusive', () => {
  it('returns the last n calendar days ending at the anchor', () => {
    expect(dateRangeInclusive('2026-03-01', 3)).toEqual(['2026-02-27', '2026-02-28', '2026-03-01']);
  });
});
