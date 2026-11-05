import { api } from './client';
import type { Onboarding, OnboardingEtapa, OnboardingPerfil, OnboardingStatus } from '../../types';

export function getOnboarding(): Promise<Onboarding> {
  return api.get<Onboarding>('/onboarding');
}

export function updateOnboarding(input: {
  perfil?: OnboardingPerfil | null;
  etapa_atual?: OnboardingEtapa;
  status?: OnboardingStatus;
}): Promise<Onboarding> {
  return api.put<Onboarding>('/onboarding', input);
}

export function dispensarOnboarding(): Promise<Onboarding> {
  return api.post<Onboarding>('/onboarding/dispensar', {});
}

export function reabrirOnboarding(): Promise<Onboarding> {
  return api.post<Onboarding>('/onboarding/reabrir', {});
}
