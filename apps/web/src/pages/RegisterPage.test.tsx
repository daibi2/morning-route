import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RegisterPage, REGISTER_HELP_TEXT } from './RegisterPage';

/** 工单验收原文（逐字），与组件常量分开声明：任一侧被改动都会让本用例失败。 */
const REQUIRED_HELP_TEXT = '注册详细说明，------你需要到百度去查看文档----！！！！';

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

  it('renders the help text constant verbatim (guards accidental copy edits)', () => {
    // 组件常量必须逐字等于工单原文，否则渲染层无法保证文案正确。
    expect(REGISTER_HELP_TEXT).toBe(REQUIRED_HELP_TEXT);
  });

  it('shows the registration help text after the submit button (visual right is covered by e2e)', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );
    const button = screen.getByRole('button', { name: '注册' });
    const help = screen.getByText(REQUIRED_HELP_TEXT);
    expect(help).toBeInTheDocument();
    // 单测只保证：文案与按钮同父容器、DOM 顺序在按钮之后、且只渲染一次。
    // 「视觉上位于按钮右侧（同一行、左缘在按钮右缘之外）」由 e2e 几何断言守护
    // （apps/web/e2e/register-help.spec.ts 的 boundingBox 检查 + 截图）。
    expect(help.parentElement).toBe(button.parentElement);
    expect(button.compareDocumentPosition(help) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByTestId('register-help-text')).toHaveLength(1);
  });
});
