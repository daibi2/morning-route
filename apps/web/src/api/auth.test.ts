import { describe, expect, it, vi } from 'vitest';
import { login, register } from './auth';

describe('auth api', () => {
  it('posts credentials to register and login', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        user: {
          id: '1',
          email: 'a@example.com',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    await register('a@example.com', 'password1');
    await login('a@example.com', 'password1');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.unstubAllGlobals();
  });
});
