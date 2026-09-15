import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';

function Probe() {
  const { user, loading } = useAuth();
  if (loading) {
    return <p>加载中</p>;
  }
  return <p>{user ? user.email : '游客'}</p>;
}

describe('AuthProvider', () => {
  it('loads the current user from /api/auth/me', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          user: {
            id: '1',
            email: 'me@example.com',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        }),
      }),
    );
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
    await waitFor(() => {
      expect(screen.getByText('me@example.com')).toBeInTheDocument();
    });
    vi.unstubAllGlobals();
  });
});
