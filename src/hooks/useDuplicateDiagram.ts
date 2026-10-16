import { useMutation } from '@/hooks/useMutation';
import { diagramService } from '@/services/diagram/diagramService';

export function useDuplicateDiagram() {
  return useMutation((id: string, name?: string) => diagramService.duplicate(id, name));
}
