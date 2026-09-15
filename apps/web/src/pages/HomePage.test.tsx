import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';

const logout = vi.fn().mockResolvedValue(undefined);

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      email: 'me@example.com',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout,
  }),
}));

describe('HomePage', () => {
  it('shows habits with streak and toggles check-in', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo) => {
      const url = String(input);
      if (url === '/api/habits') {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            habits: [
              {
                id: 'h1',
                userId: 'u1',
                title: '晨跑',
                archivedAt: null,
                sortOrder: 0,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
              },
            ],
          }),
        };
      }
      if (url.includes('/stats')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            habitId: 'h1',
            localDate: '2026-09-15',
            todayCheckedIn: false,
            currentStreak: 3,
            recent: [],
          }),
        };
      }
      return { ok: true, status: 200, json: async () => ({}) };
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    render(<HomePage />);
    expect(await screen.findByText('晨跑')).toBeInTheDocument();
    expect(screen.getByText('连续 3 天')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: '打卡 晨跑' }));
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });
    await user.click(screen.getByRole('button', { name: '登出' }));
    expect(logout).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});
