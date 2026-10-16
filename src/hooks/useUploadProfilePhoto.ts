import { useMutation } from '@/hooks/useMutation';
import { getUser, setUser } from '@/services/api/api';
import { authService } from '@/services/auth/authService';

export function useUploadProfilePhoto() {
  return useMutation(
    async (file: File) => {
      const url = await authService.uploadProfilePhoto(file);
      const current = getUser();
      if (current) setUser({ ...current, avatarUrl: url });
      return url;
    },
    { invalidate: false },
  );
}
