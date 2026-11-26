import { describe, expect, it } from '@jest/globals';
import { agruparPorDia, rotuloDia } from './agruparPorDia';

// Quinta-feira, 26/11/2026, ao meio-dia (horário local).
const HOJE = new Date(2026, 10, 26, 12, 0, 0);

describe('rotuloDia', () => {
  it('usa Hoje e Ontem para os dois dias mais recentes', () => {
    expect(rotuloDia('2026-11-26', { hoje: HOJE })).toBe('Hoje');
    expect(rotuloDia('2026-11-25', { hoje: HOJE })).toBe('Ontem');
  });

  it('usa dia da semana, dia e mês para os demais', () => {
    expect(rotuloDia('2026-11-24', { hoje: HOJE })).toBe('TER, 24 NOV');
    expect(rotuloDia('2026-11-01', { hoje: HOJE })).toBe('DOM, 1 NOV');
  });

  it('aceita data com horário (só os 10 primeiros caracteres contam)', () => {
    expect(rotuloDia('2026-11-26T03:00:00.000Z', { hoje: HOJE })).toBe('Hoje');
  });

  it('Ontem atravessa a virada do mês', () => {
    expect(rotuloDia('2026-10-31', { hoje: new Date(2026, 10, 1, 9) })).toBe('Ontem');
  });
});

describe('agruparPorDia', () => {
  type Item = { id: number; data: string | null; valor: number };
  const itens: Item[] = [
    { id: 1, data: '2026-11-24', valor: 50 },
    { id: 2, data: '2026-11-26', valor: 1200 },
    { id: 3, data: null, valor: 10 },
    { id: 4, data: '2026-11-26', valor: 129.9 },
    { id: 5, data: '2026-11-24', valor: 37.4 },
  ];

  const grupos = agruparPorDia(itens, (i) => i.data, (i) => i.valor, { hoje: HOJE });

  it('agrupa do dia mais recente para o mais antigo, com "Sem data" no fim', () => {
    expect(grupos.map((g) => g.titulo)).toEqual(['Hoje', 'TER, 24 NOV', 'Sem data']);
  });

  it('soma o total do dia', () => {
    expect(grupos[0].total).toBeCloseTo(1329.9);
    expect(grupos[1].total).toBeCloseTo(87.4);
  });

  it('dentro do dia, o lançado por último vem primeiro', () => {
    expect(grupos[0].data.map((i) => i.id)).toEqual([4, 2]);
    expect(grupos[1].data.map((i) => i.id)).toEqual([5, 1]);
  });

  it('lista vazia não gera grupos', () => {
    expect(agruparPorDia([] as Item[], (i) => i.data, (i) => i.valor, { hoje: HOJE })).toEqual([]);
  });
});

describe('rótulos fora do mês atual', () => {
  it('sem relativo, mostra o dia pelo nome mesmo sendo hoje ou ontem', () => {
    expect(rotuloDia('2026-11-26', { hoje: HOJE, relativo: false })).toBe('QUI, 26 NOV');
    expect(rotuloDia('2026-11-25', { hoje: HOJE, relativo: false })).toBe('QUA, 25 NOV');
  });

  it('agruparPorDia repassa a opção', () => {
    const grupos = agruparPorDia([{ id: 1, data: '2026-11-26' }], (i) => i.data, () => 1, { hoje: HOJE, relativo: false });
    expect(grupos[0].titulo).toBe('QUI, 26 NOV');
  });
});
