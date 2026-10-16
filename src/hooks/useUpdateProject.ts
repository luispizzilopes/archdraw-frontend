import { useMutation } from '@/hooks/useMutation';
import { projectService } from '@/services/project/projectService';
import type { SaveProjectPayload } from '@/types/api';

export function useUpdateProject() {
  return useMutation((id: string, payload: SaveProjectPayload) => projectService.update(id, payload));
}
