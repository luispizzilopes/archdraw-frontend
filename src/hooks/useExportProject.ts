import { useMutation } from '@/hooks/useMutation';
import { buildBundle, bundleToMarkdown } from '@/domain/projectBundle';
import { componentService } from '@/services/architecturalComponent/componentService';
import { diagramService } from '@/services/diagram/diagramService';
import { documentationService } from '@/services/documentation/documentationService';
import { projectService } from '@/services/project/projectService';
import type { ProjectBundle } from '@/types';
import { slugify } from '@/utils/id';

export async function loadProjectBundle(projectId: string): Promise<ProjectBundle> {
  const [project, summaries, components, projectDoc] = await Promise.all([
    projectService.getById(projectId),
    diagramService.getByProject(projectId),
    componentService.getByProject(projectId),
    documentationService.get('project', projectId),
  ]);
  const diagrams = await Promise.all(summaries.map((s) => diagramService.getFull(s.id)));
  const diagramDocs = await Promise.all(summaries.map((s) => documentationService.get('diagram', s.id)));
  return buildBundle({ project, diagrams, components, documents: [projectDoc, ...diagramDocs].filter((d) => d.revision > 0) });
}

export function useExportProject() {
  return useMutation(
    async (projectId: string, format: 'json' | 'markdown') => {
      const bundle = await loadProjectBundle(projectId);
      if (format === 'json') {
        return {
          filename: `${slugify(bundle.project.name)}.archdraw.json`,
          text: JSON.stringify(bundle, null, 2),
          mime: 'application/json',
        };
      }
      return { ...bundleToMarkdown(bundle, slugify), mime: 'text/markdown' };
    },
    { invalidate: false },
  );
}
