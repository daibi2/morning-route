import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RegisterPage } from './RegisterPage';

// 本文件含多个渲染用例，需显式清理上一个用例的 DOM（项目未开启 vitest globals）。
afterEach(cleanup);

const register = vi.fn().mockResolvedValue(undefined);

vi.mock('../auth/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    login: vi.fn(),
    register,
    logout: vi.fn(),
  }),
}));

describe('RegisterPage', () => {
  it('submits a new account', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );
    await user.type(screen.getByLabelText('邮箱'), 'new@example.com');
    await user.type(screen.getByLabelText('密码'), 'password1');
    await user.click(screen.getByRole('button', { name: '注册' }));
    expect(register).toHaveBeenCalledWith('new@example.com', 'password1');
  });

  it('shows the registration help text to the right of the submit button', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );
    const button = screen.getByRole('button', { name: '注册' });
    const help = screen.getByText('----去上面查看怎么用-----');
    expect(help).toBeInTheDocument();
    // 文案与按钮同父容器且 DOM 顺序在按钮之后；视觉上的「右侧」由 e2e 截图验证
    expect(help.parentElement).toBe(button.parentElement);
    expect(button.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
