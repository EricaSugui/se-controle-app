import { api } from './client';
import type { Casa, EixoAcerto, MembroCasa } from '../../types';

export function createCasa(nome: string): Promise<Casa> {
  return api.post<Casa>('/casas', { nome });
}

// nome é obrigatório no PUT; acerto_eixo omitido preserva o valor atual.
export function updateCasa(
  id: number,
  input: { nome: string; acerto_eixo?: EixoAcerto }
): Promise<Casa> {
  return api.put<Casa>(`/casas/${id}`, input);
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

export function removerMembro(casaId: number, pessoaId: number): Promise<void> {
  return api.delete<void>(`/casas/${casaId}/pessoas/${pessoaId}`);
}

export function convidarMembro(casaId: number, email: string, papel: 'membro' | 'admin'): Promise<void> {
  const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  return api.post<void>('/convites', { email, casa_id: casaId, papel, expires_at });
}
