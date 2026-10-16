import { diagramReadme } from '@/domain/docTemplates';
import { defaultSettings } from '@/domain/factories';
import { toSnapshotBody } from '@/domain/apiMappers';
import { getTemplate } from '@/domain/templates';
import type { DiagramLevel } from '@/types';
import type { CreateDiagramPayload } from '@/types/api';
import { newId } from '@/utils/id';

export interface NewDiagramInput {
  name: string;
  description?: string;
  templateId?: string;
  level?: DiagramLevel;
  styleIds?: string[];
  patternIds?: string[];
  defaults?: { showGrid: boolean; snapToGrid: boolean };
}

export function buildCreateDiagramPayload(input: NewDiagramInput): CreateDiagramPayload {
  const tpl = getTemplate(input.templateId ?? 'blank');
  const built = tpl.build();
  const name = input.name.trim();
  return {
    id: newId(),
    name,
    description: input.description?.trim() ?? '',
    level: input.level ?? tpl.level,
    styleIds: input.styleIds ?? tpl.styleIds,
    patternIds: input.patternIds ?? tpl.patternIds,
    snapshot: toSnapshotBody({
      nodes: built.nodes,
      edges: built.edges,
      viewport: { x: 0, y: 0, zoom: 1 },
      settings: defaultSettings(input.defaults),
    }),
    readme: built.readme || diagramReadme(name),
  };
}
