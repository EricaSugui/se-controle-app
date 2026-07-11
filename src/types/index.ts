export type ReceitaInput = {
  casa_id: number;
  pessoa_id: number | null;
  origem_id: number | null;
  observacao: string | null;
  valor_bruto: number | null;
  descontos: number | null;
  valor_liquido: number;
  data: string | null;
  competencia: string | null;
};

export type Receita = ReceitaInput & {
  id: number;
  lancado_por_id: number | null;
  pessoa_nome: string | null;
  origem_nome: string | null;
  pode_editar: boolean;
  created_at: string;
};

export type OrigemReceita = {
  id: number;
  nome: string;
  ativo: boolean;
  created_at: string;
};

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  grupoId?: string;
};

export type Casa = {
  id: number;
  nome: string;
  ativo: boolean;
  created_at: string;
};

export type MembroCasa = {
  id: number;
  pessoa_id: number;
  nome: string;
  email: string;
  papel: 'admin' | 'membro';
};

export type CasaDashboard = {
  id: number;
  nome: string;
  receitas_total: number;
  gastos_total: number;
  saldo_casa: number;
  percentual_custeio: number;
  minha_parte: number;
};

export type Dashboard = {
  competencia: string;
  minha_parte_total: number;
  casas: CasaDashboard[];
};

export type Pessoa = {
  id: number;
  nome: string;
  email: string | null;
  ativo: boolean;
};

export type CartaoContaInput = {
  nome: string;
  tipo: 'credito' | 'debito';
  titular_id: number | null;
  limite: number | null;
  dia_fechamento: number | null;
  dia_vencimento: number | null;
};

export type CartaoConta = CartaoContaInput & {
  id: number;
  ativo: boolean;
  created_at: string;
  pode_editar: boolean;
};

export type CartaoCasaVisibilidadeInput = {
  casa_id: number;
  compartilhado: boolean;
};

export type CartaoCasaVisibilidade = CartaoCasaVisibilidadeInput & {
  id: number;
  cartao_id: number;
  created_at: string;
};

export type Categoria = {
  id: number;
  nome: string;
  ativo: boolean;
  created_at: string;
};

export type FormaPagamento = {
  id: number;
  nome: string;
  ativo: boolean;
  created_at: string;
};

export type CompraInput = {
  casa_id: number;
  pessoa_id: number;
  categoria_id: number;
  descricao: string | null;
  cartao_conta_id: number | null;
  forma_pagamento_id: number | null;
  data: string;
  competencia: string;
  total_parcelas: number;
  valor_parcela: number;
};

export type Parcela = {
  id: number;
  compra_id: number;
  numero_parcela: number;
  valor: number;
  fatura_id: number | null;
  data_propria: string | null;
  data_caixa: string;
  fatura_mes_referencia: string | null;
  fatura_data_vencimento: string | null;
  created_at: string;
};

export type Compra = CompraInput & {
  id: number;
  lancado_por_id: number | null;
  pessoa_nome: string | null;
  categoria_nome: string | null;
  cartao_conta_nome: string | null;
  pode_editar: boolean;
  parcelas?: Parcela[]; // presente apenas nas respostas de POST/PUT
  created_at: string;
};

export type MetaInput = {
  objetivo: string;
  valor_atual: number;
  meta: number | null;
  falta: number | null;
  // exatamente um entre pessoa_id e casa_id; imutável após a criação
  pessoa_id: number | null;
  casa_id: number | null;
};

export type Meta = MetaInput & {
  id: number;
  created_at: string;
};

export type FaturaInput = {
  data_abertura: string | null;
  data_fechamento: string;
  data_vencimento: string;
};

export type Fatura = FaturaInput & {
  id: number;
  cartao_conta_id: number;
  mes_referencia: string;
  parcelas?: Parcela[]; // presente apenas em GET /faturas/{id}
  created_at: string;
};
