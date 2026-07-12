import { api } from './client';
import type { FormaPagamento } from '../../types';

export function getFormasPagamento(ativo?: boolean): Promise<FormaPagamento[]> {
  const query = ativo !== undefined ? `?ativo=${ativo}` : '';
  return api.get<FormaPagamento[]>(`/formas-pagamento${query}`);
}

export function createFormaPagamento(nome: string): Promise<FormaPagamento> {
  return api.post<FormaPagamento>('/formas-pagamento', { nome });
}

export function updateFormaPagamento(id: number, nome: string): Promise<FormaPagamento> {
  return api.put<FormaPagamento>(`/formas-pagamento/${id}`, { nome });
}

export function ativarFormaPagamento(id: number): Promise<FormaPagamento> {
  return api.patch<FormaPagamento>(`/formas-pagamento/${id}/ativar`);
}

export function desativarFormaPagamento(id: number): Promise<FormaPagamento> {
  return api.patch<FormaPagamento>(`/formas-pagamento/${id}/desativar`);
}
