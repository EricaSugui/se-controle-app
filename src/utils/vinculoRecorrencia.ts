// Lógica do vínculo "lançamento → ocorrência de recorrência", compartilhada
// entre despesas (contas recorrentes) e receitas (receitas recorrentes).
// Proposta: docs/propostas/proposta-ux-vinculo-despesas-contas-recorrentes.md
// e proposta-ux-vinculo-receitas-recorrentes.md (workspace).
import type { DespesaFixaStatusItem, ReceitaFixaStatusItem } from '@/src/types';

export type TipoVinculo = 'despesa' | 'receita';

// Situação da ocorrência no período, com o mesmo vocabulário para os dois
// lados (diretriz de simetria entre receitas e despesas).
export type SituacaoOcorrencia = 'realizada' | 'em_aberto' | 'vence_hoje' | 'atrasada' | 'justificada';

export type OcorrenciaRecorrente = {
  id: number; // despesa_fixa_id ou receita_fixa_id
  descricao: string;
  casaId: number | null; // null = recorrência pessoal
  pessoaId: number | null;
  categoriaOuOrigemId: number;
  valorEsperado: number | null;
  valorFixo: boolean;
  competencia: string; // competência da ocorrência (MMM-AA)
  dataEsperada: string; // AAAA-MM-DD
  situacao: SituacaoOcorrencia;
};

const SITUACAO_DESPESA: Record<DespesaFixaStatusItem['status'], SituacaoOcorrencia> = {
  pago: 'realizada',
  em_dia: 'em_aberto',
  vencendo_hoje: 'vence_hoje',
  em_atraso: 'atrasada',
  justificado: 'justificada',
};

const SITUACAO_RECEITA: Record<ReceitaFixaStatusItem['status'], SituacaoOcorrencia> = {
  recebido: 'realizada',
  aguardando: 'em_aberto',
  atrasado: 'atrasada',
  justificado: 'justificada',
};

export function deDespesa(item: DespesaFixaStatusItem): OcorrenciaRecorrente {
  return {
    id: item.despesa_fixa_id,
    descricao: item.descricao,
    casaId: item.casa_id,
    pessoaId: item.pessoa_id,
    categoriaOuOrigemId: item.categoria_id,
    valorEsperado: item.valor_referencia,
    valorFixo: item.tipo_valor === 'fixo',
    competencia: item.competencia,
    dataEsperada: item.data_esperada,
    situacao: SITUACAO_DESPESA[item.status],
  };
}

export function deReceita(item: ReceitaFixaStatusItem): OcorrenciaRecorrente {
  return {
    id: item.receita_fixa_id,
    descricao: item.descricao,
    casaId: item.casa_id,
    pessoaId: item.pessoa_id,
    categoriaOuOrigemId: item.origem_id,
    valorEsperado: item.valor_esperado,
    valorFixo: item.tipo_confiabilidade === 'fixa',
    competencia: item.competencia,
    dataEsperada: item.data_esperada,
    situacao: SITUACAO_RECEITA[item.status],
  };
}

// Mesma regra do backend (validarVinculoDespesaFixa/ReceitaFixa): recorrência
// de casa só vincula a lançamento da mesma casa; recorrência pessoal só a
// lançamento da mesma pessoa.
export function noEscopo(o: OcorrenciaRecorrente, casaId: number | null, pessoaId: number | null): boolean {
  if (o.casaId !== null) return casaId !== null && o.casaId === casaId;
  return pessoaId !== null && o.pessoaId === pessoaId;
}

// O que a lista mostra: recorrências pessoais sempre; as da casa, só da casa
// escolhida (ou de todas, se nenhuma casa foi escolhida ainda). Escolher uma
// ajusta casa e pessoa do lançamento (ajusteDeEscopo).
export function visivelNoContexto(o: OcorrenciaRecorrente, casaId: number | null): boolean {
  return o.casaId === null || casaId === null || o.casaId === casaId;
}

// Casa e pessoa do lançamento depois de escolher a recorrência:
// - da casa: a casa passa a ser a do contrato; a pessoa é mantida se a casa
//   não mudou (senão fica vazia, para ser escolhida entre os membros);
// - pessoal: a pessoa passa a ser a dona do contrato; a casa é mantida.
export function ajusteDeEscopo(
  o: OcorrenciaRecorrente,
  atual: { casaId: number | null; pessoaId: number | null }
): { casaId: number | null; pessoaId: number | null } {
  if (o.casaId !== null) {
    return { casaId: o.casaId, pessoaId: atual.casaId === o.casaId ? atual.pessoaId : null };
  }
  return { casaId: atual.casaId, pessoaId: o.pessoaId };
}

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function palavras(texto: string): string[] {
  return normalizar(texto)
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length >= 3);
}

// Sugestão contextual: alguma palavra (3+ letras) da descrição do lançamento
// aparece no nome da recorrência, ou o contrário. É só ordem e destaque;
// nunca vincula sozinha.
export function ehSugestao(o: OcorrenciaRecorrente, descricaoLancamento: string): boolean {
  const doLancamento = palavras(descricaoLancamento);
  if (doLancamento.length === 0) return false;
  const daRecorrencia = palavras(o.descricao);
  return doLancamento.some((p) => daRecorrencia.some((r) => r.includes(p) || p.includes(r)));
}

const ORDEM_SITUACAO: Record<SituacaoOcorrencia, number> = {
  atrasada: 0,
  vence_hoje: 1,
  em_aberto: 2,
  justificada: 3,
  realizada: 4,
};

// Filtra pela busca e ordena: sugestões primeiro, depois o que ainda falta
// (atrasada, vence hoje, em aberto) e por último o já realizado, por data.
// Nada some por causa da situação: contas já pagas continuam na lista.
export function filtrarEOrdenar(
  lista: OcorrenciaRecorrente[],
  busca: string,
  descricaoLancamento: string
): OcorrenciaRecorrente[] {
  const termo = normalizar(busca);
  return lista
    .filter((o) => termo === '' || normalizar(o.descricao).includes(termo))
    .map((o) => ({ o, sugestao: ehSugestao(o, descricaoLancamento) }))
    .sort((a, b) => {
      if (a.sugestao !== b.sugestao) return a.sugestao ? -1 : 1;
      const porSituacao = ORDEM_SITUACAO[a.o.situacao] - ORDEM_SITUACAO[b.o.situacao];
      if (porSituacao !== 0) return porSituacao;
      return a.o.dataEsperada.localeCompare(b.o.dataEsperada);
    })
    .map(({ o }) => o);
}

const ROTULO: Record<TipoVinculo, Record<SituacaoOcorrencia, string>> = {
  despesa: {
    realizada: 'Já paga',
    em_aberto: 'Em aberto',
    vence_hoje: 'Vence hoje',
    atrasada: 'Atrasada',
    justificada: 'Justificada',
  },
  receita: {
    realizada: 'Já recebida',
    em_aberto: 'Aguardando',
    vence_hoje: 'Prevista para hoje',
    atrasada: 'Atrasada',
    justificada: 'Justificada',
  },
};

export function rotuloSituacao(tipo: TipoVinculo, situacao: SituacaoOcorrencia): string {
  return ROTULO[tipo][situacao];
}
