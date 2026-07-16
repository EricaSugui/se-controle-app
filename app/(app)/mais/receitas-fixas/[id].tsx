import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import {
  deleteExcecaoReceitaFixa,
  encerrarReceitaFixa,
  getExcecoesReceitaFixa,
  getReceitaFixa,
  updateReceitaFixa,
} from '@/src/services/api/receitasFixas';
import { getReceitas } from '@/src/services/api/receitas';
import { getOrigensReceita } from '@/src/services/api/origensReceita';
import { getCartoesContas } from '@/src/services/api/cartoesContas';
import { getDashboard } from '@/src/services/api/dashboard';
import { getMembros } from '@/src/services/api/casas';
import {
  ReceitaFixaForm,
  receitaFixaParaFormValues,
  receitaFixaParaInput,
  type ReceitaFixaFormValues,
} from '@/src/components/domain/ReceitaFixaForm';
import { useAuth } from '@/src/context/AuthContext';
import { competenciaAtual } from '@/src/utils/competencia';
import { confirmar, notificar } from '@/src/utils/confirmar';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import type {
  CartaoConta,
  CasaDashboard,
  MembroCasa,
  OrigemReceita,
  Receita,
  ReceitaFixa,
  ReceitaFixaExcecao,
} from '@/src/types';

export default function ReceitaFixaDetalheScreen() {
  const params = useLocalSearchParams<{ id: string; descricao?: string }>();
  const id = Number(params.id);
  const navigation = useNavigation();
  const { user } = useAuth();

  const [receitaFixa, setReceitaFixa] = useState<ReceitaFixa | null>(null);
  const [values, setValues] = useState<ReceitaFixaFormValues | null>(null);
  const [historico, setHistorico] = useState<Receita[]>([]);
  const [excecoes, setExcecoes] = useState<ReceitaFixaExcecao[]>([]);
  const [membros, setMembros] = useState<MembroCasa[]>([]);
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [origens, setOrigens] = useState<OrigemReceita[]>([]);
  const [contas, setContas] = useState<CartaoConta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([getReceitaFixa(id), getReceitas(undefined, id), getExcecoesReceitaFixa(id)])
      .then(([r, receitas, excs]) => {
        setReceitaFixa(r);
        setValues(receitaFixaParaFormValues(r));
        setHistorico(receitas);
        setExcecoes(excs);
        navigation.setOptions({ title: r.descricao || 'Receita fixa' });
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useFocusEffect(carregar);

  useFocusEffect(
    useCallback(() => {
      getDashboard(competenciaAtual()).then((d) => setCasas(d.casas)).catch(() => {});
      getOrigensReceita(true).then(setOrigens).catch(() => {});
      getCartoesContas(true).then(setContas).catch(() => {});
    }, [])
  );

  useEffect(() => {
    if (receitaFixa?.casa_id == null) {
      setMembros([]);
      return;
    }
    getMembros(receitaFixa.casa_id).then(setMembros).catch(() => setMembros([]));
  }, [receitaFixa?.casa_id]);

  // Receita fixa pessoal só é visível ao dono (para os demais a API devolve
  // 404), então visível ⇒ editável. Receita de casa exige papel admin.
  const podeEditar =
    receitaFixa != null &&
    (receitaFixa.pessoa_id != null ||
      membros.some((m) => m.pessoa_id === Number(user?.id) && m.papel === 'admin'));

  const encerrada = receitaFixa?.vigente_ate != null;

  const diaEsperadoNum = Number(values?.diaEsperado);
  const podeSalvar =
    values != null &&
    values.origemId != null &&
    values.descricao.trim() !== '' &&
    Number.isInteger(diaEsperadoNum) &&
    diaEsperadoNum >= 1 &&
    diaEsperadoNum <= 31 &&
    values.vigenteDesde !== '' &&
    !salvando;

  async function salvar() {
    if (values == null || !podeSalvar || user == null) return;

    setSalvando(true);
    try {
      await updateReceitaFixa(id, receitaFixaParaInput(values, Number(user.id)));
      router.back();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  function confirmarEncerrar() {
    if (receitaFixa == null) return;
    confirmar(
      {
        titulo: 'Encerrar receita fixa',
        mensagem: `Encerrar "${receitaFixa.descricao}" hoje? Ela deixa de gerar recebimentos esperados a partir de amanhã.`,
        textoConfirmar: 'Encerrar',
      },
      async () => {
        try {
          await encerrarReceitaFixa(id);
          carregar();
        } catch (e: unknown) {
          notificar('Erro', (e as Error).message);
        }
      }
    );
  }

  function reajustar() {
    router.push({ pathname: '/(app)/mais/receitas-fixas/reajuste', params: { id } });
  }

  function confirmarRemoverExcecao(excecao: ReceitaFixaExcecao) {
    confirmar(
      {
        titulo: 'Remover exceção',
        mensagem: `Remover a exceção de ${excecao.competencia_referencia}? O atraso desta competência será reaberto.`,
        textoConfirmar: 'Remover',
      },
      async () => {
        try {
          await deleteExcecaoReceitaFixa(id, excecao.id);
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

  if (error || receitaFixa == null || values == null) {
    return (
      <View style={styles.center}>
        <Text style={styles.erro}>{error ?? 'Receita fixa não encontrada.'}</Text>
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
            <ReceitaFixaForm
              values={values}
              onChange={setValues}
              casas={casas}
              origens={origens}
              contas={contas}
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
            <Text style={styles.resumoNome}>{receitaFixa.descricao}</Text>
            <Text style={styles.resumoLinha}>
              {[receitaFixa.origem_nome, receitaFixa.casa_id != null ? 'Casa' : 'Pessoal']
                .filter(Boolean)
                .join(' · ')}
            </Text>
            <Text style={styles.resumoLinha}>
              {receitaFixa.valor_esperado != null
                ? `${receitaFixa.tipo_confiabilidade === 'variavel' ? '~' : ''}${formatCurrency(receitaFixa.valor_esperado)}`
                : 'Valor variável'}{' '}
              · {receitaFixa.periodicidade === 'mensal' ? 'Mensal' : 'Anual'} · dia{' '}
              {receitaFixa.dia_esperado_recebimento}
            </Text>
            <Text style={styles.resumoLinha}>
              Vigente desde {formatDate(receitaFixa.vigente_desde.slice(0, 10))}
              {receitaFixa.vigente_ate ? ` até ${formatDate(receitaFixa.vigente_ate.slice(0, 10))}` : ''}
            </Text>
            <Text style={styles.hint}>Apenas admins da casa podem editar esta receita fixa.</Text>
          </View>
        )}

        <Text style={styles.secaoTitulo}>Recebimentos</Text>
        {historico.length === 0 && (
          <Text style={styles.vazio}>Nenhum recebimento registrado.</Text>
        )}
        {historico.map((receita) => (
          <View key={receita.id} style={styles.recebimento}>
            <View style={styles.recebimentoInfo}>
              <Text style={styles.recebimentoValor}>{formatCurrency(receita.valor_liquido)}</Text>
              <Text style={styles.recebimentoDetalhe}>
                {[
                  receita.competencia_referencia ?? receita.competencia,
                  receita.data ? formatDate(receita.data.slice(0, 10)) : null,
                  receita.pessoa_nome,
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
          <View key={excecao.id} style={styles.recebimento}>
            <View style={styles.recebimentoInfo}>
              <Text style={styles.recebimentoValor}>{excecao.competencia_referencia}</Text>
              <Text style={styles.recebimentoDetalhe}>
                {excecao.motivo?.trim() || 'Sem motivo informado'}
              </Text>
              <Text style={styles.recebimentoDetalhe}>
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
  center:             { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:          { padding: 24, gap: 12 },

  botao:              { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoDesabilitado:  { opacity: 0.5 },
  botaoTexto:         { color: '#fff', fontWeight: '600', fontSize: 15 },

  acoes:              { flexDirection: 'row', justifyContent: 'center', gap: 32, marginTop: 8 },
  reajustar:          { color: '#1565c0', fontSize: 14, fontWeight: '600' },
  encerrar:           { color: '#c62828', fontSize: 14, fontWeight: '600' },

  resumo:             { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16, gap: 4 },
  resumoNome:         { fontSize: 16, fontWeight: '600' },
  resumoLinha:        { fontSize: 14, color: '#555' },
  hint:               { fontSize: 12, color: '#888', marginTop: 8 },

  secaoTitulo:        { fontSize: 16, fontWeight: 'bold', marginTop: 16 },
  vazio:              { color: '#888', textAlign: 'center', fontStyle: 'italic', paddingVertical: 8 },

  recebimento:        { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12 },
  recebimentoInfo:    { gap: 2 },
  recebimentoValor:   { fontSize: 15, fontWeight: '500' },
  recebimentoDetalhe: { fontSize: 12, color: '#777' },

  erro:               { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:              { padding: 10 },
  retryTexto:         { color: '#1565c0' },
});
