import { afterEach, describe, expect, it } from 'vitest';
import { createTestClient } from '../test/createTestApp';

describe('auth router', () => {
  let cleanup: (() => Promise<void>) | undefined;

  afterEach(async () => {
    await cleanup?.();
    cleanup = undefined;
  });

  it('registers, reads me, logs out, and logs back in', async () => {
    const client = await createTestClient();
    cleanup = client.cleanup;
    const { agent } = client;

    const registered = await agent.post('/api/auth/register').send({
      email: 'Ada@Example.com',
      password: 'password1',
    });
    expect(registered.status).toBe(201);
    expect(registered.body.user.email).toBe('ada@example.com');
    expect(registered.headers['set-cookie']?.join(';') ?? '').toContain('HttpOnly');

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('ada@example.com');

    const conflict = await agent.post('/api/auth/register').send({
      email: 'ada@example.com',
      password: 'password1',
    });
    expect(conflict.status).toBe(409);
    expect(conflict.body.error.code).toBe('CONFLICT');

    const loggedOut = await agent.post('/api/auth/logout');
    expect(loggedOut.status).toBe(204);
    const afterLogout = await agent.get('/api/auth/me');
    expect(afterLogout.status).toBe(401);

    const badLogin = await agent.post('/api/auth/login').send({
      email: 'ada@example.com',
      password: 'wrongpass',
    });
    expect(badLogin.status).toBe(401);
    expect(badLogin.body.error.code).toBe('UNAUTHORIZED');

    const login = await agent.post('/api/auth/login').send({
      email: 'ada@example.com',
      password: 'password1',
    });
    expect(login.status).toBe(200);
    const meAgain = await agent.get('/api/auth/me');
    expect(meAgain.status).toBe(200);
    expect(meAgain.body.user.id).toBe(registered.body.user.id);
  });
});
