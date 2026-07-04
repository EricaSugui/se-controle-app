import { api } from './client';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

type Pessoa = { id: number; nome: string; email: string };

async function requestComToken<T>(method: string, path: string, token: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { erro?: string };
    throw new Error(err.erro ?? `Erro ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function criarPessoa(nome: string, email: string, token: string): Promise<Pessoa> {
  return requestComToken<Pessoa>('POST', '/pessoas', token, { nome, email });
}

export function vincularConta(pessoaId: number, token: string): Promise<void> {
  return requestComToken<void>('POST', '/auth/vincular', token, { pessoa_id: pessoaId });
}

export function aceitarConvite(conviteToken: string, nome: string, accessToken: string): Promise<Pessoa> {
  return requestComToken<Pessoa>('PATCH', `/convites/token/${conviteToken}/aceitar`, accessToken, { nome });
}

export function convidarPessoa(email: string, convidadoPorId: number): Promise<void> {
  const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  return api.post<void>('/convites', { email, convidado_por_id: convidadoPorId, expires_at });
}
