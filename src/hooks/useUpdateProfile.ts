import { useMutation } from '@/hooks/useMutation';
import { getUser, setUser } from '@/services/api/api';
import { authService } from '@/services/auth/authService';

export function useUpdateProfile() {
  return useMutation(
    async (name: string) => {
      const profile = await authService.updateProfile({ name });
      const current = getUser();
      if (current) setUser({ ...current, name: profile.name });
      return profile;
    },
    { invalidate: false },
  );
}
