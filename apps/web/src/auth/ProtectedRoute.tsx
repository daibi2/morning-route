import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <p className="p-8 text-center text-stone-500">加载中…</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export function GuestRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <p className="p-8 text-center text-stone-500">加载中…</p>;
  }
  if (user) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
