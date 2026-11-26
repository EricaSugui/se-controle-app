// Espaço pessoal (Casa Pessoal no modelo). Princípio de linguagem: a pessoa
// nunca lê "casa" para o espaço dela; vê "Pessoal" e, em frases, "seu espaço
// pessoal". Especificação: se-controle-workspace,
// docs/planos/casa-pessoal-nucleo.md.

type CasaLike = { id: number; nome: string; pessoal?: boolean };

export const ROTULO_PESSOAL = 'Pessoal';

// Nome para exibir: "Pessoal" no espaço pessoal, o nome da casa nas demais.
export function nomeCasa(casa: CasaLike): string {
  return casa.pessoal ? ROTULO_PESSOAL : casa.nome;
}

// "Pessoal" primeiro; as demais na ordem em que vieram.
export function ordenarCasas<T extends CasaLike>(casas: T[]): T[] {
  return [...casas.filter((c) => c.pessoal), ...casas.filter((c) => !c.pessoal)];
}

// Só as casas compartilhadas (Mais → Casas, visibilidade de cartões, chip
// "Casa" das recorrências).
export function casasCompartilhadas<T extends CasaLike>(casas: T[]): T[] {
  return casas.filter((c) => !c.pessoal);
}

// Só o espaço pessoal (quem não criou nem entrou em nenhuma casa): os
// formulários não mostram a escolha "Lançar em" / "Pertence a".
export function soEspacoPessoal(casas: CasaLike[]): boolean {
  return casas.length === 1 && casas[0].pessoal === true;
}

export function espacoPessoal<T extends CasaLike>(casas: T[]): T | undefined {
  return casas.find((c) => c.pessoal);
}

// Casa que já vem escolhida num formulário novo: a única opção, se houver uma
// só; senão a casa principal do Perfil (se estiver entre as opções); senão
// nenhuma.
export function casaInicial(casas: CasaLike[], casaPrincipalId: number | null | undefined): number | null {
  if (casas.length === 1) return casas[0].id;
  if (casaPrincipalId != null && casas.some((c) => c.id === casaPrincipalId)) return casaPrincipalId;
  return null;
}
