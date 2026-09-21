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

  it('shows the registration help link to the right of the submit button and points it at the baidu doc', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );
    const button = screen.getByRole('button', { name: '注册' });
    const help = screen.getByRole('link', { name: '注册详细说明，你需要到百度去查看文档----' });
    expect(help).toHaveAttribute('href', 'https://www.baidu.com');
    // 文案与按钮同父容器且 DOM 顺序在按钮之后；「位于右侧」是视觉呈现，
    // jsdom 无法断言布局，由部署环境的真实浏览器实测核验（仓库内无视觉回归用例）。
    expect(help.parentElement).toBe(button.parentElement);
    expect(button.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
