import { computeStreak, dateRangeInclusive, isValidLocalDate } from '@morning-route/shared';
import type { PrismaClient } from '@prisma/client';
import { HttpError } from '../lib/httpError';
import { habitSelect } from '../habits/habitTypes';
import { checkInSelect, type CheckInRecord } from './checkInTypes';

async function ownedHabit(prisma: PrismaClient, userId: string, habitId: string) {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    select: habitSelect,
  });
  if (!habit) {
    throw HttpError.notFound('习惯不存在');
  }
  return habit;
}

function requireLocalDate(localDate: string): string {
  if (!isValidLocalDate(localDate)) {
    throw HttpError.validation('localDate 必须是有效的 YYYY-MM-DD');
  }
  return localDate;
}

export async function upsertCheckIn(
  prisma: PrismaClient,
  userId: string,
  habitId: string,
  localDate: string,
): Promise<CheckInRecord> {
  requireLocalDate(localDate);
  await ownedHabit(prisma, userId, habitId);
  return prisma.checkIn.upsert({
    where: { habitId_localDate: { habitId, localDate } },
    update: {},
    create: { habitId, userId, localDate },
    select: checkInSelect,
  });
}

export async function removeCheckIn(
  prisma: PrismaClient,
  userId: string,
  habitId: string,
  localDate: string,
): Promise<void> {
  requireLocalDate(localDate);
  await ownedHabit(prisma, userId, habitId);
  await prisma.checkIn.deleteMany({
    where: { habitId, userId, localDate },
  });
}

export async function getHabitStats(
  prisma: PrismaClient,
  userId: string,
  habitId: string,
  today: string,
) {
  const localDate = requireLocalDate(today);
  await ownedHabit(prisma, userId, habitId);
  const rows = await prisma.checkIn.findMany({
    where: { habitId, userId },
    select: { localDate: true },
    orderBy: { localDate: 'desc' },
  });
  const dates = rows.map((row) => row.localDate);
  const streak = computeStreak(dates, localDate);
  const recentDays = dateRangeInclusive(localDate, 14);
  const set = new Set(dates);
  return {
    habitId,
    localDate,
    todayCheckedIn: streak.todayCheckedIn,
    currentStreak: streak.currentStreak,
    recent: recentDays.map((day) => ({ localDate: day, checkedIn: set.has(day) })),
  };
}
