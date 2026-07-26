// Paleta única do app. Extraída do uso real das telas — não é um redesign.
//
// Regra: cor que expressa INTENÇÃO (primária, negativo, texto suave) vem
// daqui. Cor que é DADO continua literal onde está — a paleta por tipo de
// cartão em CartaoContaSelector e os defaults de categoria que espelham
// colunas do backend não são tema, são domínio.
export const cores = {
  // Marca. Era #1565c0 nas telas e #6200ee nos componentes de formulário;
  // o azul ganhou por ser o que já estava em 131 dos 144 usos.
  primaria: '#1565c0',
  /** Fundo de item ativo/selecionado. */
  primariaSuave: '#e3f2fd',

  // Superfícies
  fundo: '#fff',
  /** Cards, chips neutros, grid do MonthPicker. */
  fundoSuave: '#f5f5f5',
  /** Sidebar e afins — um degrau abaixo de `fundo`. */
  fundoElevado: '#fafafa',
  /** Hover de item de navegação no desktop. */
  fundoHover: '#f0f0f0',
  /** Backdrop de modal. */
  overlay: 'rgba(0,0,0,0.4)',

  // Bordas
  /** Inputs e chips. */
  borda: '#ccc',
  /** Divisórias e linhas de grade. */
  bordaSuave: '#e0e0e0',

  // Texto — 3 níveis consolidam os 10 cinzas que existiam soltos.
  /** Valor digitado num input. */
  texto: '#000',
  textoForte: '#333',
  textoMedio: '#555',
  textoSuave: '#888',
  /** Sobre fundo colorido (ícone em círculo, label de botão primário). */
  textoInverso: '#fff',

  // Semânticas — par cor/fundo para badges e alertas.
  positivo: '#2e7d32',
  positivoSuave: '#e8f5e9',
  negativo: '#c62828',
  negativoSuave: '#fdecea',
  alerta: '#e65100',
  alertaSuave: '#fff8e1',
} as const;

// Raios recorrentes. Círculos (borderRadius = metade do lado) continuam
// literais — são geometria, não estilo.
export const raio = {
  /** Inputs, chips, botões, cards. */
  md: 8,
  /** Bottom sheets e modais. */
  lg: 16,
} as const;
