import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function PublicRoutes() {
  const { isAuthenticated, restoring } = useAuth();

  if (restoring) return <div className="page loading">Carregando…</div>;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
