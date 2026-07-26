import { api } from './client';
import type {
  ReceitaFixa,
  ReceitaFixaExcecao,
  ReceitaFixaExcecaoInput,
  ReceitaFixaInput,
  ReceitaFixaStatusItem,
} from '../../types';

export function getReceitasFixas(filtros?: {
  casaId?: number;
  pessoaId?: number;
  vigente?: boolean;
}): Promise<ReceitaFixa[]> {
  const params: string[] = [];
  if (filtros?.casaId != null) params.push(`casa_id=${filtros.casaId}`);
  if (filtros?.pessoaId != null) params.push(`pessoa_id=${filtros.pessoaId}`);
  if (filtros?.vigente != null) params.push(`vigente=${filtros.vigente}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<ReceitaFixa[]>(`/receitas-fixas${query}`);
}

export function getReceitaFixa(id: number): Promise<ReceitaFixa> {
  return api.get<ReceitaFixa>(`/receitas-fixas/${id}`);
}

export function createReceitaFixa(input: ReceitaFixaInput): Promise<ReceitaFixa> {
  return api.post<ReceitaFixa>('/receitas-fixas', input);
}

export function updateReceitaFixa(id: number, input: ReceitaFixaInput): Promise<ReceitaFixa> {
  return api.put<ReceitaFixa>(`/receitas-fixas/${id}`, input);
}

// Reajuste atômico: encerra o contrato vigente em vigente_desde − 1 dia e
// cria o sucessor (que herda origem, descrição, tipo, periodicidade e conta
// destino) na mesma transação. dia_esperado_recebimento omitido herda o atual.
export function reajustarReceitaFixa(
  id: number,
  input: { valor_esperado: number; vigente_desde: string; dia_esperado_recebimento?: number }
): Promise<{ anterior: ReceitaFixa; nova: ReceitaFixa }> {
  return api.post<{ anterior: ReceitaFixa; nova: ReceitaFixa }>(
    `/receitas-fixas/${id}/reajustar`,
    input
  );
}

export function encerrarReceitaFixa(id: number, vigenteAte?: string): Promise<ReceitaFixa> {
  return api.patch<ReceitaFixa>(
    `/receitas-fixas/${id}/encerrar`,
    vigenteAte ? { vigente_ate: vigenteAte } : undefined
  );
}

export function getExcecoesReceitaFixa(receitaFixaId: number): Promise<ReceitaFixaExcecao[]> {
  return api.get<ReceitaFixaExcecao[]>(`/receitas-fixas/${receitaFixaId}/excecoes`);
}

export function createExcecaoReceitaFixa(
  receitaFixaId: number,
  input: ReceitaFixaExcecaoInput
): Promise<ReceitaFixaExcecao> {
  return api.post<ReceitaFixaExcecao>(`/receitas-fixas/${receitaFixaId}/excecoes`, input);
}

export function deleteExcecaoReceitaFixa(receitaFixaId: number, excecaoId: number): Promise<void> {
  return api.delete<void>(`/receitas-fixas/${receitaFixaId}/excecoes/${excecaoId}`);
}

export function getStatusReceitasFixas(
  competencia?: string,
  folgaDias?: number
): Promise<ReceitaFixaStatusItem[]> {
  const params: string[] = [];
  if (competencia) params.push(`competencia=${competencia}`);
  if (folgaDias != null) params.push(`folga_dias=${folgaDias}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<ReceitaFixaStatusItem[]>(`/receitas-fixas/status${query}`);
}
