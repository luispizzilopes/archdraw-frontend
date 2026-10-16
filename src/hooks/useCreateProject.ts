import { useMutation } from '@/hooks/useMutation';
import { projectService } from '@/services/project/projectService';
import type { SaveProjectPayload } from '@/types/api';
import { newId } from '@/utils/id';

export function useCreateProject() {
  return useMutation((payload: SaveProjectPayload) => projectService.create({ ...payload, id: payload.id ?? newId() }));
}
