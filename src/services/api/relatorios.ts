import { api } from './client';
import type { EixoAcerto, RelatorioGastos } from '../../types';

// de/ate omitidos: o backend usa a janela de 6 meses terminando na
// competência atual (fuso do usuário).
export function getRelatorioGastos(
  casaId: number,
  opts?: { de?: string; ate?: string; eixo?: EixoAcerto }
): Promise<RelatorioGastos> {
  const params = [`casa_id=${casaId}`];
  if (opts?.de) params.push(`de=${opts.de}`);
  if (opts?.ate) params.push(`ate=${opts.ate}`);
  if (opts?.eixo) params.push(`eixo=${opts.eixo}`);
  return api.get<RelatorioGastos>(`/relatorios/gastos?${params.join('&')}`);
}
