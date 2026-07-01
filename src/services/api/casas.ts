import { api } from './client';
import type { Casa } from '../../types';

export function createCasa(nome: string): Promise<Casa> {
  return api.post<Casa>('/casas', { nome });
}

export function vincularPessoa(casaId: number, pessoaId: number): Promise<void> {
  return api.post<void>(`/casas/${casaId}/pessoas`, { pessoa_id: pessoaId, papel: 'admin' });
}

export function desativarCasa(id: number): Promise<Casa> {
  return api.patch<Casa>(`/casas/${id}/desativar`);
}
