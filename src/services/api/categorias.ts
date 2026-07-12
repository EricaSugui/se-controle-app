import { api } from './client';
import type { Categoria } from '../../types';

export function getCategorias(ativo?: boolean): Promise<Categoria[]> {
  const query = ativo !== undefined ? `?ativo=${ativo}` : '';
  return api.get<Categoria[]>(`/categorias${query}`);
}

export function createCategoria(nome: string): Promise<Categoria> {
  return api.post<Categoria>('/categorias', { nome });
}

export function updateCategoria(id: number, nome: string): Promise<Categoria> {
  return api.put<Categoria>(`/categorias/${id}`, { nome });
}

export function ativarCategoria(id: number): Promise<Categoria> {
  return api.patch<Categoria>(`/categorias/${id}/ativar`);
}

export function desativarCategoria(id: number): Promise<Categoria> {
  return api.patch<Categoria>(`/categorias/${id}/desativar`);
}
