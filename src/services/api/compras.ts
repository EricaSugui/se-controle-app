import { api } from './client';
import type { Compra, CompraInput, Parcela } from '../../types';

export function getCompras(competencia?: string, despesaFixaId?: number): Promise<Compra[]> {
  const params: string[] = [];
  if (competencia) params.push(`competencia=${competencia}`);
  if (despesaFixaId != null) params.push(`despesa_fixa_id=${despesaFixaId}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<Compra[]>(`/compras${query}`);
}

export function getCompra(id: number): Promise<Compra> {
  return api.get<Compra>(`/compras/${id}`);
}

export function createCompra(input: CompraInput): Promise<Compra> {
  return api.post<Compra>('/compras', input);
}

export function updateCompra(id: number, input: CompraInput): Promise<Compra> {
  return api.put<Compra>(`/compras/${id}`, input);
}

export function deleteCompra(id: number): Promise<void> {
  return api.delete<void>(`/compras/${id}`);
}

export function getParcelasCompra(compraId: number): Promise<Parcela[]> {
  return api.get<Parcela[]>(`/compras/${compraId}/parcelas`);
}
