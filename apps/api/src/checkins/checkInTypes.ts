import type { Prisma } from '@prisma/client';

export const checkInSelect = {
  id: true,
  habitId: true,
  userId: true,
  localDate: true,
  createdAt: true,
} satisfies Prisma.CheckInSelect;

export type CheckInRecord = Prisma.CheckInGetPayload<{ select: typeof checkInSelect }>;
