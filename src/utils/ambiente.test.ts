import { describe, expect, it } from '@jest/globals';
import { rotuloAmbiente } from './ambiente';

describe('rotuloAmbiente', () => {
  it('exibe aviso nos ambientes que não são produção', () => {
    expect(rotuloAmbiente('desenvolvimento')).toBe('Ambiente de desenvolvimento');
    expect(rotuloAmbiente('tcc')).toBe('Ambiente TCC');
    expect(rotuloAmbiente('homologacao')).toBe('Ambiente de homologação');
  });

  it('não exibe aviso em produção', () => {
    expect(rotuloAmbiente('producao')).toBeNull();
  });

  it('não exibe aviso quando a variável falta ou é desconhecida', () => {
    expect(rotuloAmbiente(undefined)).toBeNull();
    expect(rotuloAmbiente('')).toBeNull();
    expect(rotuloAmbiente('qualquer')).toBeNull();
  });
});
