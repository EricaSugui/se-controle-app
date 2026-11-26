// Competência no formato MMM-AA com meses em PORTUGUÊS (AGO-26, não AUG-26) —
// é o formato que o backend gera e valida (se-controle-backend/src/utils/competencia.ts).
export const MESES_COMPETENCIA = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

export function competenciaAtual(): string {
  const now = new Date();
  const mes = MESES_COMPETENCIA[now.getMonth()];
  const ano = String(now.getFullYear()).slice(-2);
  return `${mes}-${ano}`;
}

// Competência derivada de uma data AAAA-MM-DD. Em formulários de lançamento o
// default deve vir da DATA do evento, nunca de "hoje" — lançar em julho uma
// receita de 30/06 deve pré-preencher JUN-26.
// Primeiro e último dia do mês de uma competência (MMM-AA), em AAAA-MM-DD.
// Usado na visão de caixa das listas (de/ate da API).
export function intervaloDaCompetencia(competencia: string): { de: string; ate: string } {
  const [mesStr, anoStr] = competencia.split('-');
  const mes = MESES_COMPETENCIA.indexOf(mesStr) + 1;
  const ano = 2000 + Number(anoStr);
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const mm = String(mes).padStart(2, '0');
  return { de: `${ano}-${mm}-01`, ate: `${ano}-${mm}-${String(ultimoDia).padStart(2, '0')}` };
}

export function competenciaDaData(dataISO: string): string {
  const [ano, mes] = dataISO.split('-');
  return `${MESES_COMPETENCIA[Number(mes) - 1]}-${ano.slice(-2)}`;
}
