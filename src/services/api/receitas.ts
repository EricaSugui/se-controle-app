import { api } from './client';
import type { Receita, ReceitaInput } from '../../types';

export function getReceitas(competencia?: string, receitaFixaId?: number): Promise<Receita[]> {
  const params: string[] = [];
  if (competencia) params.push(`competencia=${competencia}`);
  if (receitaFixaId != null) params.push(`receita_fixa_id=${receitaFixaId}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<Receita[]>(`/receitas${query}`);
}

export function createReceita(input: ReceitaInput): Promise<Receita> {
  return api.post<Receita>('/receitas', input);
}

export function updateReceita(id: number, input: ReceitaInput): Promise<Receita> {
  return api.put<Receita>(`/receitas/${id}`, input);
}

export function deleteReceita(id: number): Promise<void> {
  return api.delete<void>(`/receitas/${id}`);
}
