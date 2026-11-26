// Lógica do vínculo "lançamento → ocorrência de recorrência", compartilhada
// entre despesas (contas recorrentes) e receitas (receitas recorrentes).
// Proposta: docs/propostas/proposta-ux-vinculo-despesas-contas-recorrentes.md
// e proposta-ux-vinculo-receitas-recorrentes.md (workspace).
import type { DespesaFixaStatusItem, ReceitaFixaStatusItem } from '@/src/types';
import { formatCurrency } from './formatters';

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
  // O que já foi lançado para a ocorrência (só quando realizada).
  realizadoEm: string | null;
  valorRealizado: number | null;
  lancamentos: number;
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
    realizadoEm: item.realizado_em ?? null,
    valorRealizado: item.valor_realizado != null ? Number(item.valor_realizado) : null,
    lancamentos: item.lancamentos ?? 0,
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
    realizadoEm: item.realizado_em ?? null,
    valorRealizado: item.valor_realizado != null ? Number(item.valor_realizado) : null,
    lancamentos: item.lancamentos ?? 0,
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

// O que o formulário já sabe do lançamento e serve para sugerir. Receitas
// usam principalmente origem e pessoa (a descrição é sinal secundário);
// despesas, a descrição. Proposta de receitas, seção 4.3.
export type ContextoSugestao = {
  descricao: string;
  origemId?: number | null; // só receitas
  pessoaId?: number | null;
};

// Por que a recorrência parece corresponder ao lançamento, do sinal mais
// forte para o mais fraco; null = não é sugestão.
export function motivoSugestao(o: OcorrenciaRecorrente, ctx: ContextoSugestao): string | null {
  if (ctx.origemId != null && o.categoriaOuOrigemId === ctx.origemId) {
    return ctx.pessoaId != null && o.pessoaId === ctx.pessoaId ? 'Mesma origem e pessoa' : 'Mesma origem';
  }
  if (ehSugestao(o, ctx.descricao)) return 'Parece corresponder à descrição';
  return null;
}

function forcaSugestao(o: OcorrenciaRecorrente, ctx: ContextoSugestao): number {
  if (ctx.origemId != null && o.categoriaOuOrigemId === ctx.origemId) {
    return ctx.pessoaId != null && o.pessoaId === ctx.pessoaId ? 3 : 2;
  }
  return ehSugestao(o, ctx.descricao) ? 1 : 0;
}

const ORDEM_SITUACAO: Record<SituacaoOcorrencia, number> = {
  atrasada: 0,
  vence_hoje: 1,
  em_aberto: 2,
  justificada: 3,
  realizada: 4,
};

// Filtra pela busca e ordena: sugestões primeiro (as mais fortes antes),
// depois o que ainda falta (atrasada, vence hoje, em aberto) e por último o
// já realizado, por data. Nada some por causa da situação: contas já pagas
// continuam na lista.
export function filtrarEOrdenar(
  lista: OcorrenciaRecorrente[],
  busca: string,
  ctx: ContextoSugestao
): OcorrenciaRecorrente[] {
  const termo = normalizar(busca);
  return lista
    .filter((o) => termo === '' || normalizar(o.descricao).includes(termo))
    .map((o) => ({ o, forca: forcaSugestao(o, ctx) }))
    .sort((a, b) => {
      if (a.forca !== b.forca) return b.forca - a.forca;
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

// "Pagamento registrado em 10/11 · R$ 129,90" (Fase 1, item D). Com mais de
// um lançamento: "2 pagamentos registrados · R$ 229,90". Receita sem data:
// "Recebimento registrado · R$ 4.800,00". null quando não há nada lançado.
export function textoRealizado(tipo: TipoVinculo, o: OcorrenciaRecorrente): string | null {
  if (o.situacao !== 'realizada' || o.lancamentos === 0) return null;
  const nome = tipo === 'despesa' ? 'pagamento' : 'recebimento';
  const valor = o.valorRealizado != null ? ` · ${formatCurrency(o.valorRealizado)}` : '';
  if (o.lancamentos > 1) return `${o.lancamentos} ${nome}s registrados${valor}`;
  const Nome = nome[0].toUpperCase() + nome.slice(1);
  const data = o.realizadoEm ? ` em ${diaMes(o.realizadoEm)}` : '';
  return `${Nome} registrado${data}${valor}`;
}

function diaMes(dataISO: string): string {
  const [, mes, dia] = dataISO.slice(0, 10).split('-');
  return `${dia}/${mes}`;
}

// Fase 1, item C: além das ocorrências do mês escolhido, as ATRASADAS de
// outros meses (que o endpoint de status sem competência devolve), para quem
// paga hoje a conta do mês passado não precisar voltar o mês. Sem repetir.
export function juntarAtrasadas(
  doMes: OcorrenciaRecorrente[],
  abertas: OcorrenciaRecorrente[],
  competencia: string
): OcorrenciaRecorrente[] {
  const chaves = new Set(doMes.map((o) => `${o.id}|${o.competencia}`));
  const atrasadas = abertas.filter(
    (o) => o.situacao === 'atrasada' && o.competencia !== competencia && !chaves.has(`${o.id}|${o.competencia}`)
  );
  return [...doMes, ...atrasadas];
}
