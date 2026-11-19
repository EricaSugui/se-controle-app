// Ambiente em que o bundle foi gerado, lido de EXPO_PUBLIC_APP_ENV
// (gravado no build pelos scripts do package.json / variáveis da Vercel).
//
// Valores aceitos: 'desenvolvimento' | 'tcc' | 'homologacao' | 'producao'.
// 'homologacao' continua aceito enquanto o ambiente HML publicado não for
// renomeado para TCC (plano de ambientes, Fase 0).

export type Ambiente = 'desenvolvimento' | 'tcc' | 'homologacao' | 'producao';

const ROTULOS: Record<Exclude<Ambiente, 'producao'>, string> = {
  desenvolvimento: 'Ambiente de desenvolvimento',
  tcc: 'Ambiente TCC',
  homologacao: 'Ambiente de homologação',
};

/**
 * Texto do aviso de ambiente, ou `null` quando não deve haver aviso.
 *
 * Produção e valores ausentes/desconhecidos não exibem aviso — o padrão é
 * nunca poluir a interface de quem usa o produto.
 */
export function rotuloAmbiente(appEnv: string | undefined): string | null {
  if (appEnv === undefined) return null;
  return (ROTULOS as Record<string, string>)[appEnv] ?? null;
}
