import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { createReceita } from '@/src/services/api/receitas';
import { getOrigensReceita } from '@/src/services/api/origensReceita';
import { getCartoesContas } from '@/src/services/api/cartoesContas';
import { getMembros } from '@/src/services/api/casas';
import { getDashboard } from '@/src/services/api/dashboard';
import { ReceitaForm, type ReceitaFormValues } from '@/src/components/domain/ReceitaForm';
import { notificar } from '@/src/utils/confirmar';
import { competenciaAtual } from '@/src/utils/competencia';
import type { CartaoConta, CasaDashboard, MembroCasa, OrigemReceita } from '@/src/types';

function valoresIniciais(): ReceitaFormValues {
  return {
    casaId: null,
    pessoaId: null,
    origemId: null,
    observacao: '',
    valorBruto: null,
    descontos: null,
    valorLiquido: null,
    data: '',
    competencia: competenciaAtual(),
    contaDestino: null,
  };
}

export default function NovaReceitaScreen() {
  const [values, setValues] = useState<ReceitaFormValues>(valoresIniciais);
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [membros, setMembros] = useState<MembroCasa[]>([]);
  const [origens, setOrigens] = useState<OrigemReceita[]>([]);
  const [contas, setContas] = useState<CartaoConta[]>([]);
  const [salvando, setSalvando] = useState(false);

  // A tela fica montada entre navegações — sem o reset, reabrir "+ Nova
  // receita" mostraria o que foi digitado na última vez.
  useFocusEffect(
    useCallback(() => {
      setValues(valoresIniciais());
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      getDashboard(competenciaAtual()).then((d) => setCasas(d.casas)).catch(() => {});
      getOrigensReceita(true).then(setOrigens).catch(() => {});
      getCartoesContas(true).then(setContas).catch(() => {});
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
    if (values.casaId == null || values.valorLiquido == null) return;

    setSalvando(true);
    try {
      await createReceita({
        casa_id: values.casaId,
        pessoa_id: values.pessoaId,
        origem_id: values.origemId,
        observacao: values.observacao.trim() || null,
        valor_bruto: values.valorBruto,
        descontos: values.descontos,
        valor_liquido: values.valorLiquido,
        data: values.data.trim() || null,
        competencia: values.competencia || null,
        // receita avulsa não tem contrato para herdar — valor sempre explícito
        conta_destino_id: values.contaDestino === 'herdar' ? null : values.contaDestino,
      });
      router.back();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  const podeSalvar = values.casaId != null && values.valorLiquido != null && !salvando;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <ReceitaForm values={values} onChange={setValues} casas={casas} membros={membros} origens={origens} contas={contas} />

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
