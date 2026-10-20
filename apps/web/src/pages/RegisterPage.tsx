import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiClientError } from '../api/client';
import { useAuth } from '../auth/AuthContext';

/**
 * 提交按钮右侧的「注册详细说明」文案，逐字符对齐工单原文：
 * 6 个半角连字符 U+002D + 4 个全角感叹号 U+FF01（易被误写成全角「－」或半角「!」）。
 * 抽成具名常量便于单测固化码点契约、避免后续再次被「对齐文案」误改。
 */
export const REGISTER_HELP_TEXT =
  '\u6ce8\u518c\u8be6\u7ec6\u8bf4\u660e\uff0c------\u4f60\u9700\u8981\u5230\u767e\u5ea6\u53bb\u67e5\u770b\u6587\u6863----\uff01\uff01\uff01\uff01';

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
        {/* 必须保持 nowrap：文案 max-content 宽 ~356px + 按钮 80px + gap 12px 已超过表单
            max-w-md(400px) 的内容宽，一旦允许 flex-wrap，文案会整体折到按钮「下方」，
            违背工单「按钮右侧」的验收点；nowrap 下文案在按钮右侧收缩并内部折行。 */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="shrink-0 rounded-lg bg-sunrise-500 px-6 py-2 font-medium text-white hover:bg-sunrise-700 disabled:opacity-60"
          >
            注册
          </button>
          <p className="text-sm text-stone-600" data-testid="register-help">
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
