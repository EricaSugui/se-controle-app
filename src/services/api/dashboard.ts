import { api } from './client';
import type { Dashboard } from '../../types';

export function getDashboard(competencia: string, eixo?: 'caixa' | 'competencia'): Promise<Dashboard> {
  const eixoQuery = eixo ? `&eixo=${eixo}` : '';
  return api.get<Dashboard>(`/dashboard?competencia=${competencia}${eixoQuery}`);
}
