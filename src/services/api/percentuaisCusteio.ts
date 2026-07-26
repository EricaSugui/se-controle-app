import { api } from './client';
import type { PercentualCusteio } from '../../types';

export function getPercentuaisCusteio(
  casaId: number,
  competencia?: string
): Promise<PercentualCusteio[]> {
  const query = competencia ? `?competencia=${competencia}` : '';
  return api.get<PercentualCusteio[]>(`/casas/${casaId}/percentual-custeio${query}`);
}

// Upsert por (casa, pessoa, competência) — repetir o POST atualiza o valor.
export function setPercentualCusteio(
  casaId: number,
  input: { pessoa_id: number; competencia: string; percentual: number }
): Promise<PercentualCusteio> {
  return api.post<PercentualCusteio>(`/casas/${casaId}/percentual-custeio`, input);
}
