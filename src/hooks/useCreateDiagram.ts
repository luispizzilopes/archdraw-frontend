import { buildCreateDiagramPayload, type NewDiagramInput } from '@/domain/newDiagram';
import { useMutation } from '@/hooks/useMutation';
import { diagramService } from '@/services/diagram/diagramService';
import { settingsService } from '@/services/settingsService';

export function useCreateDiagram() {
  return useMutation((projectId: string, input: NewDiagramInput) => {
    const s = settingsService.get();
    const payload = buildCreateDiagramPayload({ defaults: { showGrid: s.defaultShowGrid, snapToGrid: s.defaultSnapToGrid }, ...input });
    return diagramService.create(projectId, payload);
  });
}
