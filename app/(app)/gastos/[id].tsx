import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { getCompra, getParcelasCompra, updateCompra } from '@/src/services/api/compras';
import { getCategorias } from '@/src/services/api/categorias';
import { getFormasPagamento } from '@/src/services/api/formasPagamento';
import { getCartoesContas } from '@/src/services/api/cartoesContas';
import { getMembros } from '@/src/services/api/casas';
import { getDashboard } from '@/src/services/api/dashboard';
import { CompraForm, type CompraFormValues } from '@/src/components/domain/CompraForm';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import { competenciaAtual } from '@/src/utils/competencia';
import { notificar } from '@/src/utils/confirmar';
import type { CartaoConta, CasaDashboard, Categoria, FormaPagamento, MembroCasa, Parcela } from '@/src/types';

export default function EditarCompraScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const id = Number(params.id);

  const [values, setValues] = useState<CompraFormValues | null>(null);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Vínculo com despesa fixa: o PUT remove o vínculo se os campos forem
  // omitidos, então precisam ser repassados no salvar.
  const [vinculo, setVinculo] = useState<{
    despesa_fixa_id: number | null;
    competencia_referencia: string | null;
  }>({ despesa_fixa_id: null, competencia_referencia: null });

  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [membros, setMembros] = useState<MembroCasa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cartoes, setCartoes] = useState<CartaoConta[]>([]);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [salvando, setSalvando] = useState(false);

  // Busca por id (a tela é reaproveitada entre navegações — o fetch keyed no
  // id garante que sempre mostramos os dados da compra certa).
  const carregar = useCallback(() => {
    if (!id) return;
    setValues(null);
    setError(null);
    Promise.all([getCompra(id), getParcelasCompra(id)])
      .then(([compra, parcelasResp]) => {
        setValues({
          casaId: compra.casa_id,
          pessoaId: compra.pessoa_id,
          categoriaId: compra.categoria_id,
          descricao: compra.descricao ?? '',
          cartaoContaId: compra.cartao_conta_id,
          formaPagamentoId: compra.forma_pagamento_id,
          data: compra.data ? compra.data.slice(0, 10) : '',
          competencia: compra.competencia || competenciaAtual(),
          totalParcelas: String(compra.total_parcelas ?? 1),
          valorParcela: compra.valor_parcela,
        });
        setParcelas(parcelasResp);
        setVinculo({
          despesa_fixa_id: compra.despesa_fixa_id ?? null,
          competencia_referencia: compra.competencia_referencia ?? null,
        });
        navigation.setOptions({ title: compra.descricao || 'Editar compra' });
      })
      .catch((e: Error) => setError(e.message));
  }, [id, navigation]);

  useFocusEffect(carregar);

  useFocusEffect(
    useCallback(() => {
      getDashboard(competenciaAtual()).then((d) => setCasas(d.casas)).catch(() => {});
      getCategorias(true).then(setCategorias).catch(() => {});
      getCartoesContas(true).then(setCartoes).catch(() => {});
      getFormasPagamento(true).then(setFormas).catch(() => {});
    }, [])
  );

  useEffect(() => {
    if (values?.casaId == null) {
      setMembros([]);
      return;
    }
    getMembros(values.casaId).then(setMembros).catch(() => setMembros([]));
  }, [values?.casaId]);

  const podeSalvar =
    values != null &&
    values.casaId != null &&
    values.pessoaId != null &&
    values.categoriaId != null &&
    values.data !== '' &&
    values.valorParcela != null &&
    !salvando;

  async function salvar() {
    if (values == null || values.casaId == null || values.pessoaId == null || values.categoriaId == null) return;
    if (!values.data || values.valorParcela == null) return;

    setSalvando(true);
    try {
      await updateCompra(id, {
        casa_id: values.casaId,
        pessoa_id: values.pessoaId,
        categoria_id: values.categoriaId,
        descricao: values.descricao.trim() || null,
        cartao_conta_id: values.cartaoContaId,
        forma_pagamento_id: values.formaPagamentoId,
        data: values.data,
        competencia: values.competencia,
        total_parcelas: Number(values.totalParcelas) || 1,
        valor_parcela: values.valorParcela,
        despesa_fixa_id: vinculo.despesa_fixa_id,
        competencia_referencia: vinculo.competencia_referencia,
      });
      router.back();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.erro}>{error}</Text>
        <Pressable onPress={carregar} style={styles.retry}>
          <Text style={styles.retryTexto}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  if (values == null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {vinculo.despesa_fixa_id != null && (
          <Text style={styles.aviso}>
            Pagamento vinculado a despesa fixa
            {vinculo.competencia_referencia ? ` (competência ${vinculo.competencia_referencia})` : ''}.
          </Text>
        )}

        <CompraForm
          values={values}
          onChange={setValues}
          casas={casas}
          membros={membros}
          categorias={categorias}
          cartoes={cartoes}
          formas={formas}
        />

        {parcelas.length > 0 && (
          <>
            <Text style={styles.secaoTitulo}>Parcelas</Text>
            {parcelas.map((p) => (
              <View key={p.id} style={styles.parcelaItem}>
                <Text style={styles.parcelaTexto}>
                  {`Parcela ${p.numero_parcela}/${parcelas.length} — ${formatCurrency(p.valor)} — ${formatDate(p.data_caixa)}`}
                </Text>
                {p.fatura_mes_referencia && (
                  <Text style={styles.parcelaFatura}>Fatura {p.fatura_mes_referencia}</Text>
                )}
              </View>
            ))}
          </>
        )}

        <Text style={styles.aviso}>Ao salvar, todas as parcelas desta compra são apagadas e recriadas.</Text>

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
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:         { padding: 24, gap: 12 },

  secaoTitulo:       { fontSize: 14, fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16 },
  parcelaItem:       { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10 },
  parcelaTexto:      { fontSize: 13, color: '#333' },
  parcelaFatura:     { fontSize: 12, color: '#777', marginTop: 2 },

  aviso:             { fontSize: 12, color: '#999', marginTop: 12, fontStyle: 'italic' },

  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 4 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },

  erro:              { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:             { padding: 10 },
  retryTexto:        { color: '#1565c0' },
});
