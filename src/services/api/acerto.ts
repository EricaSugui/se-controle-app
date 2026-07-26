import { api } from './client';
import type { AcertoContas, PagamentoAcerto, PagamentoAcertoInput } from '../../types';

export function getAcerto(casaId: number): Promise<AcertoContas> {
  return api.get<AcertoContas>(`/casas/${casaId}/acerto`);
}

// Reembolso e adiantamento são o mesmo registro: uma transferência entre
// pessoas da casa que entra direto no saldo corrente do acerto.
export function registrarPagamentoAcerto(
  casaId: number,
  input: PagamentoAcertoInput
): Promise<PagamentoAcerto> {
  return api.post<PagamentoAcerto>(`/casas/${casaId}/acerto/pagamentos`, input);
}

export function excluirPagamentoAcerto(casaId: number, id: number): Promise<void> {
  return api.delete<void>(`/casas/${casaId}/acerto/pagamentos/${id}`);
}
