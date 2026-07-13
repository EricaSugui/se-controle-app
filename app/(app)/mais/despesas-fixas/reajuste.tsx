import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { createDespesaFixa, encerrarDespesaFixa, getDespesaFixa } from '@/src/services/api/despesasFixas';
import { getCategorias } from '@/src/services/api/categorias';
import { getDashboard } from '@/src/services/api/dashboard';
import {
  DespesaFixaForm,
  despesaFixaParaFormValues,
  despesaFixaParaInput,
  type DespesaFixaFormValues,
} from '@/src/components/domain/DespesaFixaForm';
import { useAuth } from '@/src/context/AuthContext';
import { competenciaAtual } from '@/src/utils/competencia';
import { notificar } from '@/src/utils/confirmar';
import type { CasaDashboard, Categoria } from '@/src/types';

function hojeISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function diaAnterior(dataISO: string): string {
  const [ano, mes, dia] = dataISO.split('-').map(Number);
  const d = new Date(ano, mes - 1, dia - 1);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${dd}`;
}

export default function ReajusteDespesaFixaScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const navigation = useNavigation();
  const { user } = useAuth();

  const [values, setValues] = useState<DespesaFixaFormValues | null>(null);
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    getDespesaFixa(id)
      .then((d) => {
        setValues({
          ...despesaFixaParaFormValues(d),
          vigenteDesde: hojeISO(),
          vigenteAte: '',
        });
        navigation.setOptions({ title: `Reajuste — ${d.descricao}` });
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
    }, [])
  );

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
      // Reajuste = encerrar o contrato atual na véspera do novo início e criar
      // a nova versão apontando o anterior. "Já encerrada" é tolerado para que
      // um retry após falha na 2ª chamada funcione.
      try {
        await encerrarDespesaFixa(id, diaAnterior(values.vigenteDesde));
      } catch (e: unknown) {
        if (!(e as Error).message.includes('já encerrada')) throw e;
      }

      try {
        await createDespesaFixa(despesaFixaParaInput(values, Number(user.id), id));
      } catch (e: unknown) {
        notificar(
          'Erro',
          `O contrato anterior foi encerrado, mas a nova versão não foi criada: ${(e as Error).message} Ajuste os dados e salve novamente.`
        );
        return;
      }

      notificar('Reajuste registrado');
      router.back();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || values == null) {
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
        <Text style={styles.hint}>
          O contrato atual será encerrado na véspera do novo "vigente desde" e uma nova versão será
          criada com os dados abaixo.
        </Text>

        <DespesaFixaForm
          values={values}
          onChange={setValues}
          casas={casas}
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
            : <Text style={styles.botaoTexto}>Confirmar reajuste</Text>
          }
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:         { padding: 24, gap: 12 },
  hint:              { fontSize: 13, color: '#777', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12 },

  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },

  erro:              { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:             { padding: 10 },
  retryTexto:        { color: '#1565c0' },
});
