// Agrupamento das listas de Despesas e Receitas no celular, no padrão dos
// apps de banco: um cabeçalho por dia (com o total do dia) e, embaixo, os
// lançamentos daquele dia. Dias do mais recente para o mais antigo; dentro do
// dia, o lançado por último primeiro. Lançamentos sem data (receitas podem
// não ter) ficam num grupo "Sem data" no fim.

export type GrupoDia<T> = {
  chave: string; // AAAA-MM-DD, ou 'sem-data'
  titulo: string; // "Hoje", "Ontem", "SEG, 24 NOV", "Sem data"
  total: number;
  data: T[]; // nome exigido pelo SectionList
};

const DIAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

function isoLocal(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export function rotuloDia(dataISO: string, hoje: Date = new Date()): string {
  const dia = dataISO.slice(0, 10);
  if (dia === isoLocal(hoje)) return 'Hoje';
  const ontem = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - 1);
  if (dia === isoLocal(ontem)) return 'Ontem';
  const [ano, mes, d] = dia.split('-').map(Number);
  const data = new Date(ano, mes - 1, d);
  return `${DIAS[data.getDay()]}, ${d} ${MESES[mes - 1]}`;
}

export function agruparPorDia<T extends { id: number }>(
  itens: T[],
  dataDe: (item: T) => string | null | undefined,
  valorDe: (item: T) => number,
  hoje: Date = new Date()
): GrupoDia<T>[] {
  const grupos = new Map<string, T[]>();
  for (const item of itens) {
    const data = dataDe(item);
    const chave = data ? data.slice(0, 10) : 'sem-data';
    const lista = grupos.get(chave);
    if (lista) lista.push(item);
    else grupos.set(chave, [item]);
  }

  return [...grupos.entries()]
    .sort(([a], [b]) => {
      if (a === 'sem-data') return 1;
      if (b === 'sem-data') return -1;
      return b.localeCompare(a);
    })
    .map(([chave, lista]) => ({
      chave,
      titulo: chave === 'sem-data' ? 'Sem data' : rotuloDia(chave, hoje),
      total: lista.reduce((soma, item) => soma + Number(valorDe(item)), 0),
      data: [...lista].sort((a, b) => b.id - a.id),
    }));
}
