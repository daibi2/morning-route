import type { Prisma } from '@prisma/client';

export const publicUserSelect = {
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUserRecord = Prisma.UserGetPayload<{ select: typeof publicUserSelect }>;

export type UserWithPassword = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    passwordHash: true;
    createdAt: true;
    updatedAt: true;
  };
}>;
