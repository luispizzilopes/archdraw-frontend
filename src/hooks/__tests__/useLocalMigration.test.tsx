import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useLocalMigration } from '@/hooks/useLocalMigration';
import { legacyStorageService } from '@/services/legacy/legacyStorageService';
import { projectService } from '@/services/project/projectService';
import type { ProjectBundle } from '@/types';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { userId: 'u1', name: 'Ana', email: 'a@b.c' } }) }));
vi.mock('@/services/legacy/legacyStorageService', () => ({ legacyStorageService: { scan: vi.fn(), clear: vi.fn() } }));
vi.mock('@/services/project/projectService', () => ({ projectService: { importBundle: vi.fn() } }));

const legacy = vi.mocked(legacyStorageService);
const projects = vi.mocked(projectService);

const bundle = (id: string): ProjectBundle => ({
  format: 'archdraw.project',
  version: 1,
  exportedAt: '',
  diagrams: [],
  documents: [],
  project: { id, name: `Projeto ${id}`, description: '', secondaryStyleIds: [], reusableComponents: [], createdAt: '', updatedAt: '' },
});
const result = (alreadyImported = false) => ({
  projectId: 'x',
  alreadyImported,
  diagrams: 1,
  nodes: 2,
  connections: 1,
  components: 0,
  documents: 1,
  warnings: [],
});

describe('useLocalMigration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    legacy.scan.mockResolvedValue({ dbVersion: 1, supported: true, skipped: 0, bundles: [bundle('a'), bundle('b')] });
  });
  afterEach(() => localStorage.clear());

  it('sem dados locais não exibe nada', async () => {
    legacy.scan.mockResolvedValue(null);
    const { result: r } = renderHook(() => useLocalMigration());
    await waitFor(() => expect(r.current.phase).toBe('none'));
  });

  it('importa cada projeto como migração idempotente (asCopy=false) e relata o resultado', async () => {
    projects.importBundle.mockResolvedValueOnce(result()).mockResolvedValueOnce(result(true));
    const { result: r } = renderHook(() => useLocalMigration());
    await waitFor(() => expect(r.current.phase).toBe('ready'));
    expect(r.current.items).toHaveLength(2);

    await act(() => r.current.migrate());

    expect(projects.importBundle).toHaveBeenCalledTimes(2);
    expect(projects.importBundle.mock.calls.every(([, asCopy]) => asCopy === false)).toBe(true);
    expect(r.current.items.map((i) => i.state)).toEqual(['imported', 'already']);
    expect(r.current.phase).toBe('done');
    expect(r.current.allConfirmed).toBe(true);
  });

  it('nunca apaga o banco local sozinha: só limpa após tudo confirmado e por ação explícita', async () => {
    projects.importBundle.mockResolvedValue(result());
    const { result: r } = renderHook(() => useLocalMigration());
    await waitFor(() => expect(r.current.phase).toBe('ready'));

    await act(() => r.current.clearLocal());
    expect(legacy.clear).not.toHaveBeenCalled();

    await act(() => r.current.migrate());
    expect(legacy.clear).not.toHaveBeenCalled();

    await act(() => r.current.clearLocal());
    expect(legacy.clear).toHaveBeenCalledTimes(1);
  });

  it('com falha em algum projeto, bloqueia a limpeza e permite tentar de novo', async () => {
    projects.importBundle.mockResolvedValueOnce(result()).mockRejectedValueOnce(new Error('boom'));
    const { result: r } = renderHook(() => useLocalMigration());
    await waitFor(() => expect(r.current.phase).toBe('ready'));
    await act(() => r.current.migrate());

    expect(r.current.items.map((i) => i.state)).toEqual(['imported', 'failed']);
    expect(r.current.allConfirmed).toBe(false);
    await act(() => r.current.clearLocal());
    expect(legacy.clear).not.toHaveBeenCalled();
  });

  it('"agora não" é lembrado por usuário', async () => {
    const { result: r } = renderHook(() => useLocalMigration());
    await waitFor(() => expect(r.current.phase).toBe('ready'));
    act(() => r.current.dismiss());
    expect(r.current.dismissed).toBe(true);
    expect(localStorage.getItem('archdraw:migration-dismissed:u1')).toBe('1');
  });
});
