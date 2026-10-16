import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function PrivateRoutes() {
  const { isAuthenticated, restoring } = useAuth();
  const location = useLocation();

  if (restoring) return <div className="page loading">Carregando…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}
