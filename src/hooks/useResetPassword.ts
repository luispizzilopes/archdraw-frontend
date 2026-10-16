import { useMutation } from '@/hooks/useMutation';
import { authService } from '@/services/auth/authService';

export function useResetPassword() {
  return useMutation((payload: { email: string; code: string; newPassword: string }) => authService.confirmPasswordReset(payload), {
    invalidate: false,
  });
}
