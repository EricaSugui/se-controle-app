import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { createCompra } from '@/src/services/api/compras';
import { getCategorias } from '@/src/services/api/categorias';
import { getFormasPagamento } from '@/src/services/api/formasPagamento';
import { getCartoesContas } from '@/src/services/api/cartoesContas';
import { getMembros } from '@/src/services/api/casas';
import { getDashboard } from '@/src/services/api/dashboard';
import { CompraForm, type CompraFormValues } from '@/src/components/domain/CompraForm';
import { VinculoRecorrencia } from '@/src/components/domain/VinculoRecorrencia';
import { useAuth } from '@/src/context/AuthContext';
import { casaInicial } from '@/src/utils/casas';
import { competenciaAtual } from '@/src/utils/competencia';
import { notificar } from '@/src/utils/confirmar';
import { ajusteDeEscopo, type OcorrenciaRecorrente } from '@/src/utils/vinculoRecorrencia';
import type { CartaoConta, CasaDashboard, Categoria, FormaPagamento, MembroCasa } from '@/src/types';

// Formulário único de despesa. Usado por:
// - Despesas → "+ Nova despesa" (app/(app)/despesas/novo.tsx);
// - Despesas fixas → "Registrar pagamento"
//   (app/(app)/mais/despesas-fixas/pagamento.tsx), já com a conta escolhida.
// Proposta: docs/propostas/proposta-ux-vinculo-despesas-contas-recorrentes.md
// (workspace), seção 7: um único fluxo, com diferentes portas de entrada.

function hojeISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function valoresIniciais(): CompraFormValues {
  return {
    casaId: null,
    pessoaId: null,
    categoriaId: null,
    descricao: '',
    cartaoContaId: null,
    formaPagamentoId: null,
    data: hojeISO(),
    competencia: competenciaAtual(),
    totalParcelas: '1',
    valorParcela: null,
    acertoEixo: null,
  };
}

type Props = {
  // Conta recorrente já escolhida ao abrir (porta de entrada das fixas).
  preVinculo?: { id: number; competencia: string } | null;
  aoSalvar: () => void;
};

