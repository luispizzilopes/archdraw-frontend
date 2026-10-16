import { useMutation } from '@/hooks/useMutation';
import { componentService } from '@/services/architecturalComponent/componentService';

export function useDeleteComponent() {
  return useMutation((id: string, detach: boolean) => componentService.remove(id, detach));
}
