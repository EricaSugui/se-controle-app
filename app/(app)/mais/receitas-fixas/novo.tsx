import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { createReceitaFixa } from '@/src/services/api/receitasFixas';
import { getOrigensReceita } from '@/src/services/api/origensReceita';
import { getCartoesContas } from '@/src/services/api/cartoesContas';
import { getDashboard } from '@/src/services/api/dashboard';
import {
  ReceitaFixaForm,
  receitaFixaParaInput,
  type ReceitaFixaFormValues,
} from '@/src/components/domain/ReceitaFixaForm';
import { useAuth } from '@/src/context/AuthContext';
import { competenciaAtual } from '@/src/utils/competencia';
import { notificar } from '@/src/utils/confirmar';
import type { CartaoConta, CasaDashboard, OrigemReceita } from '@/src/types';

function hojeISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function valoresIniciais(): ReceitaFixaFormValues {
  return {
    escopo: 'pessoal',
    casaId: null,
    origemId: null,
    descricao: '',
    tipoConfiabilidade: 'fixa',
    valorEsperado: null,
    periodicidade: 'mensal',
    diaEsperado: '',
    vigenteDesde: hojeISO(),
    vigenteAte: '',
    contaDestinoId: null,
  };
}

export default function NovaReceitaFixaScreen() {
  const { user } = useAuth();
  const [values, setValues] = useState<ReceitaFixaFormValues>(valoresIniciais);
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [origens, setOrigens] = useState<OrigemReceita[]>([]);
  const [contas, setContas] = useState<CartaoConta[]>([]);
  const [salvando, setSalvando] = useState(false);

  // A tela fica montada entre navegações — sem o reset, reabrir "+ Nova
  // receita fixa" mostraria o que foi digitado na última vez.
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
    if (casas.length === 1 && values.escopo === 'casa' && values.casaId === null) {
      setValues((v) => ({ ...v, casaId: casas[0].id }));
    }
  }, [casas, values.escopo, values.casaId]);

  const diaEsperadoNum = Number(values.diaEsperado);
  const podeSalvar =
    (values.escopo === 'pessoal' || values.casaId != null) &&
    values.origemId != null &&
    values.descricao.trim() !== '' &&
    Number.isInteger(diaEsperadoNum) &&
    diaEsperadoNum >= 1 &&
    diaEsperadoNum <= 31 &&
    values.vigenteDesde !== '' &&
    !salvando;

  async function salvar() {
    if (!podeSalvar || user == null) return;

    setSalvando(true);
    try {
      await createReceitaFixa(receitaFixaParaInput(values, Number(user.id)));
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
        <ReceitaFixaForm values={values} onChange={setValues} casas={casas} origens={origens} contas={contas} />

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
