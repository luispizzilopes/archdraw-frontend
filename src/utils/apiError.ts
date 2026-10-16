import { isAxiosError } from 'axios';
import type { ApiErrorBody } from '@/types/api';

interface ApiErrorOptions {
  on401?: string;
}

export class UserFacingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserFacingError';
  }
}

export function getApiErrorBody(err: unknown): ApiErrorBody | undefined {
  if (!isAxiosError(err)) return undefined;
  const data = err.response?.data as Partial<ApiErrorBody> | undefined;
  return data && typeof data === 'object' && 'code' in data ? (data as ApiErrorBody) : undefined;
}

export function getApiErrorStatus(err: unknown): number | undefined {
  return isAxiosError(err) ? err.response?.status : undefined;
}

export function isNetworkError(err: unknown): boolean {
  return isAxiosError(err) && !err.response;
}

export function extractApiError(err: unknown, options?: ApiErrorOptions): string {
  if (err instanceof UserFacingError) return err.message;
  if (isAxiosError(err)) {
    const body = getApiErrorBody(err);
    if (body?.errors?.length) {
      const unique = [...new Set(body.errors.map((e) => e.description))];
      return unique.join(' ');
    }
    if (body?.description) return body.description;
    if (!err.response) return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.';
    if (err.response.status === 401) return options?.on401 ?? 'Sessão expirada. Faça login novamente.';
    if (err.response.status === 403) return 'Você não tem permissão para esta ação.';
    if (err.response.status === 404) return 'Recurso não encontrado.';
    if (err.response.status === 413) return 'O conteúdo enviado é grande demais.';
    if (err.response.status === 429) return 'Muitas tentativas. Aguarde e tente novamente.';
  }
  return 'Ocorreu um erro inesperado. Tente novamente.';
}
