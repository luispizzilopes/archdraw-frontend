import 'fake-indexeddb/auto';
import { openDB } from 'idb';
import { beforeEach, describe, expect, it } from 'vitest';
import { legacyStorageService } from '@/services/legacy/legacyStorageService';

const props = (name: string) => ({
  name,
  identifier: name,
  description: '',
  technology: '',
  responsibility: '',
  notes: '',
  links: [],
  metadata: {},
});

async function seed() {
  const db = await openDB('archdraw', 1, {
    upgrade(d) {
      d.createObjectStore('projects', { keyPath: 'id' });
      d.createObjectStore('diagrams', { keyPath: 'id' }).createIndex('byProject', 'projectId');
      d.createObjectStore('documents', { keyPath: 'id' }).createIndex('byProject', 'projectId');
    },
  });
  await db.put('projects', {
    id: 'p1',
    name: 'Legado',
    description: '',
    secondaryStyleIds: ['event-driven'],
    createdAt: 'a',
    updatedAt: 'b',
  });
  await db.put('projects', { id: 'p2', name: 'Outro', description: '', createdAt: 'a', updatedAt: 'b' });
  await db.put('diagrams', {
    id: 'd1',
    projectId: 'p1',
    name: 'D1',
    nodes: [{ id: 'n', type: 'api-rest', properties: props('A') }],
    edges: [],
  });
  await db.put('diagrams', { id: 'd-ruim', projectId: 'p1', name: 'Quebrado' });
  await db.put('documents', { id: 'project:p1', scope: 'project', ownerId: 'p1', projectId: 'p1', content: '# L', updatedAt: 'x' });
  db.close();
}

beforeEach(async () => {
  await legacyStorageService.clear();
});

describe('legacyStorageService', () => {
  it('sem banco local não há nada a migrar (e não cria banco vazio)', async () => {
    expect(await legacyStorageService.scan()).toBeNull();
    const names = (await indexedDB.databases()).map((d) => d.name);
    expect(names).not.toContain('archdraw');
  });

  it('lê projetos, diagramas e documentos agrupados por projeto, no formato do bundle v1', async () => {
    await seed();
    const scan = await legacyStorageService.scan();
    expect(scan?.supported).toBe(true);
    expect(scan?.dbVersion).toBe(1);

    const [p1, p2] = scan!.bundles;
    expect(p1.format).toBe('archdraw.project');
    expect(p1.version).toBe(1);
    expect(p1.project.name).toBe('Legado');
    expect(p1.project.reusableComponents).toEqual([]);
    expect(p1.diagrams.map((d) => d.id)).toEqual(['d1']);
    expect(p1.documents).toHaveLength(1);
    expect(p2.project.secondaryStyleIds).toEqual([]);
  });

  it('conta registros de formato inesperado como ignorados', async () => {
    await seed();
    expect((await legacyStorageService.scan())?.skipped).toBe(1);
  });

  it('não altera o banco ao ler (somente leitura)', async () => {
    await seed();
    await legacyStorageService.scan();
    const db = await openDB('archdraw');
    expect(await db.count('projects')).toBe(2);
    expect(await db.count('diagrams')).toBe(2);
    db.close();
  });

  it('clear remove o banco apenas quando chamado explicitamente', async () => {
    await seed();
    await legacyStorageService.scan();
    expect((await indexedDB.databases()).map((d) => d.name)).toContain('archdraw');
    await legacyStorageService.clear();
    expect((await indexedDB.databases()).map((d) => d.name)).not.toContain('archdraw');
  });
});
