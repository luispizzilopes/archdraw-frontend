import { useRequest } from '@/hooks/useRequest';
import { componentService } from '@/services/architecturalComponent/componentService';

export function useArchitecturalComponents(projectId: string | undefined) {
  const { data, loading, error, reload } = useRequest(() => componentService.getByProject(projectId!), [projectId], {
    enabled: !!projectId,
  });
  return { components: data, loading, error, reload };
}
