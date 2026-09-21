import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RegisterPage } from './RegisterPage';

// vitest 未开启 globals，RTL 不会自动挂载 afterEach 清理，多用例渲染会互相污染 DOM
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

  it('renders the register explanation copy to the right of the submit button', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );
    const button = screen.getByRole('button', { name: '注册' });
    const hint = screen.getByTestId('register-hint');

    // jsdom 无排版引擎，只能断言结构：按钮与说明同处一个「横排」容器，且说明在按钮之后。
    // 真正的左右位置（几何关系）由 E2E 在桌面视口下用 boundingBox 校验。
    expect(hint.parentElement).toBe(button.parentElement);
    expect(hint.parentElement).toHaveClass('sm:flex-row');
    expect(button.compareDocumentPosition(hint) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(hint).toHaveTextContent(
      '注册说明：填写邮箱与密码即可完成注册，密码至少 8 位；注册成功后自动登录并进入今日打卡页。',
    );
    // 说明文案与按钮关联，读屏可读出
    expect(button).toHaveAttribute('aria-describedby', hint.id);
  });
});
