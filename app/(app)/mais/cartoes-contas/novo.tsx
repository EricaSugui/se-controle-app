import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { createCartaoConta } from '@/src/services/api/cartoesContas';
import { getPessoasRelacionadas } from '@/src/services/api/pessoas';
import { CartaoContaForm, type CartaoContaFormValues } from '@/src/components/domain/CartaoContaForm';
import { notificar } from '@/src/utils/confirmar';
import type { Pessoa } from '@/src/types';

const VALORES_INICIAIS: CartaoContaFormValues = {
  nome: '',
  tipo: 'credito',
  titularId: null,
  limite: '',
  diaFechamento: '',
  diaVencimento: '',
};

export default function NovoCartaoContaScreen() {
  const [values, setValues] = useState<CartaoContaFormValues>(VALORES_INICIAIS);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [salvando, setSalvando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getPessoasRelacionadas(true).then(setPessoas).catch(() => {});
    }, [])
  );

  async function salvar() {
    const nomeTrimmed = values.nome.trim();
    if (!nomeTrimmed) return;

    setSalvando(true);
    try {
      await createCartaoConta({
        nome: nomeTrimmed,
        tipo: values.tipo,
        titular_id: values.titularId,
        limite: values.limite ? Number(values.limite) : null,
        dia_fechamento: values.diaFechamento ? Number(values.diaFechamento) : null,
        dia_vencimento: values.diaVencimento ? Number(values.diaVencimento) : null,
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
        <CartaoContaForm values={values} onChange={setValues} pessoas={pessoas} />

        <Pressable
          style={[styles.botao, (!values.nome.trim() || salvando) && styles.botaoDesabilitado]}
          onPress={salvar}
          disabled={!values.nome.trim() || salvando}
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
