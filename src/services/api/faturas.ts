import { api } from './client';
import type { Fatura, FaturaInput } from '../../types';

export function getFaturas(cartaoContaId: number): Promise<Fatura[]> {
  return api.get<Fatura[]>(`/faturas?cartao_conta_id=${cartaoContaId}`);
}

export function getFatura(id: number): Promise<Fatura> {
  return api.get<Fatura>(`/faturas/${id}`);
}

export function updateFatura(id: number, input: FaturaInput): Promise<Fatura> {
  return api.put<Fatura>(`/faturas/${id}`, input);
}
