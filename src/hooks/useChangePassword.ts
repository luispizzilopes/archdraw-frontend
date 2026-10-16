import { useMutation } from '@/hooks/useMutation';
import { authService } from '@/services/auth/authService';

export function useChangePassword() {
  return useMutation((payload: { currentPassword: string; newPassword: string }) => authService.changePassword(payload), {
    invalidate: false,
  });
}
