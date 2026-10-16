import { useMutation } from '@/hooks/useMutation';
import { authService } from '@/services/auth/authService';
import type { LoginPayload } from '@/types/auth';

export function useLogin() {
  return useMutation((payload: LoginPayload) => authService.login(payload), { invalidate: false });
}
