import { afterEach, describe, expect, it } from 'vitest';
import { createTestDeps } from '../test/createTestApp';
import { getOverview } from './statsService';
import type { AppDeps } from '../config';

describe('getOverview', () => {
  let deps: (AppDeps & { cleanup: () => Promise<void> }) | undefined;

  afterEach(async () => {
    await deps?.cleanup();
    deps = undefined;
  });

  it('computes completion rate and last-7-day counts', async () => {
    deps = await createTestDeps();
    const user = await deps.prisma.user.create({
      data: { email: 's@example.com', passwordHash: 'x' },
    });
    const a = await deps.prisma.habit.create({
      data: { userId: user.id, title: 'A', sortOrder: 0 },
    });
    const b = await deps.prisma.habit.create({
      data: { userId: user.id, title: 'B', sortOrder: 1 },
    });
    await deps.prisma.checkIn.createMany({
      data: [
        { habitId: a.id, userId: user.id, localDate: '2026-09-15' },
        { habitId: a.id, userId: user.id, localDate: '2026-09-14' },
        { habitId: b.id, userId: user.id, localDate: '2026-09-14' },
      ],
    });
    const overview = await getOverview(deps.prisma, user.id, '2026-09-15');
    expect(overview.todayTotal).toBe(2);
    expect(overview.todayCompleted).toBe(1);
    expect(overview.completionRate).toBe(0.5);
    expect(overview.last7Days.at(-1)).toEqual({ localDate: '2026-09-15', completedCount: 1 });
    expect(overview.habits.find((h) => h.id === a.id)?.currentStreak).toBe(2);
  });
});
