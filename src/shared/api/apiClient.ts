const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://api.scienceclub.local';

export type ApiClientOptions = RequestInit & {
  token?: string | null;
};

export async function apiClient<TResponse>(
  path: string,
  { token, headers, ...options }: ApiClientOptions = {},
) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(!(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!response.ok) {
    throw new Error('Nao foi possivel concluir a requisicao.');
  }

  return response.json() as Promise<TResponse>;
}
