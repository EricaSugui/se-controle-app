const SUPABASE_URL = 'https://ytjputnezihknmfeccok.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_API_KEY ?? '';

type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: { id: string; email: string };
};

type SupabaseError = {
  error: string;
  error_description?: string;
  msg?: string;
};

export async function supabaseUpdatePassword(novaSenha: string, token: string): Promise<void> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password: novaSenha }),
  });

  if (!response.ok) {
    const err: SupabaseError = await response.json();
    throw new Error(err.error_description ?? err.msg ?? 'Erro ao definir senha');
  }
}

type SignUpResult =
  | { status: 'ok'; session: SupabaseSession }
  | { status: 'pending_confirmation' };

export async function supabaseSignUp(email: string, password: string, nome: string): Promise<SignUpResult> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password, data: { nome } }),
  });

  if (!response.ok) {
    const err: SupabaseError = await response.json();
    throw new Error(err.error_description ?? err.msg ?? 'Erro ao criar conta');
  }

  const data = await response.json() as Partial<SupabaseSession>;
  if (!data.access_token) return { status: 'pending_confirmation' };
  return { status: 'ok', session: data as SupabaseSession };
}

export async function supabaseSignIn(email: string, password: string): Promise<SupabaseSession> {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const err: SupabaseError = await response.json();
    throw new Error(err.error_description ?? err.msg ?? 'Credenciais inválidas');
  }

  return response.json() as Promise<SupabaseSession>;
}
