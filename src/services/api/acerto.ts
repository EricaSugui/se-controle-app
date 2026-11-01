import { api } from './client';
import type {
  AcertoContas,
  AcertoRelatorio,
  AcertoRelatorioResumo,
  PagamentoAcerto,
  PagamentoAcertoInput,
} from '../../types';

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

export function confirmarAcerto(casaId: number, idempotencyKey: string): Promise<AcertoRelatorio> {
  return api.postWithHeaders<AcertoRelatorio>(
    `/casas/${casaId}/acertos`,
    {},
    { 'Idempotency-Key': idempotencyKey },
  );
}

export function listarAcertos(casaId: number): Promise<AcertoRelatorioResumo[]> {
  return api.get<AcertoRelatorioResumo[]>(`/casas/${casaId}/acertos`);
}

export function obterAcerto(casaId: number, acertoId: number): Promise<AcertoRelatorio> {
  return api.get<AcertoRelatorio>(`/casas/${casaId}/acertos/${acertoId}`);
}

export function baixarArquivoAcerto(
  casaId: number,
  acertoId: number,
  formato: 'pdf' | 'csv',
): Promise<{ data: ArrayBuffer; filename: string | null }> {
  return api.getBinary(`/casas/${casaId}/acertos/${acertoId}/arquivo?formato=${formato}`);
}
