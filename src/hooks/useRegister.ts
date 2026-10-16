import { useMutation } from '@/hooks/useMutation';
import { authService } from '@/services/auth/authService';
import type { RegisterPayload } from '@/types/auth';

export function useRegister() {
  return useMutation((payload: RegisterPayload) => authService.register(payload), { invalidate: false });
}
