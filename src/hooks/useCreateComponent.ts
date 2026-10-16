import { toPropertiesDto } from '@/domain/apiMappers';
import { useMutation } from '@/hooks/useMutation';
import { componentService } from '@/services/architecturalComponent/componentService';
import type { ComponentProperties } from '@/types';
import { newId } from '@/utils/id';

export function useCreateComponent() {
  return useMutation((projectId: string, typeId: string, properties: ComponentProperties) =>
    componentService.create(projectId, { id: newId(), typeId, properties: toPropertiesDto({ ...properties, linkedDiagramId: undefined }) }),
  );
}
