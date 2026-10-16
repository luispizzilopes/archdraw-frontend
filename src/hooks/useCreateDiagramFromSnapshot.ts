import { toSnapshotBody } from '@/domain/apiMappers';
import { cloneSubgraph } from '@/domain/factories';
import { useMutation } from '@/hooks/useMutation';
import { diagramService } from '@/services/diagram/diagramService';
import type { Diagram } from '@/types';
import { newId } from '@/utils/id';

type Source = Pick<Diagram, 'nodes' | 'edges' | 'viewport' | 'settings'>;

export function useCreateDiagramFromSnapshot() {
  return useMutation(
    (projectId: string, meta: Pick<Diagram, 'name' | 'description' | 'level' | 'styleIds' | 'patternIds'>, content: Source) =>
      diagramService.create(projectId, {
        id: newId(),
        name: meta.name.slice(0, 120),
        description: meta.description,
        level: meta.level,
        styleIds: meta.styleIds,
        patternIds: meta.patternIds,
        snapshot: toSnapshotBody({ ...content, ...cloneSubgraph(content.nodes, content.edges, { x: 0, y: 0 }) }),
      }),
  );
}
