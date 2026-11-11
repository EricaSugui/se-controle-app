
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { router } from 'expo-router';
import { supabase } from '../services/supabase/client';
import { getMe } from '../services/api/auth';
import { setAuthToken, setUnauthorizedHandler } from '../services/api/client';
import type { Usuario } from '../types';

type AuthContextValue = {
  user: Usuario | null;
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [initializing, setInitializing] = useState(true);

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.session) throw new Error('Não foi possível iniciar a sessão.');

    setAuthToken(data.session.access_token);

    const me = await getMe();
    setUser(me);
    setInitializing(false);
  }

  async function signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut({
        scope: 'local',
      });

      if (error) throw error;
    } finally {
      setAuthToken(null);
      setUser(null);
    }
  }

  async function refreshUser() {
    const me = await getMe();
    setUser(me);
  }

  useEffect(() => {
    setUnauthorizedHandler(() => {
      signOut();
      router.replace('/(auth)/login');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setAuthToken(session?.access_token ?? null);

      if (event === 'INITIAL_SESSION') {

        if (!session) {
          setUser(null);
          setInitializing(false);
          return;
        }

        void getMe()
          .then((me) => {
            setUser(me);
          })
          .catch((error) => {
            setUser(null);
          })
          .finally(() => setInitializing(false));
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setInitializing(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      setUnauthorizedHandler(null);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, initializing, signIn, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return ctx;
}
