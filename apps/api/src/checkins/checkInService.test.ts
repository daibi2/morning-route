import { afterEach, describe, expect, it } from 'vitest';
import { createTestDeps } from '../test/createTestApp';
import { getHabitStats, removeCheckIn, upsertCheckIn } from './checkInService';
import type { AppDeps } from '../config';

describe('checkInService', () => {
  let deps: (AppDeps & { cleanup: () => Promise<void> }) | undefined;

  afterEach(async () => {
    await deps?.cleanup();
    deps = undefined;
  });

  it('upserts idempotently and computes streak across a month boundary', async () => {
    deps = await createTestDeps();
    const user = await deps.prisma.user.create({
      data: { email: 'c@example.com', passwordHash: 'x' },
    });
    const habit = await deps.prisma.habit.create({
      data: { userId: user.id, title: '拉伸', sortOrder: 0 },
    });
    await upsertCheckIn(deps.prisma, user.id, habit.id, '2026-02-28');
    await upsertCheckIn(deps.prisma, user.id, habit.id, '2026-02-28');
    await upsertCheckIn(deps.prisma, user.id, habit.id, '2026-03-01');
    const todayOn = await getHabitStats(deps.prisma, user.id, habit.id, '2026-03-01');
    expect(todayOn.todayCheckedIn).toBe(true);
    expect(todayOn.currentStreak).toBe(2);
    const skippedToday = await getHabitStats(deps.prisma, user.id, habit.id, '2026-03-02');
    expect(skippedToday.todayCheckedIn).toBe(false);
    expect(skippedToday.currentStreak).toBe(2);
    await removeCheckIn(deps.prisma, user.id, habit.id, '2026-03-01');
    const broken = await getHabitStats(deps.prisma, user.id, habit.id, '2026-03-01');
    expect(broken.todayCheckedIn).toBe(false);
    expect(broken.currentStreak).toBe(1);
  });
});
