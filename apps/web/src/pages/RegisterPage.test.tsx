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
    const help = screen.getByText('注册详细说明，------你需要到百度去查看文档----！！！！');
    expect(help).toBeInTheDocument();
    // 文案与按钮同父容器且 DOM 顺序在按钮之后；视觉上的「右侧」由 e2e 截图验证
    expect(help.parentElement).toBe(button.parentElement);
    expect(button.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders the extra test copy in the same container as the submit button, after it in DOM order', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );
    const button = screen.getByRole('button', { name: '注册' });
    const extra = screen.getByText('增加叶宇皓的测试');
    expect(extra).toBeInTheDocument();
    // jsdom 不做布局计算，这里只锁定结构不变量：同一父容器 + DOM 顺序在按钮之后。
    // 视觉上的「与按钮同一行且位于其右侧」需要真实布局，由 apps/web/e2e/register-extra-copy.spec.ts
    // 的 boundingBox 几何断言守护；本文件不声称已覆盖该验收点。
    expect(extra.parentElement).toBe(button.parentElement);
    expect(button.compareDocumentPosition(extra) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
