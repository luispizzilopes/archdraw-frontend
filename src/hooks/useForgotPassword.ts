import { useMutation } from '@/hooks/useMutation';
import { authService } from '@/services/auth/authService';

export function useForgotPassword() {
  return useMutation((email: string) => authService.requestPasswordReset(email), { invalidate: false });
}
