const nomesSeguros = /^[a-zA-Z0-9._-]+$/;

export function nomeArquivoRelatorio(nome: string | null, extensao: string): string {
  if (nome && nomesSeguros.test(nome)) return nome;
  return `relatorio-acerto.${extensao}`;
}
