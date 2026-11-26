import type { Compra, ParcelaCaixa } from '@/src/types';

// Linha da lista de Despesas nos dois eixos:
// - competência: uma linha por COMPRA, com o valor total;
// - caixa: uma linha por PARCELA que sai do caixa no mês, com o valor da
//   parcela, mostrada pela data da compra (como a fatura do cartão).
// Tabela, cards e detalhes trabalham só com este formato.
export type LinhaDespesa = {
  id: number; // chave da linha: id da compra (competência) ou da parcela (caixa)
  compraId: number; // editar e excluir agem sobre a compra
  data: string; // data da compra
  descricao: string | null;
  categoria_nome: string | null;
  pessoa_nome: string | null;
  cartao_conta_nome: string | null;
  valor: number; // total da compra (competência) ou valor da parcela (caixa)
  valorParcela: number;
  totalParcelas: number;
  numeroParcela: number | null; // só no caixa
  dataCaixa: string | null; // só no caixa: quando o dinheiro sai
  competencia: string;
  despesa_fixa_id: number | null;
  competencia_referencia: string | null;
  pode_editar: boolean;
};

export function deCompra(c: Compra): LinhaDespesa {
  return {
    id: c.id,
    compraId: c.id,
    data: c.data,
    descricao: c.descricao,
    categoria_nome: c.categoria_nome,
    pessoa_nome: c.pessoa_nome,
    cartao_conta_nome: c.cartao_conta_nome,
    valor: c.valor_parcela * c.total_parcelas,
    valorParcela: c.valor_parcela,
    totalParcelas: c.total_parcelas,
    numeroParcela: null,
    dataCaixa: null,
    competencia: c.competencia,
    despesa_fixa_id: c.despesa_fixa_id ?? null,
    competencia_referencia: c.competencia_referencia ?? null,
    pode_editar: c.pode_editar,
  };
}

export function deParcela(p: ParcelaCaixa): LinhaDespesa {
  return {
    id: p.parcela_id,
    compraId: p.compra_id,
    data: p.data,
    descricao: p.descricao,
    categoria_nome: p.categoria_nome,
    pessoa_nome: p.pessoa_nome,
    cartao_conta_nome: p.cartao_conta_nome,
    valor: Number(p.valor),
    valorParcela: Number(p.valor),
    totalParcelas: p.total_parcelas,
    numeroParcela: p.numero_parcela,
    dataCaixa: p.data_caixa,
    competencia: p.competencia,
    despesa_fixa_id: p.despesa_fixa_id,
    competencia_referencia: p.competencia_referencia,
    pode_editar: p.pode_editar,
  };
}

// Texto curto ao lado da linha: "2/3" no caixa, "3x" na competência; nada
// para compra à vista.
export function rotuloParcelas(l: LinhaDespesa): string | undefined {
  if (l.totalParcelas <= 1) return undefined;
  return l.numeroParcela != null ? `${l.numeroParcela}/${l.totalParcelas}` : `${l.totalParcelas}x`;
}
