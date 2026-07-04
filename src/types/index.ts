export type Gasto = {
  id: string;
  descricao: string;
  valor: number;
  data: string;
  categoriaId: string;
};

export type Receita = {
  id: string;
  descricao: string;
  valor: number;
  data: string;
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
