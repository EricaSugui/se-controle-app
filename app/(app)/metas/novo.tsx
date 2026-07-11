import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { createMeta } from '@/src/services/api/metas';
import { getDashboard } from '@/src/services/api/dashboard';
import { MetaForm, type MetaFormValues } from '@/src/components/domain/MetaForm';
import { useAuth } from '@/src/context/AuthContext';
import { competenciaAtual } from '@/src/utils/competencia';
import { notificar } from '@/src/utils/confirmar';
import type { CasaDashboard } from '@/src/types';

export default function NovaMetaScreen() {
  const { user } = useAuth();
  const usuarioPessoaId = Number(user?.id);

  const [values, setValues] = useState<MetaFormValues>({
    pessoaId: usuarioPessoaId || null,
    casaId: null,
    objetivo: '',
    valorAtual: '',
    meta: '',
    falta: '',
  });
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [salvando, setSalvando] = useState(false);

  // A tela fica montada entre navegações — sem o reset, reabrir "+ Nova
  // meta" mostraria o que foi digitado na última vez.
  useFocusEffect(
    useCallback(() => {
      setValues({
        pessoaId: usuarioPessoaId || null,
        casaId: null,
        objetivo: '',
        valorAtual: '',
        meta: '',
        falta: '',
      });
    }, [usuarioPessoaId])
  );

  useFocusEffect(
    useCallback(() => {
      getDashboard(competenciaAtual()).then((d) => setCasas(d.casas)).catch(() => {});
    }, [])
  );

  const escopoValido = (values.pessoaId != null) !== (values.casaId != null);
  const podeSalvar = values.objetivo.trim() !== '' && escopoValido && !salvando;

  async function salvar() {
    if (!values.objetivo.trim() || !escopoValido) return;

    setSalvando(true);
    try {
      await createMeta({
        objetivo: values.objetivo.trim(),
        valor_atual: Number(values.valorAtual) || 0,
        meta: values.meta.trim() ? Number(values.meta) : null,
        falta: values.falta.trim() ? Number(values.falta) : null,
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

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <MetaForm
          values={values}
          onChange={setValues}
          casas={casas}
          usuarioPessoaId={usuarioPessoaId}
          mostrarEscopo
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
  container:         { padding: 24, gap: 12 },
  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },
});
