import { api } from './client';
import type { Casa, MembroCasa } from '../../types';

export function createCasa(nome: string): Promise<Casa> {
  return api.post<Casa>('/casas', { nome });
}

export function vincularPessoa(casaId: number, pessoaId: number): Promise<void> {
  return api.post<void>(`/casas/${casaId}/pessoas`, { pessoa_id: pessoaId, papel: 'admin' });
}

export function desativarCasa(id: number): Promise<Casa> {
  return api.patch<Casa>(`/casas/${id}/desativar`);
}

export function getMembros(casaId: number): Promise<MembroCasa[]> {
  return api.get<MembroCasa[]>(`/casas/${casaId}/pessoas`);
}

export function convidarMembro(casaId: number, email: string, papel: 'membro' | 'admin', convidadoPorId: number): Promise<void> {
  const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  return api.post<void>('/convites', { email, convidado_por_id: convidadoPorId, casa_id: casaId, papel, expires_at });
}
