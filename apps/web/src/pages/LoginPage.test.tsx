import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LoginPage } from './LoginPage';

const login = vi.fn().mockResolvedValue(undefined);

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login,
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe('LoginPage', () => {
  it('submits email and password', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText('邮箱'), 'a@example.com');
    await user.type(screen.getByLabelText('密码'), 'password1');
    await user.click(screen.getByRole('button', { name: '登录' }));
    expect(login).toHaveBeenCalledWith('a@example.com', 'password1');
  });
});
