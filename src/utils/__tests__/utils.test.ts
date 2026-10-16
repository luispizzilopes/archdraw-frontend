import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { draftStorage } from '@/utils/draftStorage';
import { extractApiError, getApiErrorBody, isNetworkError, UserFacingError } from '@/utils/apiError';
import { newId } from '@/utils/id';
import { validateEmail, validatePassword } from '@/utils/validation';

const axiosError = (status: number | undefined, data?: unknown) =>
  new AxiosError(
    'x',
    'ERR',
    undefined,
    undefined,
    status ? ({ status, data, statusText: '', headers: {}, config: {} } as never) : undefined,
  );

describe('extractApiError', () => {
  it('prefere as mensagens detalhadas da API', () => {
    const msg = extractApiError(
      axiosError(400, {
        code: 'X',
        description: 'Geral',
        type: 'Validation',
        errors: [
          { code: 'a', description: 'Senha curta.' },
          { code: 'b', description: 'Senha curta.' },
          { code: 'c', description: 'Sem número.' },
        ],
      }),
    );
    expect(msg).toBe('Senha curta. Sem número.');
  });

  it('cai para descrição, status e mensagem genérica', () => {
    expect(extractApiError(axiosError(409, { code: 'C', description: 'Conflito.', type: 'Conflict' }))).toBe('Conflito.');
    expect(extractApiError(axiosError(404))).toBe('Recurso não encontrado.');
    expect(extractApiError(axiosError(429))).toMatch(/Muitas tentativas/);
    expect(extractApiError(axiosError(undefined))).toMatch(/Sem conexão/);
    expect(extractApiError(new Error('boom'))).toMatch(/inesperado/);
  });

  it('mensagens de validação do cliente (UserFacingError) são preservadas', () => {
    expect(extractApiError(new UserFacingError('Arquivo não reconhecido.'))).toBe('Arquivo não reconhecido.');
  });

  it('expõe corpo estruturado e detecta falha de rede', () => {
    expect(
      getApiErrorBody(
        axiosError(409, { code: 'Diagram.RevisionConflict', description: 'd', type: 'Conflict', metadata: { currentRevision: 4 } }),
      )?.metadata?.currentRevision,
    ).toBe(4);
    expect(isNetworkError(axiosError(undefined))).toBe(true);
    expect(isNetworkError(axiosError(500))).toBe(false);
  });
});

describe('draftStorage', () => {
  const draft = {
    diagramId: 'd1',
    baseRevision: 3,
    savedAt: 'now',
    content: {
      nodes: [],
      edges: [],
      viewport: { x: 0, y: 0, zoom: 1 },
      settings: { showGrid: true, snapToGrid: true, gridSize: 20, showMinimap: false },
    },
  };

  it('grava, lê e limpa o rascunho por diagrama', () => {
    expect(draftStorage.read('d1')).toBeNull();
    draftStorage.write(draft);
    expect(draftStorage.read('d1')?.baseRevision).toBe(3);
    expect(draftStorage.read('outro')).toBeNull();
    draftStorage.clear('d1');
    expect(draftStorage.read('d1')).toBeNull();
  });

  it('ignora rascunho corrompido', () => {
    localStorage.setItem('archdraw:draft:d1', '{nao-json');
    expect(draftStorage.read('d1')).toBeNull();
  });
});

describe('validação e ids', () => {
  it('valida e-mail e senha como o servidor', () => {
    expect(validateEmail('a@b.co')).toBeNull();
    expect(validateEmail('a@b')).not.toBeNull();
    expect(validatePassword('Senha1234')).toBeNull();
    expect(validatePassword('curta1A')).toMatch(/8 caracteres/);
    expect(validatePassword('semmaiuscula1')).toMatch(/maiúscula/);
    expect(validatePassword('SEMMINUSCULA1')).toMatch(/minúscula/);
    expect(validatePassword('SemNumeroAqui')).toMatch(/número/);
  });

  it('gera Guids v4 únicos', () => {
    const ids = new Set(Array.from({ length: 50 }, newId));
    expect(ids.size).toBe(50);
    expect([...ids][0]).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
});
