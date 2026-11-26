import { describe, expect, it } from '@jest/globals';
import {
  ajusteDeEscopo,
  visivelNoContexto,
  deDespesa,
  deReceita,
  ehSugestao,
  filtrarEOrdenar,
  motivoSugestao,
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

  it('mostra pessoais sempre e as da casa só da casa escolhida', () => {
    const daCasa = ocorrencia({ casaId: 10 });
    const pessoal = ocorrencia({ casaId: null, pessoaId: 2 });
    expect(visivelNoContexto(daCasa, 10)).toBe(true);
    expect(visivelNoContexto(daCasa, 11)).toBe(false);
    expect(visivelNoContexto(daCasa, null)).toBe(true);
    expect(visivelNoContexto(pessoal, 11)).toBe(true);
  });

  it('ajusta casa e pessoa ao contrato escolhido', () => {
    const daCasa = ocorrencia({ casaId: 10 });
    expect(ajusteDeEscopo(daCasa, { casaId: 10, pessoaId: 3 })).toEqual({ casaId: 10, pessoaId: 3 });
    expect(ajusteDeEscopo(daCasa, { casaId: 11, pessoaId: 3 })).toEqual({ casaId: 10, pessoaId: null });
    expect(ajusteDeEscopo(daCasa, { casaId: null, pessoaId: null })).toEqual({ casaId: 10, pessoaId: null });

    const pessoal = ocorrencia({ casaId: null, pessoaId: 2 });
    expect(ajusteDeEscopo(pessoal, { casaId: 11, pessoaId: 3 })).toEqual({ casaId: 11, pessoaId: 2 });
    expect(ajusteDeEscopo(pessoal, { casaId: null, pessoaId: null })).toEqual({ casaId: null, pessoaId: 2 });
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
    expect(filtrarEOrdenar(lista, '', { descricao: '' }).map((o) => o.id)).toEqual([3, 2, 1, 4]);
    expect(filtrarEOrdenar(lista, '', { descricao: 'energia' }).map((o) => o.id)).toEqual([4, 3, 2, 1]);
  });

  it('em receitas, sugere por origem e pessoa antes da descrição', () => {
    const salarioErica = ocorrencia({ id: 1, descricao: 'Salário Empresa X', categoriaOuOrigemId: 4, casaId: null, pessoaId: 2 });
    const salarioOutra = ocorrencia({ id: 2, descricao: 'Salário Empresa Y', categoriaOuOrigemId: 4, casaId: null, pessoaId: 3 });
    const aluguel = ocorrencia({ id: 3, descricao: 'Aluguel recebido', categoriaOuOrigemId: 7 });
    const freela = ocorrencia({ id: 4, descricao: 'Freela site', categoriaOuOrigemId: 9 });

    const ctx = { descricao: 'freela', origemId: 4, pessoaId: 2 };
    expect(motivoSugestao(salarioErica, ctx)).toBe('Mesma origem e pessoa');
    expect(motivoSugestao(salarioOutra, ctx)).toBe('Mesma origem');
    expect(motivoSugestao(freela, ctx)).toBe('Parece corresponder à descrição');
    expect(motivoSugestao(aluguel, ctx)).toBeNull();

    // origem + pessoa > origem > descrição > resto
    expect(filtrarEOrdenar([aluguel, freela, salarioOutra, salarioErica], '', ctx).map((o) => o.id))
      .toEqual([1, 2, 4, 3]);
  });

  it('sem origem escolhida, vale só a descrição (como em despesas)', () => {
    const salario = ocorrencia({ descricao: 'Salário', categoriaOuOrigemId: 4 });
    expect(motivoSugestao(salario, { descricao: '', origemId: null })).toBeNull();
    expect(motivoSugestao(salario, { descricao: 'salario de novembro' })).toBe('Parece corresponder à descrição');
  });

  it('filtra pela busca sem acento', () => {
    const lista = [
      ocorrencia({ id: 1, descricao: 'Condomínio' }),
      ocorrencia({ id: 2, descricao: 'Aluguel' }),
    ];
    expect(filtrarEOrdenar(lista, 'condo', { descricao: '' }).map((o) => o.id)).toEqual([1]);
    expect(filtrarEOrdenar(lista, 'CONDOMINIO', { descricao: '' }).map((o) => o.id)).toEqual([1]);
  });

  it('usa o vocabulário de cada lado', () => {
    expect(rotuloSituacao('despesa', 'realizada')).toBe('Já paga');
    expect(rotuloSituacao('receita', 'realizada')).toBe('Já recebida');
    expect(rotuloSituacao('receita', 'em_aberto')).toBe('Aguardando');
  });
});
