import type { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { serializeUser } from './serializeUser';

describe('serializeUser', () => {
  it('emits ISO timestamps for a Prisma user payload', () => {
    const createdAt = new Date('2026-09-15T00:00:00.000Z');
    const updatedAt = new Date('2026-09-15T01:00:00.000Z');
    const user: Prisma.UserGetPayload<{
      select: { id: true; email: true; createdAt: true; updatedAt: true };
    }> = {
      id: 'u1',
      email: 'a@example.com',
      createdAt,
      updatedAt,
    };
    expect(serializeUser(user)).toEqual({
      id: 'u1',
      email: 'a@example.com',
      createdAt: '2026-09-15T00:00:00.000Z',
      updatedAt: '2026-09-15T01:00:00.000Z',
    });
  });
});
