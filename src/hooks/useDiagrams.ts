import { useRequest } from '@/hooks/useRequest';
import { diagramService } from '@/services/diagram/diagramService';

export function useDiagrams(projectId: string | undefined) {
  const { data, loading, error, reload } = useRequest(() => diagramService.getByProject(projectId!), [projectId], {
    enabled: !!projectId,
  });
  return { diagrams: data, loading, error, reload };
}
