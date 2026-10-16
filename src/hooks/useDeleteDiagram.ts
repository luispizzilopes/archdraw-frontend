import { useMutation } from '@/hooks/useMutation';
import { diagramService } from '@/services/diagram/diagramService';

export function useDeleteDiagram() {
  return useMutation((id: string) => diagramService.remove(id));
}
