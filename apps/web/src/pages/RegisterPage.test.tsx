import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { REGISTER_HELP_TEXT, RegisterPage } from './RegisterPage';

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

  it('keeps the help text character-for-character identical to the ticket (codepoint contract)', () => {
    // 工单原文里 6 个半角连字符 U+002D + 4 个全角感叹号 U+FF01 极易被
    // 误写成全角「－」(U+FF0D) / 半角「!」(U+0021)，这里用码点逐字固化契约。
    const expected = [0x6ce8, 0x518c, 0x8be6, 0x7ec6, 0x8bf4, 0x660e, 0xff0c];
    expect([...REGISTER_HELP_TEXT].map((c) => c.codePointAt(0))).toEqual([
      ...expected,
      ...Array<number>(6).fill(0x2d),
      ...[0x4f60, 0x9700, 0x8981, 0x5230, 0x767e, 0x5ea6, 0x53bb, 0x67e5, 0x770b, 0x6587, 0x6863],
      ...Array<number>(4).fill(0x2d),
      ...Array<number>(4).fill(0xff01),
    ]);
    expect(REGISTER_HELP_TEXT).toHaveLength(32);
  });
});
