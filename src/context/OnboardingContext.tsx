import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { dispensarOnboarding, getOnboarding, reabrirOnboarding, updateOnboarding } from '../services/api/onboarding';
import { useAuth } from './AuthContext';
import type { Onboarding, OnboardingEtapa, OnboardingPerfil } from '../types';

type OnboardingContextValue = {
  onboarding: Onboarding | null;
  loading: boolean;
  error: string | null;
  atualizar: (input: { perfil?: OnboardingPerfil | null; etapa_atual?: OnboardingEtapa }) => Promise<void>;
  dispensar: () => Promise<void>;
  reabrir: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [onboarding, setOnboarding] = useState<Onboarding | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    if (user == null) {
      setOnboarding(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setOnboarding(await getOnboarding());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Não foi possível carregar o onboarding.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function atualizar(input: { perfil?: OnboardingPerfil | null; etapa_atual?: OnboardingEtapa }) {
    setOnboarding(await updateOnboarding({ ...input, status: 'in_progress' }));
  }

  async function dispensar() {
    setOnboarding(await dispensarOnboarding());
  }

  async function reabrir() {
    setOnboarding(await reabrirOnboarding());
  }

  return (
    <OnboardingContext.Provider value={{ onboarding, loading, error, atualizar, dispensar, reabrir }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding deve ser usado dentro de OnboardingProvider');
  return ctx;
}
