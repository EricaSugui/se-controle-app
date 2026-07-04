import { api } from './client';
import type { Pessoa } from '../../types';

export function getPessoas(ativo?: boolean): Promise<Pessoa[]> {
  const query = ativo !== undefined ? `?ativo=${ativo}` : '';
  return api.get<Pessoa[]>(`/pessoas${query}`);
}

export function getPessoasRelacionadas(ativo?: boolean): Promise<Pessoa[]> {
  const query = ativo !== undefined ? `?ativo=${ativo}` : '';
  return api.get<Pessoa[]>(`/pessoas/relacionadas${query}`);
}
