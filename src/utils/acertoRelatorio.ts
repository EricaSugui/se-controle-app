export function criarChaveIdempotencia(): string {
  const agora = Date.now().toString(36);
  const aleatorio = Math.random().toString(36).slice(2);
  return `acerto-${agora}-${aleatorio}`;
}
