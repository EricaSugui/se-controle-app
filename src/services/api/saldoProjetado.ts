import { api } from './client';
import type { SaldoProjetado } from '../../types';

export function getSaldoProjetado(ate?: string): Promise<SaldoProjetado> {
  const query = ate ? `?ate=${ate}` : '';
  return api.get<SaldoProjetado>(`/saldo-projetado${query}`);
}
