export function competenciaAtual(): string {
  const now = new Date();
  const mes = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const ano = String(now.getFullYear()).slice(-2);
  return `${mes}-${ano}`;
}
