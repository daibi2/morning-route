import { addDays, isValidLocalDate } from './dates';

export type StreakResult = {
  todayCheckedIn: boolean;
  currentStreak: number;
};

export function computeStreak(checkedLocalDates: readonly string[], today: string): StreakResult {
  if (!isValidLocalDate(today)) {
    throw new Error(`Invalid localDate: ${today}`);
  }
  const set = new Set(checkedLocalDates);
  const todayCheckedIn = set.has(today);
  let cursor = todayCheckedIn ? today : addDays(today, -1);
  let currentStreak = 0;
  while (set.has(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }
  return { todayCheckedIn, currentStreak };
}

export function dateRangeInclusive(end: string, days: number): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    out.push(addDays(end, -i));
  }
  return out;
}
