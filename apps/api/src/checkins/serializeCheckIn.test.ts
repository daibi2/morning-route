import type { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { serializeCheckIn } from './serializeCheckIn';

describe('serializeCheckIn', () => {
  it('serializes a Prisma check-in payload', () => {
    const row: Prisma.CheckInGetPayload<{
      select: { id: true; habitId: true; userId: true; localDate: true; createdAt: true };
    }> = {
      id: 'c1',
      habitId: 'h1',
      userId: 'u1',
      localDate: '2026-09-15',
      createdAt: new Date('2026-09-15T00:00:00.000Z'),
    };
    expect(serializeCheckIn(row).localDate).toBe('2026-09-15');
  });
});
