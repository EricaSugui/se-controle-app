import { api } from './client';
import type { DespesaFixa, DespesaFixaInput, DespesaFixaStatusItem } from '../../types';

export function getDespesasFixas(filtros?: {
  casaId?: number;
  pessoaId?: number;
  vigente?: boolean;
}): Promise<DespesaFixa[]> {
  const params: string[] = [];
  if (filtros?.casaId != null) params.push(`casa_id=${filtros.casaId}`);
  if (filtros?.pessoaId != null) params.push(`pessoa_id=${filtros.pessoaId}`);
  if (filtros?.vigente != null) params.push(`vigente=${filtros.vigente}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<DespesaFixa[]>(`/despesas-fixas${query}`);
}

export function getDespesaFixa(id: number): Promise<DespesaFixa> {
  return api.get<DespesaFixa>(`/despesas-fixas/${id}`);
}

export function createDespesaFixa(input: DespesaFixaInput): Promise<DespesaFixa> {
  return api.post<DespesaFixa>('/despesas-fixas', input);
}

export function updateDespesaFixa(id: number, input: DespesaFixaInput): Promise<DespesaFixa> {
  return api.put<DespesaFixa>(`/despesas-fixas/${id}`, input);
}

export function encerrarDespesaFixa(id: number, vigenteAte?: string): Promise<DespesaFixa> {
  return api.patch<DespesaFixa>(
    `/despesas-fixas/${id}/encerrar`,
    vigenteAte ? { vigente_ate: vigenteAte } : undefined
  );
}

export function getStatusDespesasFixas(
  competencia?: string,
  folgaDias?: number
): Promise<DespesaFixaStatusItem[]> {
  const params: string[] = [];
  if (competencia) params.push(`competencia=${competencia}`);
  if (folgaDias != null) params.push(`folga_dias=${folgaDias}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return api.get<DespesaFixaStatusItem[]>(`/despesas-fixas/status${query}`);
}
