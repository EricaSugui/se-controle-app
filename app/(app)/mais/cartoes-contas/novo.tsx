import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { createCartaoConta, getCartoesContas } from '@/src/services/api/cartoesContas';
import { getPessoasRelacionadas } from '@/src/services/api/pessoas';
import {
  CartaoContaForm,
  cartaoContaParaInput,
  parSaldoCompleto,
  type CartaoContaFormValues,
} from '@/src/components/domain/CartaoContaForm';
import { useAuth } from '@/src/context/AuthContext';
import { notificar } from '@/src/utils/confirmar';
import type { CartaoConta, Pessoa } from '@/src/types';

function valoresIniciais(titularId: number | null): CartaoContaFormValues {
  return {
    nome: '',
    tipo: 'credito',
    titularId,
    limite: null,
    diaFechamento: '',
    diaVencimento: '',
    contaDebitoId: null,
    saldoBase: null,
    saldoBaseData: '',
  };
}

export default function NovoCartaoContaScreen() {
  const { user } = useAuth();
  const titularDefault = user ? Number(user.id) : null;

  const [values, setValues] = useState<CartaoContaFormValues>(valoresIniciais(titularDefault));
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [contas, setContas] = useState<CartaoConta[]>([]);
  const [salvando, setSalvando] = useState(false);

  // A tela fica montada entre navegações — sem o reset, reabrir "+ Novo
  // cartão/conta" mostraria o que foi digitado na última vez.
  useFocusEffect(
    useCallback(() => {
      setValues(valoresIniciais(titularDefault));
    }, [titularDefault])
  );

  useFocusEffect(
    useCallback(() => {
      getPessoasRelacionadas(true).then(setPessoas).catch(() => {});
      getCartoesContas(true).then(setContas).catch(() => {});
    }, [])
  );

  const podeSalvar = values.nome.trim() !== '' && values.titularId != null && parSaldoCompleto(values);

  async function salvar() {
    if (!podeSalvar) return;

    setSalvando(true);
    try {
      await createCartaoConta(cartaoContaParaInput(values));
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
        <CartaoContaForm values={values} onChange={setValues} pessoas={pessoas} contas={contas} />

        <Pressable
          style={[styles.botao, (!podeSalvar || salvando) && styles.botaoDesabilitado]}
          onPress={salvar}
          disabled={!podeSalvar || salvando}
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
