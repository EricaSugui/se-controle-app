import { api } from './client';
import type { OrigemReceita } from '../../types';

export function getOrigensReceita(ativo?: boolean): Promise<OrigemReceita[]> {
  const query = ativo !== undefined ? `?ativo=${ativo}` : '';
  return api.get<OrigemReceita[]>(`/origens-receita${query}`);
}
