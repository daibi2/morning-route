import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiClientError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

/**
 * /register 提交按钮右侧的说明文案（工单验收点：逐字对齐工单原文）。
 * 抽为常量供渲染层与单测/E2E 共同引用，避免渲染文案被逐字改坏而无人察觉。
 */
export const REGISTER_HELP_TEXT = '注册详细说明，------你需要到百度去查看文档----！！！！';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await register(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : '注册失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-sunrise-700">
        Morning Route
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-stone-900">注册</h1>
      <form className="mt-8 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <label className="block text-sm font-medium">
          邮箱
          <input
            className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block text-sm font-medium">
          密码
          <input
            className="mt-1 w-full rounded-lg border border-stone-300 bg-white px-3 py-2"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 rounded-lg bg-sunrise-500 px-6 py-2 font-medium text-white hover:bg-sunrise-700 disabled:opacity-60"
          >
            注册
          </button>
          <p data-testid="register-help-text" className="text-sm text-stone-600">
            {REGISTER_HELP_TEXT}
          </p>
        </div>
      </form>
      <p className="mt-6 text-sm text-stone-600">
        已有账号？{' '}
        <Link className="text-sunrise-700 underline" to="/login">
          登录
        </Link>
      </p>
    </div>
  );
}
