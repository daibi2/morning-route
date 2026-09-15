import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../app';
import { createTestClient } from '../test/createTestApp';
import { signAccessToken } from '../lib/jwt';

describe('requireAuth', () => {
  it('rejects missing cookies and accepts a valid access token', async () => {
    const { agent, cleanup, deps } = await createTestClient();
    try {
      const unauth = await agent.get('/api/auth/me');
      expect(unauth.status).toBe(401);
      expect(unauth.body).toEqual({
        error: { code: 'UNAUTHORIZED', message: '未登录' },
      });

      const created = await agent
        .post('/api/auth/register')
        .send({ email: 'gate@example.com', password: 'password1' });
      expect(created.status).toBe(201);

      const forged = signAccessToken('missing-user', deps.jwtSecret);
      const missing = await request(createApp(deps))
        .get('/api/auth/me')
        .set('Cookie', `accessToken=${forged}`);
      expect(missing.status).toBe(401);
    } finally {
      await cleanup();
    }
  });
});
