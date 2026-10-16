import { useRequest } from '@/hooks/useRequest';
import { projectService } from '@/services/project/projectService';

export function useDashboardSummary() {
  const { data, loading, error, reload } = useRequest(() => projectService.getSummary(), []);
  return { summary: data, loading, error, reload };
}
