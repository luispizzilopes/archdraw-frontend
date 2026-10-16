import { useRequest } from '@/hooks/useRequest';
import { projectService } from '@/services/project/projectService';

export function useProjects() {
  const { data, loading, error, reload } = useRequest(async () => (await projectService.getAll()).items, []);
  return { projects: data, loading, error, reload };
}
