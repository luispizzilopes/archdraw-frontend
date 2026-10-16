import { act, renderHook } from '@testing-library/react';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDocument } from '@/hooks/useDocument';
import { documentationService } from '@/services/documentation/documentationService';

vi.mock('@/services/documentation/documentationService', () => ({ documentationService: { get: vi.fn(), save: vi.fn() } }));
const svc = vi.mocked(documentationService);
const doc = (content: string, revision: number) => ({ scope: 'diagram' as const, ownerId: 'd1', projectId: 'p1', content, revision });
const conflict = () =>
  new AxiosError('c', 'ERR_BAD_REQUEST', undefined, undefined, { status: 409, data: {}, statusText: '', headers: {}, config: {} } as never);
const wait = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

describe('useDocument', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    svc.get.mockResolvedValue(doc('# inicial', 3));
    svc.save.mockImplementation(async (_s, _o, markdown, base) => doc(markdown, base + 1));
  });
  afterEach(() => vi.useRealTimers());

  async function setup() {
    const hook = renderHook(() => useDocument('diagram', 'd1'));
    await wait(0);
    return hook;
  }

  it('carrega o conteúdo e a revisão do servidor', async () => {
    const { result } = await setup();
    expect(result.current.content).toBe('# inicial');
  });

  it('salva com debounce enviando a revisão base e avança a revisão', async () => {
    const { result } = await setup();
    act(() => result.current.setContent('a'));
    act(() => result.current.setContent('ab'));
    act(() => result.current.setContent('abc'));
    await wait(700);
    expect(svc.save).toHaveBeenCalledTimes(1);
    expect(svc.save).toHaveBeenLastCalledWith('diagram', 'd1', 'abc', 3);
    expect(result.current.status).toBe('saved');

    act(() => result.current.setContent('abcd'));
    await wait(700);
    expect(svc.save).toHaveBeenLastCalledWith('diagram', 'd1', 'abcd', 4);
  });

  it('conflito preserva o texto local e permite manter a versão local', async () => {
    svc.save.mockRejectedValueOnce(conflict());
    const { result } = await setup();
    act(() => result.current.setContent('minha versão'));
    await wait(700);
    expect(result.current.status).toBe('conflict');
    expect(result.current.content).toBe('minha versão');

    svc.get.mockResolvedValueOnce(doc('versão do servidor', 8));
    await act(() => result.current.keepMine());
    expect(svc.save).toHaveBeenLastCalledWith('diagram', 'd1', 'minha versão', 8);
    expect(result.current.status).toBe('saved');
  });

  it('conflito: carregar a versão do servidor substitui o texto local', async () => {
    svc.save.mockRejectedValueOnce(conflict());
    const { result } = await setup();
    act(() => result.current.setContent('minha versão'));
    await wait(700);

    svc.get.mockResolvedValueOnce(doc('do servidor', 8));
    await act(() => result.current.useServer());
    expect(result.current.content).toBe('do servidor');
    expect(result.current.status).toBe('saved');
  });

  it('erro de rede mantém o texto e a nova tentativa envia o mesmo conteúdo', async () => {
    svc.save.mockRejectedValueOnce(new AxiosError('Network Error', 'ERR_NETWORK'));
    const { result } = await setup();
    act(() => result.current.setContent('não perder'));
    await wait(700);
    expect(result.current.status).toBe('error');

    await act(() => result.current.retry());
    expect(svc.save).toHaveBeenLastCalledWith('diagram', 'd1', 'não perder', 3);
    expect(result.current.status).toBe('saved');
  });

  it('avisa ao sair com texto ainda não salvo', async () => {
    const { result } = await setup();
    act(() => result.current.setContent('pendente'));
    const e = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
  });
});
