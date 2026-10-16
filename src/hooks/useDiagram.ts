import { useRequest } from '@/hooks/useRequest';
import { diagramService } from '@/services/diagram/diagramService';

export function useDiagram(diagramId: string | undefined) {
  const request = useRequest(() => diagramService.getFull(diagramId!), [diagramId], { enabled: !!diagramId, refreshOnChange: false });
  return { diagram: request.data, loading: request.loading, error: request.error, notFound: request.notFound, reload: request.reload };
}
