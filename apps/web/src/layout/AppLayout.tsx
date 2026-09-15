import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-full px-3 py-1 text-sm ${isActive ? 'bg-sunrise-500 text-white' : 'text-stone-600 hover:text-stone-900'}`;

export function AppLayout() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-sunrise-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <p className="font-semibold text-stone-900">晨间习惯</p>
          <nav className="flex gap-2">
            <NavLink to="/" className={linkClass} end>
              今日
            </NavLink>
            <NavLink to="/habits" className={linkClass}>
              习惯
            </NavLink>
            <NavLink to="/stats" className={linkClass}>
              统计
            </NavLink>
          </nav>
          <p className="hidden text-xs text-stone-500 sm:block">{user?.email}</p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
