import { api } from './client';
import type { Dashboard } from '../../types';

// O endpoint exige bearer token na implementação (a spec omite por engano);
// o client já envia o token em toda requisição.
export function getFechamentoMensal(de: string, ate: string): Promise<Dashboard[]> {
  return api.get<Dashboard[]>(`/fechamento-mensal?de=${de}&ate=${ate}`);
}
