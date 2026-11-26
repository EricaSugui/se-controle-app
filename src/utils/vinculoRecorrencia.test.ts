import { describe, expect, it } from '@jest/globals';
import {
  deDespesa,
  deReceita,
  ehSugestao,
  filtrarEOrdenar,
  noEscopo,
  rotuloSituacao,
  type OcorrenciaRecorrente,
} from './vinculoRecorrencia';

function ocorrencia(parcial: Partial<OcorrenciaRecorrente>): OcorrenciaRecorrente {
  return {
    id: 1,
    descricao: 'Conta',
    casaId: 10,
    pessoaId: null,
    categoriaOuOrigemId: 5,
    valorEsperado: 100,
    valorFixo: true,
    competencia: 'NOV-26',
    dataEsperada: '2026-11-10',
    situacao: 'em_aberto',
    ...parcial,
  };
}

describe('vinculoRecorrencia', () => {
  it('converte status de despesa e de receita para a mesma situação', () => {
    const d = deDespesa({
      despesa_fixa_id: 7, descricao: 'Internet', casa_id: 10, pessoa_id: null,
      categoria_id: 3, categoria_nome: 'Casa', tipo_valor: 'variavel_estimado',
      valor_referencia: 129.9, periodicidade: 'mensal', competencia: 'NOV-26',
      data_esperada: '2026-11-15', status: 'pago',
    });
    expect(d).toMatchObject({ id: 7, categoriaOuOrigemId: 3, valorFixo: false, situacao: 'realizada' });

    const r = deReceita({
      receita_fixa_id: 8, descricao: 'Salário', casa_id: null, pessoa_id: 2,
      origem_id: 4, origem_nome: 'Trabalho', tipo_confiabilidade: 'fixa',
      valor_esperado: 5000, periodicidade: 'mensal', competencia: 'NOV-26',
      data_esperada: '2026-11-05', status: 'aguardando',
    });
    expect(r).toMatchObject({ id: 8, categoriaOuOrigemId: 4, valorFixo: true, situacao: 'em_aberto' });
  });

  it('respeita o escopo: casa com casa, pessoal com pessoa', () => {
    const daCasa = ocorrencia({ casaId: 10 });
    expect(noEscopo(daCasa, 10, 2)).toBe(true);
    expect(noEscopo(daCasa, 11, 2)).toBe(false);
    expect(noEscopo(daCasa, null, 2)).toBe(false);

    const pessoal = ocorrencia({ casaId: null, pessoaId: 2 });
    expect(noEscopo(pessoal, 10, 2)).toBe(true);
    expect(noEscopo(pessoal, 10, 3)).toBe(false);
    expect(noEscopo(pessoal, 10, null)).toBe(false);
  });

  it('sugere por palavra da descrição, sem diferenciar acento e caixa', () => {
    const energia = ocorrencia({ descricao: 'Conta de Energia Elétrica' });
    expect(ehSugestao(energia, 'energia novembro')).toBe(true);
    expect(ehSugestao(energia, 'ELETRICA')).toBe(true);
    expect(ehSugestao(energia, 'academia')).toBe(false);
    expect(ehSugestao(energia, '')).toBe(false);
    // palavras curtas não contam (evita "de" casar com tudo)
    expect(ehSugestao(energia, 'de')).toBe(false);
  });

  it('ordena sugestão, depois o que falta, e mantém as já pagas na lista', () => {
    const lista = [
      ocorrencia({ id: 1, descricao: 'Internet', situacao: 'realizada', dataEsperada: '2026-11-01' }),
      ocorrencia({ id: 2, descricao: 'Aluguel', situacao: 'em_aberto', dataEsperada: '2026-11-20' }),
      ocorrencia({ id: 3, descricao: 'Condomínio', situacao: 'atrasada', dataEsperada: '2026-11-05' }),
      ocorrencia({ id: 4, descricao: 'Energia', situacao: 'realizada', dataEsperada: '2026-11-12' }),
    ];
    expect(filtrarEOrdenar(lista, '', '').map((o) => o.id)).toEqual([3, 2, 1, 4]);
    expect(filtrarEOrdenar(lista, '', 'energia').map((o) => o.id)).toEqual([4, 3, 2, 1]);
  });

  it('filtra pela busca sem acento', () => {
    const lista = [
      ocorrencia({ id: 1, descricao: 'Condomínio' }),
      ocorrencia({ id: 2, descricao: 'Aluguel' }),
    ];
    expect(filtrarEOrdenar(lista, 'condo', '').map((o) => o.id)).toEqual([1]);
    expect(filtrarEOrdenar(lista, 'CONDOMINIO', '').map((o) => o.id)).toEqual([1]);
  });

  it('usa o vocabulário de cada lado', () => {
    expect(rotuloSituacao('despesa', 'realizada')).toBe('Já paga');
    expect(rotuloSituacao('receita', 'realizada')).toBe('Já recebida');
    expect(rotuloSituacao('receita', 'em_aberto')).toBe('Aguardando');
  });
});
