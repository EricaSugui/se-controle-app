export function formatCurrency(value: number): string {
  // Coage para número: NUMERIC do Postgres pode chegar como string em
  // backends antigos, e undefined/null não devem derrubar a tela inteira.
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(isoDate: string): string {
  const [ano, mes, dia] = isoDate.slice(0, 10).split('-').map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString('pt-BR');
}

export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });
}
