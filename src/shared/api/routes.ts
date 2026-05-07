const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.scienceclub.local';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

interface RequestOptions {
  token?: string | null;
  headers?: Record<string, string>;
}

async function request<TResponse>(
  method: HttpMethod,
  path: string,
  body?: object | null,
  options: RequestOptions = {},
): Promise<TResponse> {
  const url = `${API_BASE_URL}${path}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...options.headers,
  };

  const config: RequestInit = {
    method,
    headers,
    ...(body && method !== 'GET' ? { body: JSON.stringify(body) } : {}),
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorMessage = 'Não foi possível concluir a requisição.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Ignora erro de parse
    }
    throw new Error(errorMessage);
  }

  // Se status 204, retorna vazio
  if (response.status === 204) {
    return {} as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

/**
 * Módulo de rotas centralizado para chamadas à API.
 * 
 * Uso:
 * ```ts
 * import { Routes } from '@/src/shared/api/routes';
 * 
 * const data = await Routes.get<MyType>('/api/some-endpoint');
 * const result = await Routes.post<MyType>('/api/create', { name: 'test' });
 * ```
 */
export const Routes = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>('GET', path, null, options),

  post: <T>(path: string, body?: object, options?: RequestOptions) =>
    request<T>('POST', path, body, options),

  patch: <T>(path: string, body?: object, options?: RequestOptions) =>
    request<T>('PATCH', path, body, options),

  put: <T>(path: string, body?: object, options?: RequestOptions) =>
    request<T>('PUT', path, body, options),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>('DELETE', path, null, options),
};
