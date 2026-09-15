import { afterEach, describe, expect, it } from 'vitest';
import { createTestClient } from '../test/createTestApp';

describe('stats router', () => {
  let cleanup: (() => Promise<void>) | undefined;

  afterEach(async () => {
    await cleanup?.();
    cleanup = undefined;
  });

  it('returns overview for the current user', async () => {
    const client = await createTestClient();
    cleanup = client.cleanup;
    const { agent } = client;
    await agent.post('/api/auth/register').send({ email: 'st@example.com', password: 'password1' });
    const habit = await agent.post('/api/habits').send({ title: '阅读' });
    await agent.put(`/api/habits/${habit.body.habit.id}/check-ins/2026-09-15`);
    const res = await agent.get('/api/stats/overview').query({ localDate: '2026-09-15' });
    expect(res.status).toBe(200);
    expect(res.body.todayCompleted).toBe(1);
    expect(res.body.todayTotal).toBe(1);
    expect(res.body.last7Days).toHaveLength(7);
  });
});
