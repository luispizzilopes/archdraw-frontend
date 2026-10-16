import { useRequest } from '@/hooks/useRequest';
import { authService } from '@/services/auth/authService';

export function useProfile() {
  const { data, loading, error, reload } = useRequest(() => authService.getProfile(), [], { refreshOnChange: false });
  return { profile: data, loading, error, reload };
}
