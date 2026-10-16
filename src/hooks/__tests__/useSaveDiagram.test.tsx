import { act, renderHook } from '@testing-library/react';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createDiagram, createNode } from '@/domain/factories';
import { useSaveDiagram } from '@/hooks/useSaveDiagram';
import { diagramService } from '@/services/diagram/diagramService';
import { useEditorStore } from '@/store/editorStore';
import type { Diagram } from '@/types';
import { draftStorage } from '@/utils/draftStorage';

vi.mock('@/services/diagram/diagramService', () => ({
  diagramService: { saveSnapshot: vi.fn(), update: vi.fn(), getById: vi.fn(), getFull: vi.fn(), create: vi.fn() },
}));

const svc = vi.mocked(diagramService);

const http = (status: number, data?: unknown) =>
  new AxiosError('erro', 'ERR_BAD_REQUEST', undefined, undefined, { status, data, statusText: '', headers: {}, config: {} } as never);
const networkError = () => new AxiosError('Network Error', 'ERR_NETWORK');

function makeDiagram(revision = 5): Diagram {
  return { ...createDiagram({ projectId: 'p1', name: 'Diagrama', nodes: [createNode('api-rest', { x: 0, y: 0 })] }), id: 'd1', revision };
}

const addNode = () => act(() => void useEditorStore.getState().addNode('db-relational', { x: 100, y: 0 }));
const wait = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

