import { describe, expect, it } from 'vitest';
import { buildExampleBundle } from '@/domain/seedProject';
import { buildBundle, bundleToMarkdown, parseBundle } from '@/domain/projectBundle';
import type { DocumentRecord } from '@/types';

describe('parseBundle', () => {
  it('rejeita JSON inválido, formato desconhecido e versão não suportada', () => {
    expect(() => parseBundle('{')).toThrow('JSON válido');
    expect(() => parseBundle(JSON.stringify({ format: 'x' }))).toThrow('não reconhecido');
    expect(() => parseBundle(JSON.stringify({ format: 'archdraw.project', version: 2 }))).toThrow('não suportada');
  });

  it('valida projeto e diagramas', () => {
    const base = { format: 'archdraw.project', version: 1, project: { id: 'p', name: 'P' }, diagrams: [], documents: [] };
    expect(parseBundle(JSON.stringify(base)).project.name).toBe('P');
    expect(() => parseBundle(JSON.stringify({ ...base, project: {} }))).toThrow('Projeto inválido');
    expect(() => parseBundle(JSON.stringify({ ...base, diagrams: [{ id: 'd', name: 'D' }] }))).toThrow('Diagrama inválido');
  });
});

describe('projeto de exemplo', () => {
  const bundle = buildExampleBundle();

  it('é um bundle v1 válido, aceito pelo parser', () => {
    expect(() => parseBundle(JSON.stringify(bundle))).not.toThrow();
    expect(bundle.diagrams).toHaveLength(5);
  });

  it('usa Guids e mantém a integridade das conexões e dos vínculos entre diagramas', () => {
    const guid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    const diagramIds = new Set(bundle.diagrams.map((d) => d.id));
    expect(diagramIds.size).toBe(5);
    for (const d of bundle.diagrams) {
      expect(d.id).toMatch(guid);
      const nodeIds = new Set(d.nodes.map((n) => n.id));
      d.nodes.forEach((n) => {
        expect(n.id).toMatch(guid);
        if (n.properties.linkedDiagramId) expect(diagramIds.has(n.properties.linkedDiagramId)).toBe(true);
      });
      d.edges.forEach((e) => {
        expect(nodeIds.has(e.source)).toBe(true);
        expect(nodeIds.has(e.target)).toBe(true);
      });
    }
    expect(bundle.diagrams.flatMap((d) => d.nodes).some((n) => n.properties.linkedDiagramId)).toBe(true);
  });

  it('cada diagrama tem README e o projeto tem documentação', () => {
    expect(bundle.documents.filter((d) => d.scope === 'diagram')).toHaveLength(5);
    expect(bundle.documents.some((d) => d.scope === 'project')).toBe(true);
  });
});

describe('buildBundle / bundleToMarkdown', () => {
  it('ignora documentos de componente no arquivo e consolida o Markdown', () => {
    const src = buildExampleBundle();
    const docs: DocumentRecord[] = [
      { scope: 'project', ownerId: src.project.id, projectId: src.project.id, content: '# Projeto', revision: 1 },
      { scope: 'component', ownerId: 'c', projectId: src.project.id, content: 'x', revision: 1 },
      ...src.diagrams.map((d) => ({
        scope: 'diagram' as const,
        ownerId: d.id,
        projectId: src.project.id,
        content: `# ${d.name}`,
        revision: 1,
      })),
    ];
    const bundle = buildBundle({
      project: { ...src.project, diagramCount: 5 },
      diagrams: src.diagrams.map((d) => ({ ...d, revision: 1 })),
      documents: docs,
      components: [],
    });
    expect(bundle.documents.every((d) => d.scope !== ('component' as string))).toBe(true);
    expect(bundle.documents).toHaveLength(6);

    const md = bundleToMarkdown(bundle, (s) => s.toLowerCase().replace(/\W+/g, '-'));
    expect(md.filename).toBe('plataforma-de-e-commerce.md');
    expect(md.text.startsWith('# Projeto')).toBe(true);
    expect(md.text).toContain('# Contexto do sistema');
  });
});
