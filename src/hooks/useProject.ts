import { useRequest } from '@/hooks/useRequest';
import { projectService } from '@/services/project/projectService';

export function useProject(projectId: string | undefined) {
  const { data, loading, error, reload } = useRequest(() => projectService.getById(projectId!), [projectId], {
    enabled: !!projectId,
  });
  return { project: data, loading, error, reload };
}
