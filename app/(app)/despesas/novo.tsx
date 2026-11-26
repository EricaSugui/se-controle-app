import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { createCompra } from '@/src/services/api/compras';
import { getCategorias } from '@/src/services/api/categorias';
import { getFormasPagamento } from '@/src/services/api/formasPagamento';
import { getCartoesContas } from '@/src/services/api/cartoesContas';
import { getMembros } from '@/src/services/api/casas';
import { getDashboard } from '@/src/services/api/dashboard';
import { CompraForm, type CompraFormValues } from '@/src/components/domain/CompraForm';
import { VinculoRecorrencia } from '@/src/components/domain/VinculoRecorrencia';
import { competenciaAtual } from '@/src/utils/competencia';
import { notificar } from '@/src/utils/confirmar';
import type { OcorrenciaRecorrente } from '@/src/utils/vinculoRecorrencia';
import type { CartaoConta, CasaDashboard, Categoria, FormaPagamento, MembroCasa } from '@/src/types';

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

export default function NovaCompraScreen() {
  const [values, setValues] = useState<CompraFormValues>(valoresIniciais);
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [membros, setMembros] = useState<MembroCasa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cartoes, setCartoes] = useState<CartaoConta[]>([]);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [vinculo, setVinculo] = useState<OcorrenciaRecorrente | null>(null);
  // Muda a cada foco para remontar o VinculoRecorrencia (switch desligado).
  const [chaveFormulario, setChaveFormulario] = useState(0);

  // A tela fica montada entre navegações — sem o reset, reabrir "+ Nova
  // compra" mostraria o que foi digitado na última vez.
  useFocusEffect(
    useCallback(() => {
      setValues(valoresIniciais());
      setVinculo(null);
      setChaveFormulario((k) => k + 1);
    }, [])
  );

  // Ao escolher a conta recorrente, completa o que estiver vazio e usa a
  // categoria da conta. O valor digitado nunca é sobrescrito.
  const aoVincular = useCallback((o: OcorrenciaRecorrente | null) => {
    setVinculo(o);
    if (!o) return;
    setValues((v) => ({
      ...v,
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
    if (casas.length === 1 && values.casaId === null) {
      setValues((v) => ({ ...v, casaId: casas[0].id }));
    }
  }, [casas, values.casaId]);

  useEffect(() => {
    if (values.casaId == null) {
      setMembros([]);
      return;
    }
    getMembros(values.casaId).then(setMembros).catch(() => setMembros([]));
  }, [values.casaId]);

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
      // Sempre termina na lista de Gastos, mesmo quando a tela foi aberta
      // pelo Dashboard (checklist de primeiros passos), onde router.back()
      // voltaria para o Dashboard. dismissTo volta até a lista se ela já
      // está na pilha, ou troca esta tela por ela, sem duplicar.
      router.dismissTo('/(app)/despesas');
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* A pergunta vem antes: escolher a conta já preenche categoria,
            descrição e valor do formulário abaixo. */}
        <VinculoRecorrencia
          key={chaveFormulario}
          tipo="despesa"
          casaId={values.casaId}
          pessoaId={values.pessoaId}
          descricao={values.descricao}
          valor={values.valorParcela}
          selecionada={vinculo}
          onChange={aoVincular}
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
