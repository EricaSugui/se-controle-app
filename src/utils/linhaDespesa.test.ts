import { describe, expect, it } from '@jest/globals';
import { deCompra, deParcela, rotuloParcelas } from './linhaDespesa';
import type { Compra, ParcelaCaixa } from '@/src/types';

const compra = {
  id: 9, casa_id: 1, pessoa_id: 2, categoria_id: 3, descricao: 'Geladeira',
  cartao_conta_id: 4, forma_pagamento_id: null, data: '2026-10-15', competencia: 'OUT-26',
  total_parcelas: 3, valor_parcela: 400, despesa_fixa_id: null, competencia_referencia: null,
  lancado_por_id: 2, pessoa_nome: 'Erica', categoria_nome: 'Eletro', cartao_conta_nome: 'Nubank',
  pode_editar: true, created_at: '2026-10-15T10:00:00Z',
} as Compra;

const parcela: ParcelaCaixa = {
  parcela_id: 31, compra_id: 9, numero_parcela: 2, total_parcelas: 3, valor: 400,
  data_caixa: '2026-11-10', fatura_id: 5, casa_id: 1, pessoa_id: 2, categoria_id: 3,
  descricao: 'Geladeira', cartao_conta_id: 4, data: '2026-10-15', competencia: 'OUT-26',
  despesa_fixa_id: null, competencia_referencia: null, pessoa_nome: 'Erica',
  categoria_nome: 'Eletro', cartao_conta_nome: 'Nubank', pode_editar: true,
};

describe('linhaDespesa', () => {
  it('na competência, uma linha por compra com o valor total', () => {
    const l = deCompra(compra);
    expect(l).toMatchObject({ id: 9, compraId: 9, valor: 1200, numeroParcela: null, dataCaixa: null });
    expect(rotuloParcelas(l)).toBe('3x');
  });

  it('no caixa, uma linha por parcela com o valor da parcela e a data da compra', () => {
    const l = deParcela(parcela);
    expect(l).toMatchObject({ id: 31, compraId: 9, valor: 400, data: '2026-10-15', dataCaixa: '2026-11-10' });
    expect(rotuloParcelas(l)).toBe('2/3');
  });

  it('valor que chega como texto do banco vira número', () => {
    expect(deParcela({ ...parcela, valor: '129.90' as unknown as number }).valor).toBeCloseTo(129.9);
  });

  it('compra à vista não tem rótulo de parcelas', () => {
    expect(rotuloParcelas(deCompra({ ...compra, total_parcelas: 1 }))).toBeUndefined();
    expect(rotuloParcelas(deParcela({ ...parcela, total_parcelas: 1, numero_parcela: 1 }))).toBeUndefined();
  });
});
