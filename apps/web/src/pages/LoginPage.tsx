import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiClientError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
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
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : '登录失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-sunrise-700">
        Morning Route
      </p>
      <h1 className="mt-3 text-3xl font-semibold text-stone-900">登录</h1>
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-sunrise-500 px-4 py-2 font-medium text-white hover:bg-sunrise-700 disabled:opacity-60"
        >
          登录
        </button>
      </form>
      <p className="mt-6 text-sm text-stone-600">
        还没有账号？{' '}
        <Link className="text-sunrise-700 underline" to="/register">
          注册
        </Link>
      </p>
    </div>
  );
}
