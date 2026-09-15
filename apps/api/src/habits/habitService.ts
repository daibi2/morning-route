import { z } from 'zod';
import type { PrismaClient } from '@prisma/client';
import { HttpError } from '../lib/httpError';
import { habitSelect, type HabitRecord } from './habitTypes';

const createSchema = z.object({
  title: z.string().trim().min(1).max(80),
});

const patchSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  sortOrder: z.number().int().optional(),
  archived: z.boolean().optional(),
});

export async function listHabits(
  prisma: PrismaClient,
  userId: string,
  includeArchived: boolean,
): Promise<HabitRecord[]> {
  return prisma.habit.findMany({
    where: {
      userId,
      ...(includeArchived ? {} : { archivedAt: null }),
    },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: habitSelect,
  });
}

export async function createHabit(
  prisma: PrismaClient,
  userId: string,
  body: unknown,
): Promise<HabitRecord> {
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    throw HttpError.validation('请填写习惯标题');
  }
  const max = await prisma.habit.aggregate({
    where: { userId },
    _max: { sortOrder: true },
  });
  const sortOrder = (max._max.sortOrder ?? -1) + 1;
  return prisma.habit.create({
    data: { userId, title: parsed.data.title, sortOrder },
    select: habitSelect,
  });
}

export async function updateHabit(
  prisma: PrismaClient,
  userId: string,
  id: string,
  body: unknown,
): Promise<HabitRecord> {
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    throw HttpError.validation('无效的习惯更新');
  }
  const existing = await prisma.habit.findFirst({
    where: { id, userId },
    select: habitSelect,
  });
  if (!existing) {
    throw HttpError.notFound('习惯不存在');
  }
  const data: {
    title?: string;
    sortOrder?: number;
    archivedAt?: Date | null;
  } = {};
  if (parsed.data.title !== undefined) {
    data.title = parsed.data.title;
  }
  if (parsed.data.sortOrder !== undefined) {
    data.sortOrder = parsed.data.sortOrder;
  }
  if (parsed.data.archived !== undefined) {
    data.archivedAt = parsed.data.archived ? new Date() : null;
  }
  return prisma.habit.update({
    where: { id },
    data,
    select: habitSelect,
  });
}

export async function deleteHabit(prisma: PrismaClient, userId: string, id: string): Promise<void> {
  const existing = await prisma.habit.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!existing) {
    throw HttpError.notFound('习惯不存在');
  }
  await prisma.habit.delete({ where: { id } });
}
