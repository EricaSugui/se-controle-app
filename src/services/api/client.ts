// const BASE_URL = 'https://se-controle-backend-production.up.railway.app';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

// Chamado quando uma requisição volta 401 — permite que o AuthContext
// limpe a sessão e mande de volta pro login mesmo fora de um componente.
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
  });

  if (!response.ok) {
    if (response.status === 401) onUnauthorized?.();
    const corpo = await response.json().catch(() => null) as { erro?: string } | null;
    throw new Error(corpo?.erro ?? `${response.status} ${response.statusText} — ${path}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
