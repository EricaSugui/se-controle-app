// Competência no formato MMM-AA com meses em PORTUGUÊS (AGO-26, não AUG-26) —
// é o formato que o backend gera e valida (se-controle-backend/src/utils/competencia.ts).
export const MESES_COMPETENCIA = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

export function competenciaAtual(): string {
  const now = new Date();
  const mes = MESES_COMPETENCIA[now.getMonth()];
  const ano = String(now.getFullYear()).slice(-2);
  return `${mes}-${ano}`;
}
