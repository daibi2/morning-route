import { useAuth } from '../auth/AuthContext';

export function HomePage() {
  const { user, logout } = useAuth();

  return (
    <section>
      <h1 className="text-2xl font-semibold text-stone-900">今日</h1>
      <p className="mt-2 text-stone-600">你好，{user?.email}。习惯打卡将在后续模块接入。</p>
      <button
        type="button"
        onClick={() => {
          void logout();
        }}
        className="mt-6 rounded-lg border border-stone-300 px-4 py-2 text-sm"
      >
        登出
      </button>
    </section>
  );
}
