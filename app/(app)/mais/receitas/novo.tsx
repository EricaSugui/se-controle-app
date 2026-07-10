import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { createReceita } from '@/src/services/api/receitas';
import { getOrigensReceita } from '@/src/services/api/origensReceita';
import { getMembros } from '@/src/services/api/casas';
import { getDashboard } from '@/src/services/api/dashboard';
import { ReceitaForm, type ReceitaFormValues } from '@/src/components/domain/ReceitaForm';
import { notificar } from '@/src/utils/confirmar';
import type { CasaDashboard, MembroCasa, OrigemReceita } from '@/src/types';

function competenciaAtual(): string {
  const now = new Date();
  const mes = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const ano = String(now.getFullYear()).slice(-2);
  return `${mes}-${ano}`;
}

const VALORES_INICIAIS: ReceitaFormValues = {
  casaId: null,
  pessoaId: null,
  origemId: null,
  observacao: '',
  valorBruto: '',
  descontos: '',
  valorLiquido: '',
  data: '',
  competencia: competenciaAtual(),
};

export default function NovaReceitaScreen() {
  const [values, setValues] = useState<ReceitaFormValues>(VALORES_INICIAIS);
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [membros, setMembros] = useState<MembroCasa[]>([]);
  const [origens, setOrigens] = useState<OrigemReceita[]>([]);
  const [salvando, setSalvando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getDashboard(competenciaAtual()).then((d) => setCasas(d.casas)).catch(() => {});
      getOrigensReceita(true).then(setOrigens).catch(() => {});
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

  async function salvar() {
    if (values.casaId == null || !values.valorLiquido.trim()) return;

    setSalvando(true);
    try {
      await createReceita({
        casa_id: values.casaId,
        pessoa_id: values.pessoaId,
        origem_id: values.origemId,
        observacao: values.observacao.trim() || null,
        valor_bruto: values.valorBruto ? Number(values.valorBruto) : null,
        descontos: values.descontos ? Number(values.descontos) : null,
        valor_liquido: Number(values.valorLiquido),
        data: values.data.trim() || null,
        competencia: values.competencia || null,
      });
      router.back();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  const podeSalvar = values.casaId != null && values.valorLiquido.trim() !== '' && !salvando;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <ReceitaForm values={values} onChange={setValues} casas={casas} membros={membros} origens={origens} />

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
