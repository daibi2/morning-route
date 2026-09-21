import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RegisterPage } from './RegisterPage';

// vitest 未开启 globals，RTL 不会自动注册 afterEach 清理，多用例渲染会互相污染 DOM
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

  it('renders the register explanation copy and help icon to the right of the submit button', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    const button = screen.getByRole('button', { name: '注册' });
    const row = screen.getByTestId('register-submit-row');
    const hint = screen.getByTestId('register-hint');
    const icon = screen.getByTestId('register-hint-icon');
    const tooltip = screen.getByTestId('register-hint-tooltip');

    // jsdom 无排版引擎，只能断言结构：按钮与说明同处一个「横排」容器，且说明在按钮之后、图标在说明之后。
    // 真正的左右位置（几何关系）由 E2E 在桌面视口下用 boundingBox 校验。
    expect(row).toContainElement(button);
    expect(row).toContainElement(hint);
    expect(row).toHaveClass('sm:flex-row');
    expect(button.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(hint.compareDocumentPosition(icon) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // 文案为工单要求的原文，后面紧跟一个「?」号图标
    expect(hint.textContent).toBe('注册详细说明请参考');
    expect(icon.tagName).toBe('BUTTON');
    expect(icon).toHaveAttribute('type', 'button');
    expect(icon.textContent).toBe('?');
    // 无障碍名称刻意不含「注册」二字：仓库既有 E2E 用 getByRole('button', { name: '注册' })
    // 定位提交按钮，Playwright 名称匹配是子串匹配，图标名称含「注册」会命中两个元素导致严格模式报错。
    expect(icon).toHaveAttribute('aria-label', '查看填写说明');

    // 「?」图标默认不展示明细，悬停 / 聚焦时弹出 tooltip，明细文案在其中
    expect(tooltip).toHaveClass('hidden');
    expect(tooltip).toHaveClass('group-hover:block');
    expect(tooltip).toHaveAttribute('role', 'tooltip');
    expect(tooltip.textContent).toBe(
      '邮箱需为有效地址，密码至少 8 位；注册成功后自动登录并进入今日打卡页。',
    );

    // 说明文案与按钮、明细与图标分别建立 a11y 关联，读屏可读出
    expect(button).toHaveAttribute('aria-describedby', hint.id);
    expect(hint).toHaveAttribute('id', 'register-hint');
    expect(icon).toHaveAttribute('aria-describedby', tooltip.id);
    expect(tooltip).toHaveAttribute('id', 'register-hint-detail');
  });
});
