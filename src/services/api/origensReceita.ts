import { api } from './client';
import type { OrigemReceita } from '../../types';

export function getOrigensReceita(ativo?: boolean): Promise<OrigemReceita[]> {
  const query = ativo !== undefined ? `?ativo=${ativo}` : '';
  return api.get<OrigemReceita[]>(`/origens-receita${query}`);
}

export function createOrigemReceita(nome: string): Promise<OrigemReceita> {
  return api.post<OrigemReceita>('/origens-receita', { nome });
}

export function updateOrigemReceita(id: number, nome: string): Promise<OrigemReceita> {
  return api.put<OrigemReceita>(`/origens-receita/${id}`, { nome });
}

export function ativarOrigemReceita(id: number): Promise<OrigemReceita> {
  return api.patch<OrigemReceita>(`/origens-receita/${id}/ativar`);
}

export function desativarOrigemReceita(id: number): Promise<OrigemReceita> {
  return api.patch<OrigemReceita>(`/origens-receita/${id}/desativar`);
}
