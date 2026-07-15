import { createContext, useContext, useState, type ReactNode } from 'react';
import { supabaseSignIn } from '../services/supabase/auth';
import { getMe } from '../services/api/auth';
import { setAuthToken } from '../services/api/client';
import type { Usuario } from '../types';

type AuthContextValue = {
  user: Usuario | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);

  async function signIn(email: string, password: string) {
    const { access_token } = await supabaseSignIn(email, password);
    setAuthToken(access_token);
    const me = await getMe();
    setUser(me);
  }

  function signOut() {
    setAuthToken(null);
    setUser(null);
  }

  // Ressincroniza o user após alterações no próprio cadastro (ex.: fuso
  // horário no perfil) — fora isso, o user só é carregado no signIn.
  async function refreshUser() {
    const me = await getMe();
    setUser(me);
  }

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
