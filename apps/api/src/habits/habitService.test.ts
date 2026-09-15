import { afterEach, describe, expect, it } from 'vitest';
import { HttpError } from '../lib/httpError';
import { createTestDeps } from '../test/createTestApp';
import { createHabit, deleteHabit, listHabits, updateHabit } from './habitService';
import type { AppDeps } from '../config';

describe('habitService', () => {
  let deps: (AppDeps & { cleanup: () => Promise<void> }) | undefined;

  afterEach(async () => {
    await deps?.cleanup();
    deps = undefined;
  });

  it('scopes habits to the owner and supports archive', async () => {
    deps = await createTestDeps();
    const owner = await deps.prisma.user.create({
      data: { email: 'owner@example.com', passwordHash: 'x' },
    });
    const other = await deps.prisma.user.create({
      data: { email: 'other@example.com', passwordHash: 'x' },
    });
    const habit = await createHabit(deps.prisma, owner.id, { title: '晨跑' });
    await createHabit(deps.prisma, other.id, { title: '别人的' });
    const listed = await listHabits(deps.prisma, owner.id, false);
    expect(listed.map((h) => h.title)).toEqual(['晨跑']);
    const archived = await updateHabit(deps.prisma, owner.id, habit.id, { archived: true });
    expect(archived.archivedAt).not.toBeNull();
    expect(await listHabits(deps.prisma, owner.id, false)).toHaveLength(0);
    expect(await listHabits(deps.prisma, owner.id, true)).toHaveLength(1);
    await deleteHabit(deps.prisma, owner.id, habit.id);
    await expect(deleteHabit(deps.prisma, owner.id, habit.id)).rejects.toBeInstanceOf(HttpError);
  });
});
