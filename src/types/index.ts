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
  receita_fixa_id?: number | null;
  competencia_referencia?: string | null; // MES-AA; exige receita_fixa_id
  // conta debito/aplicacao; em receita vinculada a fixa, chave OMITIDA herda
  // o default do contrato — null explícito significa "sem conta"
  conta_destino_id?: number | null;
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
  admin_sistema: boolean;
  fuso_horario: string; // IANA, ex. America/Sao_Paulo
};

export type Casa = {
  id: number;
  nome: string;
  ativo: boolean;
  acerto_eixo: EixoAcerto;
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

export type TipoCartaoConta = 'credito' | 'debito' | 'aplicacao';

export type CartaoContaInput = {
  nome: string;
  tipo: TipoCartaoConta;
  titular_id: number;
  // campos de um tipo enviados no outro → 400
  limite: number | null; // só credito
  dia_fechamento: number | null; // só credito
  dia_vencimento: number | null; // só credito
  conta_debito_id: number | null; // só credito; conta debito/aplicacao do MESMO titular
  saldo_base: number | null; // só debito/aplicacao; par com saldo_base_data
  saldo_base_data: string | null; // AAAA-MM-DD; par com saldo_base
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
  compartilha_saldo?: boolean; // consentimento independente; default false
};

export type CartaoCasaVisibilidade = CartaoCasaVisibilidadeInput & {
  id: number;
  cartao_id: number;
  compartilha_saldo: boolean;
  created_at: string;
};

export type Categoria = {
  id: number;
  nome: string;
  ativo: boolean;
  icone: string; // nome de ícone MaterialCommunityIcons
  cor: string; // hex, ex: "#FF7043"
  created_at: string;
};

export type FormaPagamento = {
  id: number;
  nome: string;
  exige_conta: boolean; // true → compra sem cartao_conta_id (após herança) é 400
  ativo: boolean;
  icone: string; // nome de ícone — normalmente MaterialCommunityIcons; ver ICONES_MATERIAL_ICONS
  cor: string; // hex, ex: "#8D6E63"
  created_at: string;
};

// Eixo do acerto de contas: competência = valor cheio no mês da compra;
// caixa = por parcela na data_caixa (no crédito, acompanha a fatura).
export type EixoAcerto = 'competencia' | 'caixa';

export type CompraInput = {
  casa_id: number;
  pessoa_id: number;
  categoria_id: number;
  descricao: string | null;
  // em compra vinculada a despesa fixa, chave OMITIDA herda o
  // cartao_conta_padrao_id do contrato — null explícito = sem cartão/conta
  cartao_conta_id?: number | null;
  forma_pagamento_id: number | null;
  data: string;
  competencia: string;
  total_parcelas: number;
  valor_parcela: number;
  despesa_fixa_id?: number | null;
  competencia_referencia?: string | null; // MES-AA; exige despesa_fixa_id
  acerto_eixo?: EixoAcerto | null; // null/omitido segue o padrão da casa
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

export type TipoValorDespesaFixa = 'fixo' | 'variavel_estimado';
export type PeriodicidadeDespesaFixa = 'mensal' | 'anual';
export type StatusDespesaFixa = 'pago' | 'em_dia' | 'vencendo_hoje' | 'em_atraso' | 'justificado';

export type DespesaFixaInput = {
  // exatamente um entre pessoa_id e casa_id; imutável após a criação
  casa_id: number | null;
  pessoa_id: number | null;
  categoria_id: number;
  descricao: string;
  tipo_valor: TipoValorDespesaFixa;
  valor_referencia: number;
  periodicidade: PeriodicidadeDespesaFixa;
  dia_esperado: number;
  vigente_desde: string;
  vigente_ate: string | null;
  cartao_conta_padrao_id: number | null; // meio de pagamento default (qualquer tipo)
  despesa_fixa_anterior_id?: number | null; // imutável; ignorado no PUT
};

export type DespesaFixa = DespesaFixaInput & {
  id: number;
  lancado_por_id: number | null;
  categoria_nome?: string; // presente apenas em GET (lista e por id)
  created_at: string;
};

export type DespesaFixaStatusItem = {
  despesa_fixa_id: number;
  descricao: string;
  casa_id: number | null;
  pessoa_id: number | null;
  categoria_id: number;
  categoria_nome: string;
  tipo_valor: TipoValorDespesaFixa;
  valor_referencia: number;
  periodicidade: PeriodicidadeDespesaFixa;
  competencia: string;
  data_esperada: string;
  status: StatusDespesaFixa;
};

export type DespesaFixaExcecaoInput = {
  competencia_referencia: string; // MMM-AA em pt-BR, ex. ABR-26
  valor_ocorrido?: number | null; // null = isenção/carência
  motivo?: string | null; // máx. 255 chars
};

export type DespesaFixaExcecao = DespesaFixaExcecaoInput & {
  id: number;
  despesa_fixa_id: number;
  valor_esperado_original: number | null; // snapshot do servidor
  lancado_por_id: number | null;
  created_at: string;
};

export type TipoConfiabilidadeReceitaFixa = 'fixa' | 'variavel';
export type StatusReceitaFixa = 'recebido' | 'aguardando' | 'atrasado' | 'justificado';

export type ReceitaFixaInput = {
  // exatamente um entre pessoa_id e casa_id; imutável após a criação
  casa_id: number | null;
  pessoa_id: number | null;
  origem_id: number;
  descricao: string;
  tipo_confiabilidade: TipoConfiabilidadeReceitaFixa;
  valor_esperado: number | null; // null = variável sem estimativa
  periodicidade: PeriodicidadeDespesaFixa;
  dia_esperado_recebimento: number;
  vigente_desde: string;
  vigente_ate: string | null;
  conta_destino_id: number | null; // conta destino default (debito/aplicacao)
  receita_fixa_anterior_id?: number | null; // imutável; ignorado no PUT
};

export type ReceitaFixa = ReceitaFixaInput & {
  id: number;
  lancado_por_id: number | null;
  origem_nome?: string; // presente apenas em GET (lista e por id)
  created_at: string;
};

export type ReceitaFixaStatusItem = {
  receita_fixa_id: number;
  descricao: string;
  casa_id: number | null;
  pessoa_id: number | null;
  origem_id: number;
  origem_nome: string;
  tipo_confiabilidade: TipoConfiabilidadeReceitaFixa;
  valor_esperado: number | null;
  periodicidade: PeriodicidadeDespesaFixa;
  competencia: string;
  data_esperada: string;
  status: StatusReceitaFixa;
};

export type ReceitaFixaExcecaoInput = {
  competencia_referencia: string; // MMM-AA em pt-BR, ex. ABR-26
  valor_ocorrido?: number | null; // null = isenção/carência
  motivo?: string | null; // máx. 255 chars
};

export type ReceitaFixaExcecao = ReceitaFixaExcecaoInput & {
  id: number;
  receita_fixa_id: number;
  valor_esperado_original: number | null; // snapshot do servidor
  lancado_por_id: number | null;
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

export type TipoEventoProjecao =
  | 'receita'
  | 'receita_esperada'
  | 'parcela_debito'
  | 'fatura'
  | 'despesa_esperada';

export type EventoProjecao = {
  data: string;
  tipo: TipoEventoProjecao;
  descricao: string;
  valor: number; // com sinal: entradas +, saídas −
  valor_indefinido?: boolean; // receita variável sem estimativa; soma como 0
};

export type ContaProjetada = {
  conta: {
    id: number;
    nome: string;
    tipo: 'debito' | 'aplicacao';
    titular_id: number;
    titular_nome: string;
  };
  saldo_base: number | null;
  saldo_base_data: string | null;
  sem_saldo_base: boolean;
  fluxo_liquido: number;
  saldo_projetado: number | null; // null quando sem_saldo_base
  eventos: EventoProjecao[]; // ordenados por data
};

export type TipoAvisoProjecao =
  | 'cartao_sem_conta_debito'
  | 'despesas_fixas_sem_meio_padrao'
  | 'receitas_fixas_sem_conta_destino';

export type AvisoProjecao = {
  tipo: TipoAvisoProjecao;
  mensagem: string;
  quantidade: number;
};

export type SaldoProjetado = {
  hoje: string;
  ate: string;
  contas: ContaProjetada[];
  avisos: AvisoProjecao[];
};

// ---- Acerto de contas (GET /casas/:casaId/acerto) ----

export type SaldoAcertoPessoa = {
  pessoa_id: number;
  nome: string;
  devido: number;
  desembolsado: number;
  pagamentos_enviados: number;
  pagamentos_recebidos: number;
  saldo: number; // positivo = a receber; a soma entre as pessoas fecha em zero
};

export type AcertoMesPessoa = {
  pessoa_id: number;
  nome: string;
  devido: number;
  desembolsado: number;
  acerto: number; // desembolsado - devido no mês
};

export type AcertoMes = {
  mes: string; // competência MMM-AA (no eixo caixa, o mês da data_caixa)
  por_pessoa: AcertoMesPessoa[];
};

export type PagamentoAcertoInput = {
  de_pessoa_id: number;
  para_pessoa_id: number;
  valor: number;
  data: string; // AAAA-MM-DD
  observacao?: string | null;
};

export type PagamentoAcerto = {
  id: number;
  de_pessoa_id: number;
  de_pessoa_nome: string;
  para_pessoa_id: number;
  para_pessoa_nome: string;
  valor: number;
  data: string;
  observacao: string | null;
  lancado_por_id: number | null;
};

export type TipoAvisoAcerto =
  | 'meses_sem_combinado'
  | 'compras_sem_meio'
  | 'rateio_nao_soma_100'
  | 'combinado_nao_soma_100';

export type AvisoAcerto = {
  tipo: TipoAvisoAcerto;
  mensagem: string;
  quantidade: number;
};

export type AcertoContas = {
  casa_id: number;
  acerto_eixo: EixoAcerto;
  saldos: SaldoAcertoPessoa[];
  meses: AcertoMes[]; // mais recente primeiro
  pagamentos: PagamentoAcerto[];
  avisos: AvisoAcerto[];
};

// ---- Relatório de gastos (GET /relatorios/gastos) ----

// A matriz mês × categoria × pessoa de UMA casa — o app deriva as visões
// (por categoria, por pessoa, drill-down, evolução) client-side.
// "Pessoa" é o responsável pelo gasto (compras.pessoa_id), não quem pagou.
export type LinhaRelatorioGastos = {
  mes: string; // competência MMM-AA (no eixo caixa, o mês da data_caixa)
  categoria_id: number;
  categoria_nome: string;
  categoria_icone: string; // MaterialCommunityIcons
  categoria_cor: string; // hex
  pessoa_id: number;
  pessoa_nome: string;
  total: number;
};

export type RelatorioGastos = {
  casa_id: number;
  de: string;
  ate: string;
  eixo: EixoAcerto; // mesmos valores do eixo do acerto: competencia | caixa
  linhas: LinhaRelatorioGastos[]; // ordenadas por mês → categoria → pessoa
};

export type PercentualCusteio = {
  id: number;
  casa_id: number;
  pessoa_id: number;
  competencia: string; // MMM-AA
  percentual: number; // NUMERIC do Postgres pode chegar como string — coagir
};
