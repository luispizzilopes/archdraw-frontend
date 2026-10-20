import { AuthSkeleton } from '@/components/ui/Skeleton';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export function PublicRoutes() {
  const { isAuthenticated, restoring } = useAuth();

  if (restoring) return <AuthSkeleton />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
