import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type Handler = (config: InternalAxiosRequestConfig) => { status: number; data?: unknown };
let handler: Handler;
const calls: { method?: string; url?: string; auth?: unknown }[] = [];

const adapter: AxiosAdapter = async (config) => {
  calls.push({ method: config.method, url: config.url, auth: config.headers.get('Authorization') });
  const { status, data } = handler(config);
  const response = { status, data, statusText: '', headers: {}, config };
  if (status >= 400) throw new AxiosError('fail', 'ERR_BAD_REQUEST', config, undefined, response as never);
  return response as never;
};

const session = (token: string) => ({ userId: 'u1', email: 'a@b.c', name: 'Ana', token, tokenExpiresAtUtc: '', profilePhotoUrl: null });

async function load() {
  vi.resetModules();
  axios.defaults.adapter = adapter;
  return import('@/services/api/api');
}

describe('api (interceptors de sessão)', () => {
  beforeEach(() => {
    calls.length = 0;
    localStorage.clear();
  });

  it('envia o access token em memória como Bearer', async () => {
    const mod = await load();
    handler = () => ({ status: 200, data: {} });
    mod.setToken('abc');
    await mod.default.get('/api/v1/projects');
    expect(calls[0].auth).toBe('Bearer abc');
  });

  it('401 em rota protegida renova a sessão uma vez e repete a requisição com o novo token', async () => {
    const mod = await load();
    handler = (c) => {
      if (c.url?.includes('/authentication/refresh')) return { status: 200, data: session('novo') };
      return c.headers.get('Authorization') === 'Bearer novo' ? { status: 200, data: { ok: true } } : { status: 401 };
    };
    mod.setToken('expirado');

    const { data } = await mod.default.get('/api/v1/projects');

    expect(data).toEqual({ ok: true });
    expect(calls.map((c) => c.url)).toEqual(['/api/v1/projects', '/api/v1/authentication/refresh', '/api/v1/projects']);
    expect(mod.getToken()).toBe('novo');
    expect(mod.getUser()?.name).toBe('Ana');
  });

  it('várias requisições com 401 simultâneo compartilham uma única renovação', async () => {
    const mod = await load();
    handler = (c) => {
      if (c.url?.includes('/authentication/refresh')) return { status: 200, data: session('novo') };
      return c.headers.get('Authorization') === 'Bearer novo' ? { status: 200, data: {} } : { status: 401 };
    };
    mod.setToken('expirado');
    await Promise.all([mod.default.get('/a'), mod.default.get('/b'), mod.default.get('/c')]);
    expect(calls.filter((c) => c.url?.includes('/refresh'))).toHaveLength(1);
  });

  it('se a renovação falha, limpa a sessão e avisa o AuthProvider (sem laço)', async () => {
    const mod = await load();
    const onUnauthorized = vi.fn();
    mod.setUnauthorizedHandler(onUnauthorized);
    mod.setUser({ userId: 'u1', name: 'Ana', email: null });
    mod.setToken('expirado');
    handler = () => ({ status: 401 });

    await expect(mod.default.get('/api/v1/projects')).rejects.toBeTruthy();

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    expect(mod.getToken()).toBeNull();
    expect(mod.getUser()).toBeNull();
    expect(calls.filter((c) => c.url?.includes('/refresh'))).toHaveLength(1);
  });

  it('401 em rotas de autenticação (login) não tenta renovar nem desloga', async () => {
    const mod = await load();
    const onUnauthorized = vi.fn();
    mod.setUnauthorizedHandler(onUnauthorized);
    handler = () => ({ status: 401, data: { code: 'Auth.InvalidCredentials' } });
    await expect(mod.default.post('/api/v1/authentication/login', {})).rejects.toBeTruthy();
    expect(calls).toHaveLength(1);
    expect(onUnauthorized).not.toHaveBeenCalled();
  });

  it('restoreSession usa o cookie e devolve false quando não há sessão', async () => {
    const mod = await load();
    handler = () => ({ status: 401 });
    expect(await mod.restoreSession()).toBe(false);
    handler = () => ({ status: 200, data: session('t1') });
    expect(await mod.restoreSession()).toBe(true);
    expect(mod.getToken()).toBe('t1');
  });
});
