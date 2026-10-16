import { getComponentType } from '@/data/componentCatalog';
import type {
  ArchitecturalComponent,
  BundleDiagram,
  BundleDocument,
  Diagram,
  DocumentRecord,
  Project,
  ProjectBundle,
  ReusableComponent,
} from '@/types';
import { UserFacingError } from '@/utils/apiError';
import { nowIso } from '@/utils/id';

export function componentToReusable(c: ArchitecturalComponent): ReusableComponent {
  const def = getComponentType(c.typeId);
  return { id: c.id, typeId: c.typeId, size: { ...def.size }, properties: c.properties, savedAt: c.updatedAt };
}

export function buildBundle(input: {
  project: Project;
  diagrams: Diagram[];
  documents: DocumentRecord[];
  components: ArchitecturalComponent[];
}): ProjectBundle {
  const { project, diagrams, documents, components } = input;
  const { diagramCount: _count, ...base } = project;
  void _count;
  const bundleDocs: BundleDocument[] = documents
    .filter((d): d is DocumentRecord & { scope: 'project' | 'diagram' } => d.scope !== 'component')
    .map((d) => ({
      id: `${d.scope}:${d.ownerId}`,
      scope: d.scope,
      ownerId: d.ownerId,
      projectId: d.projectId,
      content: d.content,
      updatedAt: d.updatedAt ?? nowIso(),
    }));

  return {
    format: 'archdraw.project',
    version: 1,
    exportedAt: nowIso(),
    project: { ...base, reusableComponents: components.map(componentToReusable) },
    diagrams: diagrams as BundleDiagram[],
    documents: bundleDocs,
  };
}

export function parseBundle(text: string): ProjectBundle {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new UserFacingError('O arquivo não é um JSON válido.');
  }
  const b = data as Partial<ProjectBundle>;
  if (!b || b.format !== 'archdraw.project') throw new UserFacingError('Arquivo não reconhecido (formato archdraw.project esperado).');
  if (b.version !== 1) throw new UserFacingError(`Versão de arquivo não suportada: ${String(b.version)}.`);
  if (!b.project?.id || !b.project.name) throw new UserFacingError('Projeto inválido no arquivo.');
  if (!Array.isArray(b.diagrams) || !Array.isArray(b.documents)) throw new UserFacingError('Diagramas ou documentos ausentes.');
  for (const d of b.diagrams) {
    if (!d.id || !Array.isArray(d.nodes) || !Array.isArray(d.edges)) throw new UserFacingError(`Diagrama inválido: ${d?.name ?? '?'}.`);
  }
  return b as ProjectBundle;
}

export function bundleToMarkdown(bundle: ProjectBundle, slug: (s: string) => string): { filename: string; text: string } {
  const { project, diagrams, documents } = bundle;
  const byId = new Map(documents.map((d) => [d.id, d]));
  const parts: string[] = [byId.get(`project:${project.id}`)?.content ?? `# ${project.name}`];
  for (const d of [...diagrams].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const c = byId.get(`diagram:${d.id}`)?.content;
    if (c?.trim()) parts.push(`---\n\n${c}`);
  }
  return { filename: `${slug(project.name)}.md`, text: parts.join('\n\n') };
}
