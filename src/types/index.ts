export type Gasto = {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: string;
};

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

export type Orcamento = {
  id: string;
  categoriaId: string;
  limite: number;
  mes: string; // formato: "2025-01"
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
