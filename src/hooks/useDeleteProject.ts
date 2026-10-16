import { useMutation } from '@/hooks/useMutation';
import { projectService } from '@/services/project/projectService';

export function useDeleteProject() {
  return useMutation((id: string) => projectService.remove(id));
}