describe('useSaveDiagram', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    useEditorStore.getState().load(makeDiagram(5));
    svc.saveSnapshot.mockImplementation(async (_id, payload) => ({ revision: payload.baseRevision + 1, updatedAtUtc: 'now' }));
    svc.update.mockResolvedValue({} as never);
  });

  afterEach(() => {
    useEditorStore.getState().reset();
    vi.useRealTimers();
  });

  it('agrupa várias edições em um único envio com a revisão base do servidor', async () => {
    const { result } = renderHook(() => useSaveDiagram(true));
    addNode();
    addNode();
    addNode();
    expect(result.current.status).toBe('saving');
    expect(svc.saveSnapshot).not.toHaveBeenCalled();

    await wait(600);

    expect(svc.saveSnapshot).toHaveBeenCalledTimes(1);
    const [id, payload] = svc.saveSnapshot.mock.calls[0];
    expect(id).toBe('d1');
    expect(payload.baseRevision).toBe(5);
    expect(payload.nodes).toHaveLength(4);
    expect(useEditorStore.getState().serverRevision).toBe(6);
    expect(result.current.status).toBe('saved');
  });

  it('mudanças só de viewport não disparam salvamento', async () => {
    const { result } = renderHook(() => useSaveDiagram(true));
    act(() => useEditorStore.getState().setViewport({ x: 10, y: 10, zoom: 2 }));
    await wait(2000);
    expect(svc.saveSnapshot).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });

  it('o viewport pendente vai junto no próximo salvamento de conteúdo', async () => {
    renderHook(() => useSaveDiagram(true));
    act(() => useEditorStore.getState().setViewport({ x: 10, y: 10, zoom: 2 }));
    addNode();
    await wait(600);
    expect(svc.saveSnapshot.mock.calls[0][1].viewport).toEqual({ x: 10, y: 10, zoom: 2 });
  });

  it('metadados usam o endpoint próprio e não geram nova revisão de snapshot', async () => {
    renderHook(() => useSaveDiagram(true));
    act(() => useEditorStore.getState().setMeta({ name: 'Renomeado' }));
    await wait(600);
    expect(svc.update).toHaveBeenCalledWith('d1', expect.objectContaining({ name: 'Renomeado' }));
    expect(svc.saveSnapshot).not.toHaveBeenCalled();
  });

  it('edição durante o envio é enviada depois, com a revisão devolvida pelo primeiro envio', async () => {
    let release!: () => void;
    svc.saveSnapshot.mockImplementationOnce(
      (_id, payload) =>
        new Promise((resolve) => {
          release = () => resolve({ revision: payload.baseRevision + 1, updatedAtUtc: 'now' });
        }),
    );
    renderHook(() => useSaveDiagram(true));

    addNode();
    await wait(600);
    addNode();
    await wait(600);
    expect(svc.saveSnapshot).toHaveBeenCalledTimes(1);

    await act(async () => release());
    await wait(600);

    expect(svc.saveSnapshot).toHaveBeenCalledTimes(2);
    expect(svc.saveSnapshot.mock.calls[0][1].baseRevision).toBe(5);
    expect(svc.saveSnapshot.mock.calls[1][1].baseRevision).toBe(6);
    expect(svc.saveSnapshot.mock.calls[1][1].nodes).toHaveLength(3);
  });

  it('conflito 409 bloqueia novos envios, preserva o trabalho e permite manter a versão local', async () => {
    svc.saveSnapshot.mockRejectedValueOnce(
      http(409, { code: 'Diagram.RevisionConflict', description: 'x', type: 'Conflict', metadata: { currentRevision: 9 } }),
    );
    svc.getById.mockResolvedValue({ revision: 9 } as never);
    const { result } = renderHook(() => useSaveDiagram(true));

    addNode();
    await wait(600);
    expect(result.current.status).toBe('conflict');
    expect(result.current.conflictRevision).toBe(9);
    expect(useEditorStore.getState().nodes).toHaveLength(2);

    addNode();
    await wait(2000);
    expect(svc.saveSnapshot).toHaveBeenCalledTimes(1);

    await act(() => result.current.resolveKeepMine());
    expect(svc.saveSnapshot).toHaveBeenCalledTimes(2);
    expect(svc.saveSnapshot.mock.calls[1][1].baseRevision).toBe(9);
    expect(svc.saveSnapshot.mock.calls[1][1].nodes).toHaveLength(3);
    expect(result.current.status).toBe('saved');
  });

  it('conflito: usar a versão do servidor recarrega o editor e mantém o rascunho como rede de segurança', async () => {
    svc.saveSnapshot.mockRejectedValueOnce(http(409, { code: 'Diagram.RevisionConflict', description: 'x', type: 'Conflict' }));
    const server = { ...makeDiagram(9), name: 'Do servidor', nodes: [] };
    svc.getFull.mockResolvedValue(server);
    const { result } = renderHook(() => useSaveDiagram(true));

    addNode();
    await wait(600);
    expect(result.current.status).toBe('conflict');

    await act(() => result.current.resolveUseServer());
    const s = useEditorStore.getState();
    expect(s.nodes).toHaveLength(0);
    expect(s.serverRevision).toBe(9);
    expect(s.meta?.name).toBe('Do servidor');
    expect(result.current.status).toBe('saved');
  });

  it('falha de rede mantém as alterações, expõe o erro e permite nova tentativa', async () => {
    svc.saveSnapshot.mockRejectedValueOnce(networkError());
    const { result } = renderHook(() => useSaveDiagram(true));

    addNode();
    await wait(600);
    expect(result.current.status).toBe('error');
    expect(result.current.errorMessage).toMatch(/Sem conexão/);
    expect(result.current.hasUnsaved()).toBe(true);
    expect(draftStorage.read('d1')?.baseRevision).toBe(5);

    await act(() => result.current.retry());
    expect(svc.saveSnapshot).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('saved');
    expect(result.current.hasUnsaved()).toBe(false);
    expect(draftStorage.read('d1')).toBeNull();
  });

  it('tenta novamente sozinho após falha transitória', async () => {
    svc.saveSnapshot.mockRejectedValueOnce(networkError());
    const { result } = renderHook(() => useSaveDiagram(true));
    addNode();
    await wait(600);
    expect(result.current.status).toBe('error');
    await wait(5100);
    expect(svc.saveSnapshot).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('saved');
  });

  it('avisa ao sair da página enquanto há alterações não sincronizadas', async () => {
    renderHook(() => useSaveDiagram(true));
    const clean = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(clean);
    expect(clean.defaultPrevented).toBe(false);

    addNode();
    const dirty = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(dirty);
    expect(dirty.defaultPrevented).toBe(true);
  });

  it('salva imediatamente ao ocultar a aba', async () => {
    renderHook(() => useSaveDiagram(true));
    addNode();
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
    await wait(0);
    expect(svc.saveSnapshot).toHaveBeenCalledTimes(1);
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
  });

  it('desfazer/refazer entram no salvamento como qualquer edição', async () => {
    renderHook(() => useSaveDiagram(true));
    addNode();
    await wait(600);
    act(() => useEditorStore.getState().undo());
    await wait(600);
    expect(svc.saveSnapshot).toHaveBeenCalledTimes(2);
    expect(svc.saveSnapshot.mock.calls[1][1].nodes).toHaveLength(1);
    expect(svc.saveSnapshot.mock.calls[1][1].baseRevision).toBe(6);
  });
});
