import { useMutation } from '@/hooks/useMutation';
import { buildExampleBundle } from '@/domain/seedProject';
import { projectService } from '@/services/project/projectService';

export function useLoadExampleProject() {
  return useMutation(() => projectService.importBundle(buildExampleBundle(), true));
}
