import { api } from './client';
import type { Dashboard } from '../../types';

export function getDashboard(competencia: string): Promise<Dashboard> {
  return api.get<Dashboard>(`/dashboard?competencia=${competencia}`);
}
