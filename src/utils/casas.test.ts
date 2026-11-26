import { describe, expect, it } from '@jest/globals';
import { casaInicial, casasCompartilhadas, espacoPessoal, nomeCasa, ordenarCasas, soEspacoPessoal } from './casas';

const minhaCasa = { id: 1, nome: 'Minha Casa' };
const mamae = { id: 2, nome: 'Casa da mamãe' };
const pessoal = { id: 6, nome: 'Pessoal', pessoal: true };

describe('casas e espaço pessoal', () => {
  it('o espaço pessoal aparece como "Pessoal"; as casas, pelo nome', () => {
    expect(nomeCasa({ ...pessoal, nome: 'qualquer' })).toBe('Pessoal');
    expect(nomeCasa(minhaCasa)).toBe('Minha Casa');
  });

  it('"Pessoal" vem primeiro, as demais mantêm a ordem', () => {
    expect(ordenarCasas([minhaCasa, pessoal, mamae]).map((c) => c.id)).toEqual([6, 1, 2]);
    expect(ordenarCasas([minhaCasa, mamae]).map((c) => c.id)).toEqual([1, 2]);
  });

  it('separa o espaço pessoal das casas compartilhadas', () => {
    expect(casasCompartilhadas([pessoal, minhaCasa]).map((c) => c.id)).toEqual([1]);
    expect(espacoPessoal([minhaCasa, pessoal])?.id).toBe(6);
    expect(espacoPessoal([minhaCasa])).toBeUndefined();
  });
});

describe('soEspacoPessoal', () => {
  it('só quando a única opção é o espaço pessoal', () => {
    expect(soEspacoPessoal([pessoal])).toBe(true);
    expect(soEspacoPessoal([pessoal, minhaCasa])).toBe(false);
    expect(soEspacoPessoal([minhaCasa])).toBe(false);
    expect(soEspacoPessoal([])).toBe(false);
  });
});

describe('casaInicial', () => {
  it('a única opção, se houver uma só', () => {
    expect(casaInicial([pessoal], null)).toBe(6);
  });

  it('a casa principal, se estiver entre as opções', () => {
    expect(casaInicial([pessoal, minhaCasa, mamae], 2)).toBe(2);
    expect(casaInicial([pessoal, minhaCasa], 6)).toBe(6);
  });

  it('nenhuma, sem casa principal ou se ela não está entre as opções', () => {
    expect(casaInicial([pessoal, minhaCasa], null)).toBeNull();
    expect(casaInicial([pessoal, minhaCasa], 99)).toBeNull();
  });
});
