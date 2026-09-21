import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RegisterPage } from './RegisterPage';

// vitest.config.ts 未开启 globals（tsconfig 里的 vitest/globals 只是类型声明），
// RTL 仅在全局存在 afterEach 时才注册自动清理，故此处手动 cleanup，
// 否则多用例渲染会因 DOM 残留而互相污染。
afterEach(cleanup);

const register = vi.fn().mockResolvedValue(undefined);

// 模块级 mock 需在用例间清零，否则「不得被调用」类断言会串到上一个用例的调用记录
beforeEach(() => {
  vi.clearAllMocks();
});

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

  it('renders the register explanation copy and help icon next to the submit button', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    const button = screen.getByRole('button', { name: '注册' });
    const row = button.parentElement as HTMLElement;
    const hint = screen.getByText('注册详细说明请参考');
    const icon = screen.getByRole('button', { name: '查看填写说明' });
    const tooltip = screen.getByRole('tooltip');

    // jsdom 无排版引擎，只能断言文档结构：按钮与说明同处一个容器（sm 断点起横排），
    // 说明在按钮之后、图标在说明之后。左右几何关系由 e2e/register-hint.spec.ts
    // 在桌面视口下用 boundingBox 断言。
    expect(row).toContainElement(button);
    expect(row).toContainElement(hint);
    expect(row).toContainElement(icon);
    expect(row).toHaveClass('sm:flex-row');
    expect(button.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(hint.compareDocumentPosition(icon) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    // 文案为需求指定原文（勿改写），其后紧跟一个「?」号图标
    expect(hint.textContent).toBe('注册详细说明请参考');
    expect(icon.tagName).toBe('BUTTON');
    expect(icon.textContent).toBe('?');
    // 无障碍名称刻意不含「注册」二字：仓库既有 E2E 用 getByRole('button', { name: '注册' })
    // 定位提交按钮，Playwright 名称匹配是子串匹配，图标名称含「注册」会命中两个元素导致严格模式报错。
    expect(icon).toHaveAttribute('aria-label', '查看填写说明');
    // 更强的守护约束：名称含「注册」的按钮必须唯一
    // （RTL 此处为精确匹配，/注册/ 才等价于 Playwright 的子串匹配）
    expect(screen.getAllByRole('button', { name: /注册/ })).toHaveLength(1);

    // 图标必须显式声明 type="button"，否则在 form 内默认 submit，点击帮助图标会误提交注册表单
    expect(icon).toHaveAttribute('type', 'button');
    await user.click(icon);
    expect(register).not.toHaveBeenCalled();

    // 「?」图标默认不展示明细，由悬停 / 聚焦弹出（jsdom 无样式引擎，此处只能断言驱动该行为的 class；
    // 真实交互与几何关系见 e2e/register-hint.spec.ts）
    expect(tooltip).toHaveClass('hidden');
    expect(tooltip).toHaveClass('group-hover:block');
    expect(tooltip).toHaveClass('group-focus-within:block');
    expect(tooltip.textContent).toBe(
      '邮箱需为有效地址，密码至少 8 位；注册成功后自动登录并进入今日打卡页。',
    );

    // 说明文案与按钮、明细与图标分别建立 a11y 关联，读屏可读出
    expect(button).toHaveAttribute('aria-describedby', 'register-hint');
    expect(hint).toHaveAttribute('id', 'register-hint');
    expect(icon).toHaveAttribute('aria-describedby', 'register-hint-detail');
    expect(tooltip).toHaveAttribute('id', 'register-hint-detail');
  });
});
