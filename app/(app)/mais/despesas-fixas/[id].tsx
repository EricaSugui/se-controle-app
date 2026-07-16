import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import {
  deleteExcecaoDespesaFixa,
  encerrarDespesaFixa,
  getDespesaFixa,
  getExcecoesDespesaFixa,
  updateDespesaFixa,
} from '@/src/services/api/despesasFixas';
import { getCompras } from '@/src/services/api/compras';
import { getCategorias } from '@/src/services/api/categorias';
import { getCartoesContas } from '@/src/services/api/cartoesContas';
import { getDashboard } from '@/src/services/api/dashboard';
import { getMembros } from '@/src/services/api/casas';
import {
  DespesaFixaForm,
  despesaFixaParaFormValues,
  despesaFixaParaInput,
  type DespesaFixaFormValues,
} from '@/src/components/domain/DespesaFixaForm';
import { useAuth } from '@/src/context/AuthContext';
import { competenciaAtual } from '@/src/utils/competencia';
import { confirmar, notificar } from '@/src/utils/confirmar';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import type { CartaoConta, CasaDashboard, Categoria, Compra, DespesaFixa, DespesaFixaExcecao, MembroCasa } from '@/src/types';

export default function DespesaFixaDetalheScreen() {
  const params = useLocalSearchParams<{ id: string; descricao?: string }>();
  const id = Number(params.id);
  const navigation = useNavigation();
  const { user } = useAuth();

  const [despesa, setDespesa] = useState<DespesaFixa | null>(null);
  const [values, setValues] = useState<DespesaFixaFormValues | null>(null);
  const [historico, setHistorico] = useState<Compra[]>([]);
  const [excecoes, setExcecoes] = useState<DespesaFixaExcecao[]>([]);
  const [membros, setMembros] = useState<MembroCasa[]>([]);
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cartoesContas, setCartoesContas] = useState<CartaoConta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getDespesaFixa(id), getCompras(undefined, id), getExcecoesDespesaFixa(id)])
      .then(([d, compras, excs]) => {
        setDespesa(d);
        setValues(despesaFixaParaFormValues(d));
        setHistorico(compras);
        setExcecoes(excs);
        navigation.setOptions({ title: d.descricao || 'Despesa fixa' });
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useFocusEffect(carregar);

  useFocusEffect(
    useCallback(() => {
      getDashboard(competenciaAtual()).then((d) => setCasas(d.casas)).catch(() => {});
      getCategorias(true).then(setCategorias).catch(() => {});
      getCartoesContas(true).then(setCartoesContas).catch(() => {});
    }, [])
  );

  useEffect(() => {
    if (despesa?.casa_id == null) {
      setMembros([]);
      return;
    }
    getMembros(despesa.casa_id).then(setMembros).catch(() => setMembros([]));
  }, [despesa?.casa_id]);

  // Despesa pessoal só é visível ao dono (para os demais a API devolve 404),
  // então visível ⇒ editável. Despesa de casa exige papel admin.
  const podeEditar =
    despesa != null &&
    (despesa.pessoa_id != null ||
      membros.some((m) => m.pessoa_id === Number(user?.id) && m.papel === 'admin'));

  const encerrada = despesa?.vigente_ate != null;

  const diaEsperadoNum = Number(values?.diaEsperado);
  const podeSalvar =
    values != null &&
    values.categoriaId != null &&
    values.descricao.trim() !== '' &&
    values.valorReferencia != null &&
    Number.isInteger(diaEsperadoNum) &&
    diaEsperadoNum >= 1 &&
    diaEsperadoNum <= 31 &&
    values.vigenteDesde !== '' &&
    !salvando;

  async function salvar() {
    if (values == null || !podeSalvar || user == null) return;

    setSalvando(true);
    try {
      await updateDespesaFixa(id, despesaFixaParaInput(values, Number(user.id)));
      router.back();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  function confirmarEncerrar() {
    if (despesa == null) return;
    confirmar(
      {
        titulo: 'Encerrar despesa fixa',
        mensagem: `Encerrar "${despesa.descricao}" hoje? Ela deixa de gerar cobranças a partir de amanhã.`,
        textoConfirmar: 'Encerrar',
      },
      async () => {
        try {
          await encerrarDespesaFixa(id);
          carregar();
        } catch (e: unknown) {
          notificar('Erro', (e as Error).message);
        }
      }
    );
  }

  function reajustar() {
    router.push({ pathname: '/(app)/mais/despesas-fixas/reajuste', params: { id } });
  }

  function confirmarRemoverExcecao(excecao: DespesaFixaExcecao) {
    confirmar(
      {
        titulo: 'Remover exceção',
        mensagem: `Remover a exceção de ${excecao.competencia_referencia}? O atraso desta competência será reaberto.`,
        textoConfirmar: 'Remover',
      },
      async () => {
        try {
          await deleteExcecaoDespesaFixa(id, excecao.id);
          carregar();
        } catch (e: unknown) {
          notificar('Erro', (e as Error).message);
        }
      }
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || despesa == null || values == null) {
    return (
      <View style={styles.center}>
        <Text style={styles.erro}>{error ?? 'Despesa fixa não encontrada.'}</Text>
        <Pressable onPress={carregar} style={styles.retry}>
          <Text style={styles.retryTexto}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {podeEditar ? (
          <>
            <DespesaFixaForm
              values={values}
              onChange={setValues}
              casas={casas}
              cartoesContas={cartoesContas}
              categorias={categorias}
              escopoBloqueado
            />

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

            <View style={styles.acoes}>
              <Pressable onPress={reajustar}>
                <Text style={styles.reajustar}>Reajustar</Text>
              </Pressable>
              {!encerrada && (
                <Pressable onPress={confirmarEncerrar}>
                  <Text style={styles.encerrar}>Encerrar</Text>
                </Pressable>
              )}
            </View>
          </>
        ) : (
          <View style={styles.resumo}>
            <Text style={styles.resumoNome}>{despesa.descricao}</Text>
            <Text style={styles.resumoLinha}>
              {[despesa.categoria_nome, despesa.casa_id != null ? 'Casa' : 'Pessoal']
                .filter(Boolean)
                .join(' · ')}
            </Text>
            <Text style={styles.resumoLinha}>
              {despesa.tipo_valor === 'variavel_estimado' ? '~' : ''}
              {formatCurrency(despesa.valor_referencia)} ·{' '}
              {despesa.periodicidade === 'mensal' ? 'Mensal' : 'Anual'} · dia {despesa.dia_esperado}
            </Text>
            <Text style={styles.resumoLinha}>
              Vigente desde {formatDate(despesa.vigente_desde.slice(0, 10))}
              {despesa.vigente_ate ? ` até ${formatDate(despesa.vigente_ate.slice(0, 10))}` : ''}
            </Text>
            <Text style={styles.hint}>Apenas admins da casa podem editar esta despesa.</Text>
          </View>
        )}

        <Text style={styles.secaoTitulo}>Pagamentos</Text>
        {historico.length === 0 && (
          <Text style={styles.vazio}>Nenhum pagamento registrado.</Text>
        )}
        {historico.map((compra) => (
          <View key={compra.id} style={styles.pagamento}>
            <View style={styles.pagamentoInfo}>
              <Text style={styles.pagamentoValor}>
                {formatCurrency(compra.valor_parcela * compra.total_parcelas)}
              </Text>
              <Text style={styles.pagamentoDetalhe}>
                {[
                  compra.competencia_referencia ?? compra.competencia,
                  formatDate(compra.data.slice(0, 10)),
                  compra.pessoa_nome,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </View>
          </View>
        ))}

        <Text style={styles.secaoTitulo}>Exceções</Text>
        {excecoes.length === 0 && (
          <Text style={styles.vazio}>Nenhuma exceção registrada.</Text>
        )}
        {excecoes.map((excecao) => (
          <View key={excecao.id} style={styles.pagamento}>
            <View style={styles.pagamentoInfo}>
              <Text style={styles.pagamentoValor}>{excecao.competencia_referencia}</Text>
              <Text style={styles.pagamentoDetalhe}>
                {excecao.motivo?.trim() || 'Sem motivo informado'}
              </Text>
              <Text style={styles.pagamentoDetalhe}>
                {excecao.valor_ocorrido != null
                  ? `Valor ocorrido: ${formatCurrency(excecao.valor_ocorrido)}`
                  : 'Sem valor ocorrido'}
                {excecao.valor_esperado_original != null
                  ? ` · Esperado: ${formatCurrency(excecao.valor_esperado_original)}`
                  : ''}
              </Text>
            </View>
            {podeEditar && (
              <Pressable onPress={() => confirmarRemoverExcecao(excecao)}>
                <Text style={styles.encerrar}>Remover</Text>
              </Pressable>
            )}
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:         { padding: 24, gap: 12 },

  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },

  acoes:             { flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 8 },
  reajustar:         { color: '#1565c0', fontSize: 14, fontWeight: '600' },
  encerrar:          { color: '#c62828', fontSize: 14, fontWeight: '600' },

  resumo:            { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16, gap: 4 },
  resumoNome:        { fontSize: 16, fontWeight: '600' },
  resumoLinha:       { fontSize: 14, color: '#555' },
  hint:              { fontSize: 12, color: '#888', marginTop: 8 },

  secaoTitulo:       { fontSize: 16, fontWeight: 'bold', marginTop: 16 },
  vazio:             { color: '#888', textAlign: 'center', fontStyle: 'italic', paddingVertical: 8 },

  pagamento:         { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12 },
  pagamentoInfo:     { gap: 2 },
  pagamentoValor:    { fontSize: 15, fontWeight: '500' },
  pagamentoDetalhe:  { fontSize: 12, color: '#777' },

  erro:              { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:             { padding: 10 },
  retryTexto:        { color: '#1565c0' },
});
