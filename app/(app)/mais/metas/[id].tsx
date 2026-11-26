import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { getMeta, updateMeta } from '@/src/services/api/metas';
import { getDashboard } from '@/src/services/api/dashboard';
import { MetaForm, type MetaFormValues } from '@/src/components/domain/MetaForm';
import { useAuth } from '@/src/context/AuthContext';
import { competenciaAtual } from '@/src/utils/competencia';
import { notificar } from '@/src/utils/confirmar';
import type { CasaDashboard } from '@/src/types';

export default function EditarMetaScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const id = Number(params.id);

  const [values, setValues] = useState<MetaFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [salvando, setSalvando] = useState(false);

  // Busca por id (a tela é reaproveitada entre navegações — o fetch keyed no
  // id garante que sempre mostramos os dados da meta certa).
  const carregar = useCallback(() => {
    if (!id) return;
    setValues(null);
    setError(null);
    getMeta(id)
      .then((meta) => {
        setValues({
          pessoaId: meta.pessoa_id,
          casaId: meta.casa_id,
          objetivo: meta.objetivo,
          valorAtual: meta.valor_atual ?? 0,
          meta: meta.meta,
          falta: meta.falta,
        });
        navigation.setOptions({ title: meta.objetivo || 'Editar meta' });
      })
      .catch((e: Error) => setError(e.message));
  }, [id, navigation]);

  useFocusEffect(carregar);

  useFocusEffect(
    useCallback(() => {
      getDashboard(competenciaAtual()).then((d) => setCasas(d.casas)).catch(() => {});
    }, [])
  );

  const podeSalvar = values != null && values.objetivo.trim() !== '' && !salvando;

  async function salvar() {
    if (values == null || !values.objetivo.trim()) return;

    setSalvando(true);
    try {
      // pessoa_id/casa_id são imutáveis — reenviamos os valores originais
      await updateMeta(id, {
        objetivo: values.objetivo.trim(),
        valor_atual: values.valorAtual ?? 0,
        meta: values.meta,
        falta: values.falta,
        pessoa_id: values.pessoaId,
        casa_id: values.casaId,
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

  const nomeEscopo = values.pessoaId != null
    ? 'Meta pessoal'
    : `Meta da casa ${casas.find((c) => c.id === values.casaId)?.nome ?? `#${values.casaId}`}`;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.escopo}>{nomeEscopo}</Text>

        <MetaForm
          values={values}
          onChange={setValues}
          casas={casas}
          usuarioPessoaId={Number(user?.id)}
          mostrarEscopo={false}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:         { padding: 24, gap: 12 },

  escopo:            { fontSize: 13, color: '#777', fontStyle: 'italic' },

  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },

  erro:              { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:             { padding: 10 },
  retryTexto:        { color: '#1565c0' },
});
