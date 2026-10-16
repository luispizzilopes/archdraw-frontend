import { PageLoading } from '@/components/ui/Skeleton';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function PublicRoutes() {
  const { isAuthenticated, restoring } = useAuth();

  if (restoring) return <PageLoading />;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
