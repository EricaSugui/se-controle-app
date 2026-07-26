import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
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
import { cores, raio } from '@/src/theme/tokens';
import type { CartaoConta, CasaDashboard, Categoria, Compra, FormaPagamento, MembroCasa, Parcela } from '@/src/types';

type Props = {
  id: number;
  /** Chamado depois de salvar. Quem usa decide: voltar ou fechar o painel. */
  onSalvo: () => void;
  /** A compra carregada — a tela cheia usa para escrever o título do header. */
  onCarregado?: (compra: Compra) => void;
};

// Edição de compra usada em dois contextos: tela cheia (gastos/[id]) e
// painel lateral do master-detail (gastos/index no desktop). O que muda
// entre eles é só o que acontece ao salvar, daí `onSalvo` vir de fora.
export function CompraEditor({ id, onSalvo, onCarregado }: Props) {
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

  // Busca por id (o componente é reaproveitado entre compras — no painel
  // lateral trocar de linha só muda o id, sem remontar).
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
          cartaoContaId: compra.cartao_conta_id ?? null,
          formaPagamentoId: compra.forma_pagamento_id,
          data: compra.data ? compra.data.slice(0, 10) : '',
          competencia: compra.competencia || competenciaAtual(),
          totalParcelas: String(compra.total_parcelas ?? 1),
          valorParcela: compra.valor_parcela,
          acertoEixo: compra.acerto_eixo ?? null,
        });
        setParcelas(parcelasResp);
        setVinculo({
          despesa_fixa_id: compra.despesa_fixa_id ?? null,
          competencia_referencia: compra.competencia_referencia ?? null,
        });
        onCarregado?.(compra);
      })
      .catch((e: Error) => setError(e.message));
    // onCarregado fica de fora: quem passa costuma recriar a função a cada
    // render, e incluí-la refaria o fetch em loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // No painel lateral o id muda sem a tela reganhar foco, então o efeito de
  // foco sozinho não basta.
  useEffect(carregar, [carregar]);
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
        acerto_eixo: values.acertoEixo,
      });
      onSalvo();
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
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
            ? <ActivityIndicator color={cores.textoInverso} />
            : <Text style={styles.botaoTexto}>Salvar</Text>
          }
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:              { flex: 1 },
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:         { padding: 24, gap: 12 },

  secaoTitulo:       { fontSize: 14, fontWeight: '600', color: cores.textoMedio, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16 },
  parcelaItem:       { backgroundColor: cores.fundoSuave, borderRadius: raio.md, padding: 10 },
  parcelaTexto:      { fontSize: 13, color: cores.textoForte },
  parcelaFatura:     { fontSize: 12, color: cores.textoSuave, marginTop: 2 },

  aviso:             { fontSize: 12, color: cores.textoSuave, marginTop: 12, fontStyle: 'italic' },

  botao:             { backgroundColor: cores.primaria, borderRadius: raio.md, padding: 14, alignItems: 'center', marginTop: 4 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: cores.textoInverso, fontWeight: '600', fontSize: 15 },

  erro:              { color: cores.negativo, textAlign: 'center', padding: 16 },
  retry:             { padding: 10 },
  retryTexto:        { color: cores.primaria },
});
