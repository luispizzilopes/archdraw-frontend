import { useMutation } from '@/hooks/useMutation';
import { getUser, setUser } from '@/services/api/api';
import { authService } from '@/services/auth/authService';

export function useDeleteProfilePhoto() {
  return useMutation(
    async () => {
      await authService.deleteProfilePhoto();
      const current = getUser();
      if (current) setUser({ ...current, avatarUrl: undefined });
    },
    { invalidate: false },
  );
}