export function NovaDespesa({ preVinculo = null, aoSalvar }: Props) {
  const { user } = useAuth();
  const [values, setValues] = useState<CompraFormValues>(valoresIniciais);
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [membros, setMembros] = useState<MembroCasa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cartoes, setCartoes] = useState<CartaoConta[]>([]);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [vinculo, setVinculo] = useState<OcorrenciaRecorrente | null>(null);
  // Muda a cada foco para remontar o VinculoRecorrencia (estado inicial).
  const [chaveFormulario, setChaveFormulario] = useState(0);

  // A tela fica montada entre navegações — sem o reset, reabrir o formulário
  // mostraria o que foi digitado na última vez.
  useFocusEffect(
    useCallback(() => {
      setValues(valoresIniciais());
      setVinculo(null);
      setChaveFormulario((k) => k + 1);
    }, [])
  );

  // Ao escolher a conta recorrente: casa e pessoa se ajustam ao contrato
  // (da casa: fixa a casa; pessoal: fixa a pessoa dona), a categoria passa a
  // ser a da conta e descrição e valor são completados se estiverem vazios.
  const aoVincular = useCallback((o: OcorrenciaRecorrente | null) => {
    setVinculo(o);
    if (!o) return;
    setValues((v) => ({
      ...v,
      ...ajusteDeEscopo(o, v),
      categoriaId: o.categoriaOuOrigemId,
      descricao: v.descricao.trim() ? v.descricao : o.descricao,
      valorParcela: v.valorParcela ?? o.valorEsperado,
    }));
  }, []);

  useFocusEffect(
    useCallback(() => {
      getDashboard(competenciaAtual()).then((d) => setCasas(d.casas)).catch(() => {});
      getCategorias(true).then(setCategorias).catch(() => {});
      getCartoesContas(true).then(setCartoes).catch(() => {});
      getFormasPagamento(true).then(setFormas).catch(() => {});
    }, [])
  );

  useEffect(() => {
    // já vem escolhida a única opção ou a casa principal do Perfil
    if (values.casaId !== null) return;
    const inicial = casaInicial(casas, user?.casa_principal_id);
    if (inicial !== null) setValues((v) => ({ ...v, casaId: inicial }));
  }, [casas, values.casaId, user?.casa_principal_id]);

  useEffect(() => {
    if (values.casaId == null) {
      setMembros([]);
      return;
    }
    getMembros(values.casaId).then(setMembros).catch(() => setMembros([]));
  }, [values.casaId]);

  // Conta da casa sem pessoa escolhida: pré-seleciona quem está usando, se
  // for membro da casa (como fazia a antiga tela de registrar pagamento).
  useEffect(() => {
    if (!vinculo || vinculo.casaId === null || values.pessoaId !== null || membros.length === 0) return;
    const eu = membros.find((m) => m.pessoa_id === Number(user?.id));
    if (eu) setValues((v) => ({ ...v, pessoaId: eu.pessoa_id }));
  }, [vinculo, values.pessoaId, membros, user?.id]);

  // Conta pessoal: a pessoa é sempre a dona do contrato (o formulário zera a
  // pessoa ao trocar de casa; aqui ela volta).
  useEffect(() => {
    if (vinculo && vinculo.casaId === null && vinculo.pessoaId !== null && values.pessoaId !== vinculo.pessoaId) {
      setValues((v) => ({ ...v, pessoaId: vinculo.pessoaId }));
    }
  }, [vinculo, values.pessoaId]);

  const podeSalvar =
    values.casaId != null &&
    values.pessoaId != null &&
    values.categoriaId != null &&
    values.data !== '' &&
    values.valorParcela != null &&
    !salvando;

  async function salvar() {
    if (values.casaId == null || values.pessoaId == null || values.categoriaId == null) return;
    if (!values.data || values.valorParcela == null) return;

    setSalvando(true);
    try {
      await createCompra({
        casa_id: values.casaId,
        pessoa_id: values.pessoaId,
        categoria_id: values.categoriaId,
        descricao: values.descricao.trim() || null,
        // Vinculado e sem cartão escolhido: omite a chave para o backend
        // herdar o cartão/conta padrão da conta recorrente.
        ...(vinculo && values.cartaoContaId === null ? {} : { cartao_conta_id: values.cartaoContaId }),
        forma_pagamento_id: values.formaPagamentoId,
        data: values.data,
        competencia: values.competencia,
        total_parcelas: Number(values.totalParcelas) || 1,
        valor_parcela: values.valorParcela,
        acerto_eixo: values.acertoEixo,
        ...(vinculo ? { despesa_fixa_id: vinculo.id, competencia_referencia: vinculo.competencia } : {}),
      });
      aoSalvar();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* A pergunta vem antes: escolher a conta já preenche casa, pessoa,
            categoria, descrição e valor do formulário abaixo. */}
        <VinculoRecorrencia
          key={chaveFormulario}
          tipo="despesa"
          casaId={values.casaId}
          pessoaId={values.pessoaId}
          descricao={values.descricao}
          valor={values.valorParcela}
          selecionada={vinculo}
          onChange={aoVincular}
          preSelecao={preVinculo}
          casas={casas}
        />

        <CompraForm
          values={values}
          onChange={setValues}
          casas={casas}
          membros={membros}
          categorias={categorias}
          cartoes={cartoes}
          formas={formas}
        />
        {vinculo && values.cartaoContaId === null && (
          <Text style={styles.hint}>Sem cartão/conta escolhido, vale o padrão da conta recorrente.</Text>
        )}

        <Pressable
          style={[styles.botao, !podeSalvar && styles.botaoDesabilitado]}
          onPress={salvar}
          disabled={!podeSalvar}
        >
          {salvando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.botaoTexto}>Salvar</Text>
          }
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:         { padding: 24, gap: 12 },
  hint:              { fontSize: 13, color: '#777' },
  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },
});
