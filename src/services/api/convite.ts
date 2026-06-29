const BASE_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

type Pessoa = { id: number; nome: string; email: string };

async function postComToken<T>(path: string, token: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `Erro ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function criarPessoa(nome: string, email: string, token: string): Promise<Pessoa> {
  return postComToken<Pessoa>('/pessoas', token, { nome, email });
}

export function vincularConta(pessoaId: number, token: string): Promise<void> {
  return postComToken<void>('/auth/vincular', token, { pessoa_id: pessoaId });
}
