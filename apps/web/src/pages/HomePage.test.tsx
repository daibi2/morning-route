import { render, screen } from '@testing-library/react';
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
  it('shows the signed-in email and logs out', async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    expect(screen.getByText(/me@example.com/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '登出' }));
    expect(logout).toHaveBeenCalled();
  });
});
