import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiClientError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <button
            type="submit"
            disabled={submitting}
            aria-describedby="register-hint"
            className="w-full rounded-lg bg-sunrise-500 px-4 py-2 font-medium text-white hover:bg-sunrise-700 disabled:opacity-60 sm:w-auto sm:shrink-0"
          >
            注册
          </button>
          <div className="flex items-center gap-1.5">
            <p id="register-hint" className="text-xs leading-relaxed text-stone-500">
              注册详细说明请参考
            </p>
            <span className="group relative inline-flex">
              <button
                type="button"
                aria-label="查看填写说明"
                aria-describedby="register-hint-detail"
                className="flex h-5 w-5 cursor-help items-center justify-center rounded-full border border-stone-400 text-[11px] font-semibold leading-none text-stone-500 transition-colors hover:border-sunrise-500 hover:text-sunrise-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunrise-400"
              >
                ?
              </button>
              <span
                id="register-hint-detail"
                role="tooltip"
                className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 hidden w-60 -translate-x-1/2 rounded-lg bg-stone-900 px-3 py-2 text-xs leading-relaxed text-white shadow-lg group-hover:block group-focus-within:block sm:bottom-full sm:top-auto sm:mb-2 sm:mt-0"
              >
                邮箱需为有效地址，密码至少 8 位；注册成功后自动登录并进入今日打卡页。
              </span>
            </span>
          </div>
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
