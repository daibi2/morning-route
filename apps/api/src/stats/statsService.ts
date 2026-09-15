import { computeStreak, dateRangeInclusive, isValidLocalDate } from '@morning-route/shared';
import type { PrismaClient } from '@prisma/client';
import { HttpError } from '../lib/httpError';
import { habitSelect } from '../habits/habitTypes';

export type OverviewHabit = {
  id: string;
  title: string;
  currentStreak: number;
  todayCheckedIn: boolean;
};

export type Overview = {
  localDate: string;
  todayCompleted: number;
  todayTotal: number;
  completionRate: number;
  habits: OverviewHabit[];
  last7Days: { localDate: string; completedCount: number }[];
};

export async function getOverview(
  prisma: PrismaClient,
  userId: string,
  today: string,
): Promise<Overview> {
  if (!isValidLocalDate(today)) {
    throw HttpError.validation('localDate 必须是有效的 YYYY-MM-DD');
  }
  const habits = await prisma.habit.findMany({
    where: { userId, archivedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: habitSelect,
  });
  const range = dateRangeInclusive(today, 7);
  const checkIns = await prisma.checkIn.findMany({
    where: {
      userId,
      habitId: { in: habits.map((h) => h.id) },
    },
    select: { habitId: true, localDate: true },
  });
  const byHabit = new Map<string, string[]>();
  for (const row of checkIns) {
    const list = byHabit.get(row.habitId) ?? [];
    list.push(row.localDate);
    byHabit.set(row.habitId, list);
  }
  const overviewHabits: OverviewHabit[] = habits.map((habit) => {
    const streak = computeStreak(byHabit.get(habit.id) ?? [], today);
    return {
      id: habit.id,
      title: habit.title,
      currentStreak: streak.currentStreak,
      todayCheckedIn: streak.todayCheckedIn,
    };
  });
  const todayCompleted = overviewHabits.filter((h) => h.todayCheckedIn).length;
  const todayTotal = overviewHabits.length;
  const last7Days = range.map((day) => ({
    localDate: day,
    completedCount: checkIns.filter((row) => row.localDate === day).length,
  }));
  return {
    localDate: today,
    todayCompleted,
    todayTotal,
    completionRate: todayTotal === 0 ? 0 : todayCompleted / todayTotal,
    habits: overviewHabits,
    last7Days,
  };
}
