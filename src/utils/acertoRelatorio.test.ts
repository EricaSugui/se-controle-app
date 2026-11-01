import { describe, expect, it } from '@jest/globals';
import { criarChaveIdempotencia } from './acertoRelatorio';

describe('acertoRelatorio', () => {
  it('cria uma chave não vazia com prefixo de acerto', () => {
    expect(criarChaveIdempotencia()).toMatch(/^acerto-[a-z0-9-]+$/);
  });

  it('cria chaves diferentes para confirmações distintas', () => {
    expect(criarChaveIdempotencia()).not.toBe(criarChaveIdempotencia());
  });
});
