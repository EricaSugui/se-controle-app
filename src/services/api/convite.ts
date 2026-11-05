import { api } from './client';

const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

type Pessoa = { id: number; nome: string; email: string };
export type ConviteRecebido = {
  id: number;
  casa_id: number | null;
  casa_nome: string | null;
  convidado_por_nome: string;
  papel: 'admin' | 'membro' | null;
  expires_at: string | null;
  created_at: string;
};

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

export function convidarPessoa(email: string): Promise<{ interno?: boolean }> {
  const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  return api.post<{ interno?: boolean }>('/convites', { email, expires_at });
}

export function getConvitesRecebidos(): Promise<ConviteRecebido[]> {
  return api.get<ConviteRecebido[]>('/convites/recebidos');
}

export function aceitarConviteRecebido(id: number): Promise<ConviteRecebido> {
  return api.patch<ConviteRecebido>(`/convites/recebidos/${id}/aceitar`);
}
