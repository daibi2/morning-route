import { afterEach, describe, expect, it } from 'vitest';
import { createTestClient } from '../test/createTestApp';

describe('check-ins router', () => {
  let cleanup: (() => Promise<void>) | undefined;

  afterEach(async () => {
    await cleanup?.();
    cleanup = undefined;
  });

  it('checks in idempotently, reports streak, and can undo', async () => {
    const client = await createTestClient();
    cleanup = client.cleanup;
    const { agent } = client;
    await agent.post('/api/auth/register').send({ email: 'in@example.com', password: 'password1' });
    const habit = await agent.post('/api/habits').send({ title: '冷水' });
    const id = habit.body.habit.id as string;

    const first = await agent.put(`/api/habits/${id}/check-ins/2026-09-15`);
    const second = await agent.put(`/api/habits/${id}/check-ins/2026-09-15`);
    expect(first.status).toBe(200);
    expect(second.body.checkIn.id).toBe(first.body.checkIn.id);

    await agent.put(`/api/habits/${id}/check-ins/2026-09-14`);
    const stats = await agent.get(`/api/habits/${id}/stats`).query({ localDate: '2026-09-15' });
    expect(stats.body.todayCheckedIn).toBe(true);
    expect(stats.body.currentStreak).toBe(2);

    const undone = await agent.delete(`/api/habits/${id}/check-ins/2026-09-15`);
    expect(undone.status).toBe(204);
    const after = await agent.get(`/api/habits/${id}/stats`).query({ localDate: '2026-09-15' });
    expect(after.body.todayCheckedIn).toBe(false);
    expect(after.body.currentStreak).toBe(1);
  });
});
