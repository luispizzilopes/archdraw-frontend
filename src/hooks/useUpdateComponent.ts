import { toPropertiesDto } from '@/domain/apiMappers';
import { useMutation } from '@/hooks/useMutation';
import { componentService } from '@/services/architecturalComponent/componentService';
import type { ComponentProperties } from '@/types';

export function useUpdateComponent() {
  return useMutation(
    (id: string, typeId: string, properties: ComponentProperties) =>
      componentService.update(id, { typeId, properties: toPropertiesDto({ ...properties, linkedDiagramId: undefined }) }),
    { invalidate: false },
  );
}
