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

export type CasaDashboard = {
  id: number;
  nome: string;
  gastos_total: number;
  percentual_custeio: number;
  minha_parte: number;
};

export type Dashboard = {
  competencia: string;
  receitas_total: number;
  gastos_total: number;
  minha_parte_total: number;
  saldo: number;
  casas: CasaDashboard[];
};
