import { api } from './client';
import type { Categoria } from '../../types';

export function getCategorias(ativo?: boolean): Promise<Categoria[]> {
  const query = ativo !== undefined ? `?ativo=${ativo}` : '';
  return api.get<Categoria[]>(`/categorias${query}`);
}
