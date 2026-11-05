import { api } from './client';
import type { Dashboard } from '../../types';

export function getDashboard(
  competencia: string,
  eixo?: 'caixa' | 'competencia',
  casaId?: number
): Promise<Dashboard> {
  const eixoQuery = eixo ? `&eixo=${eixo}` : '';
  const casaQuery = casaId == null ? '' : `&casa_id=${casaId}`;
  return api.get<Dashboard>(`/dashboard?competencia=${competencia}${eixoQuery}${casaQuery}`);
}
