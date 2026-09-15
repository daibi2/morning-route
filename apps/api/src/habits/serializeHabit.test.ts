import type { Prisma } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { serializeHabit } from './serializeHabit';

describe('serializeHabit', () => {
  it('serializes a Prisma habit payload including nullable archive time', () => {
    const createdAt = new Date('2026-09-15T00:00:00.000Z');
    const habit: Prisma.HabitGetPayload<{
      select: {
        id: true;
        userId: true;
        title: true;
        archivedAt: true;
        sortOrder: true;
        createdAt: true;
        updatedAt: true;
      };
    }> = {
      id: 'h1',
      userId: 'u1',
      title: '喝水',
      archivedAt: null,
      sortOrder: 0,
      createdAt,
      updatedAt: createdAt,
    };
    expect(serializeHabit(habit).archivedAt).toBeNull();
    expect(serializeHabit(habit).title).toBe('喝水');
  });
});
