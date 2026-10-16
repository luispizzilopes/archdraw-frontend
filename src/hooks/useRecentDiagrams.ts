import { useRequest } from '@/hooks/useRequest';
import { diagramService } from '@/services/diagram/diagramService';

export function useRecentDiagrams(limit = 6) {
  const { data, loading, error, reload } = useRequest(() => diagramService.getRecent(limit), [limit]);
  return { recent: data, loading, error, reload };
}
