import { useMutation } from '@/hooks/useMutation';
import { diagramService } from '@/services/diagram/diagramService';
import type { UpdateDiagramPayload } from '@/types/api';

export function useUpdateDiagram() {
  return useMutation((id: string, payload: UpdateDiagramPayload) => diagramService.update(id, payload));
}
