import { api } from './client';
import type { FormaPagamento } from '../../types';

export function getFormasPagamento(ativo?: boolean): Promise<FormaPagamento[]> {
  const query = ativo !== undefined ? `?ativo=${ativo}` : '';
  return api.get<FormaPagamento[]>(`/formas-pagamento${query}`);
}
