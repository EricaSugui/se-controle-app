import { api } from './client';
import type { CartaoConta, CartaoContaInput } from '../../types';

export function getCartoesContas(ativo?: boolean): Promise<CartaoConta[]> {
  const query = ativo !== undefined ? `?ativo=${ativo}` : '';
  return api.get<CartaoConta[]>(`/cartoes-contas${query}`);
}

export function createCartaoConta(input: CartaoContaInput): Promise<CartaoConta> {
  return api.post<CartaoConta>('/cartoes-contas', input);
}

export function updateCartaoConta(id: number, input: CartaoContaInput): Promise<CartaoConta> {
  return api.put<CartaoConta>(`/cartoes-contas/${id}`, input);
}

export function ativarCartaoConta(id: number): Promise<CartaoConta> {
  return api.patch<CartaoConta>(`/cartoes-contas/${id}/ativar`);
}

export function desativarCartaoConta(id: number): Promise<CartaoConta> {
  return api.patch<CartaoConta>(`/cartoes-contas/${id}/desativar`);
}
