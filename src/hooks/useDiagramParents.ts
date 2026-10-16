import { useRequest } from '@/hooks/useRequest';
import { diagramService } from '@/services/diagram/diagramService';

export function useDiagramParents(diagramId: string | undefined) {
  const { data, loading, error, reload } = useRequest(() => diagramService.getParents(diagramId!), [diagramId], {
    enabled: !!diagramId,
  });
  return { parents: data, loading, error, reload };
}
