import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { domains } from '@/data/domains';
import type { SessionResponse, SessionUser } from '@/types/auth';

const USER_KEY = 'archdraw:user';

export const USER_CHANGED_EVENT = 'archdraw:user-changed';
export const SESSION_REFRESHED_EVENT = 'archdraw:session-refreshed';

let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;
let unauthorizedHandler: (() => void) | null = null;

export const getToken = () => accessToken;
export const setToken = (token: string) => {
  accessToken = token;
};
export const removeToken = () => {
  accessToken = null;
};

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
  unauthorizedHandler = handler;
};

export const getUser = (): SessionUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
};

export const setUser = (user: SessionUser) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
  window.dispatchEvent(new CustomEvent(USER_CHANGED_EVENT));
};

export const removeUser = () => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch {}
};

const api = axios.create({
  baseURL: domains.api,
  withCredentials: true,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json' },
});

const sessionApi = axios.create({
  baseURL: domains.api,
  withCredentials: true,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

export function applySession(data: SessionResponse): void {
  setToken(data.token);
  setUser({ userId: data.userId, name: data.name, email: data.email, avatarUrl: data.profilePhotoUrl ?? undefined });
  window.dispatchEvent(new CustomEvent(SESSION_REFRESHED_EVENT));
}

async function requestSessionRefresh(): Promise<boolean> {
  const refresh = () =>
    sessionApi
      .post<SessionResponse>('/api/v1/authentication/refresh')
      .then(({ data }) => {
        applySession(data);
        return true;
      })
      .catch(() => {
        removeToken();
        removeUser();
        return false;
      });

  if ('locks' in navigator) return navigator.locks.request('archdraw-session-refresh', refresh);
  return refresh();
}

export function restoreSession(): Promise<boolean> {
  if (accessToken) return Promise.resolve(true);
  if (refreshPromise) return refreshPromise;
  refreshPromise = requestSessionRefresh().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface RetryableRequest extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let notifying = false;

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as RetryableRequest | undefined;
    const isAuthRequest = (config?.url ?? '').includes('/authentication/');

    if (status === 401 && config && !config._retry && !isAuthRequest) {
      config._retry = true;
      accessToken = null;
      if ((await restoreSession()) && getToken()) {
        config.headers.Authorization = `Bearer ${getToken()}`;
        return api(config);
      }
    }

    if (status === 401 && !isAuthRequest && !notifying) {
      notifying = true;
      removeToken();
      removeUser();
      unauthorizedHandler?.();
      notifying = false;
    }

    return Promise.reject(error);
  },
);

export default api;
