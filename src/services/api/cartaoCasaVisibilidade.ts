import { api } from './client';
import type { CartaoCasaVisibilidade, CartaoCasaVisibilidadeInput } from '../../types';

export function getVisibilidade(cartaoId: number): Promise<CartaoCasaVisibilidade[]> {
  return api.get<CartaoCasaVisibilidade[]>(`/cartoes-contas/${cartaoId}/visibilidade`);
}

export function criarVisibilidade(
  cartaoId: number,
  input: CartaoCasaVisibilidadeInput
): Promise<CartaoCasaVisibilidade> {
  return api.post<CartaoCasaVisibilidade>(`/cartoes-contas/${cartaoId}/visibilidade`, input);
}

export function atualizarVisibilidade(
  cartaoId: number,
  casaId: number,
  compartilhado: boolean
): Promise<CartaoCasaVisibilidade> {
  return api.patch<CartaoCasaVisibilidade>(`/cartoes-contas/${cartaoId}/visibilidade/${casaId}`, { compartilhado });
}

export function removerVisibilidade(cartaoId: number, casaId: number): Promise<void> {
  return api.delete<void>(`/cartoes-contas/${cartaoId}/visibilidade/${casaId}`);
}
