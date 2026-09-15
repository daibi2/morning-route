import type { Prisma } from '@prisma/client';

export const habitSelect = {
  id: true,
  userId: true,
  title: true,
  archivedAt: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.HabitSelect;

export type HabitRecord = Prisma.HabitGetPayload<{ select: typeof habitSelect }>;
