import { afterEach, describe, expect, it } from 'vitest';
import { createTestClient } from '../test/createTestApp';

describe('habits router', () => {
  let cleanup: (() => Promise<void>) | undefined;

  afterEach(async () => {
    await cleanup?.();
    cleanup = undefined;
  });

  it('creates, lists, archives, and deletes only the current user habits', async () => {
    const client = await createTestClient();
    cleanup = client.cleanup;
    const { agent } = client;

    await agent.post('/api/auth/register').send({ email: 'h@example.com', password: 'password1' });
    const created = await agent.post('/api/habits').send({ title: '冥想' });
    expect(created.status).toBe(201);
    expect(created.body.habit.title).toBe('冥想');
    const id = created.body.habit.id as string;

    const listed = await agent.get('/api/habits');
    expect(listed.body.habits).toHaveLength(1);

    const archived = await agent.patch(`/api/habits/${id}`).send({ archived: true });
    expect(archived.status).toBe(200);
    expect(archived.body.habit.archivedAt).toBeTruthy();
    expect((await agent.get('/api/habits')).body.habits).toHaveLength(0);
    expect((await agent.get('/api/habits?includeArchived=true')).body.habits).toHaveLength(1);

    const deleted = await agent.delete(`/api/habits/${id}`);
    expect(deleted.status).toBe(204);

    const other = await createTestClient();
    try {
      await other.agent
        .post('/api/auth/register')
        .send({ email: 'h2@example.com', password: 'password1' });
      const foreign = await other.agent.patch(`/api/habits/${id}`).send({ title: '偷改' });
      expect(foreign.status).toBe(404);
    } finally {
      await other.cleanup();
    }
  });
});
