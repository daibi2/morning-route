import { describe, expect, it, vi } from 'vitest';
import { apiRequest, ApiClientError } from './client';

describe('apiRequest', () => {
  it('parses the locked error envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: { code: 'UNAUTHORIZED', message: '未登录' } }),
      }),
    );
    await expect(apiRequest('/api/auth/me')).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
      message: '未登录',
    } satisfies Partial<ApiClientError>);
    vi.unstubAllGlobals();
  });

  it('returns JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ ok: true }),
      }),
    );
    await expect(apiRequest<{ ok: boolean }>('/api/health')).resolves.toEqual({ ok: true });
    vi.unstubAllGlobals();
  });
});
