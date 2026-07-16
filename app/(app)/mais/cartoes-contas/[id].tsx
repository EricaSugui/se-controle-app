import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { getCartoesContas, updateCartaoConta } from '@/src/services/api/cartoesContas';
import { getPessoasRelacionadas } from '@/src/services/api/pessoas';
import {
  CartaoContaForm,
  cartaoContaParaInput,
  parSaldoCompleto,
  type CartaoContaFormValues,
} from '@/src/components/domain/CartaoContaForm';
import { notificar } from '@/src/utils/confirmar';
import type { CartaoConta, Pessoa, TipoCartaoConta } from '@/src/types';

function parseTipo(tipo: string | undefined): TipoCartaoConta {
  if (tipo === 'debito' || tipo === 'aplicacao') return tipo;
  return 'credito';
}

export default function EditarCartaoContaScreen() {
  const params = useLocalSearchParams<{
    id: string;
    nome: string;
    tipo: string;
    titularId?: string;
    limite?: string;
    diaFechamento?: string;
    diaVencimento?: string;
    contaDebitoId?: string;
    saldoBase?: string;
    saldoBaseData?: string;
  }>();
  const navigation = useNavigation();

  const id = Number(params.id);

  function valoresDosParams(): CartaoContaFormValues {
    return {
      nome: params.nome ?? '',
      tipo: parseTipo(params.tipo),
      titularId: params.titularId ? Number(params.titularId) : null,
      limite: params.limite ? Number(params.limite) : null,
      diaFechamento: params.diaFechamento ?? '',
      diaVencimento: params.diaVencimento ?? '',
      contaDebitoId: params.contaDebitoId ? Number(params.contaDebitoId) : null,
      saldoBase: params.saldoBase ? Number(params.saldoBase) : null,
      saldoBaseData: params.saldoBaseData ?? '',
    };
  }

  const [values, setValues] = useState<CartaoContaFormValues>(valoresDosParams);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [contas, setContas] = useState<CartaoConta[]>([]);
  const [salvando, setSalvando] = useState(false);

  // A tela é reaproveitada ao navegar de um cartão/conta para outro (mesma
  // rota [id]), então o estado precisa ser resincronizado quando o id muda.
  useEffect(() => {
    setValues(valoresDosParams());
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      getPessoasRelacionadas(true).then(setPessoas).catch(() => {});
      getCartoesContas(true).then(setContas).catch(() => {});
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (params.nome) navigation.setOptions({ title: params.nome });
    }, [params.nome, navigation])
  );

  const podeSalvar = values.nome.trim() !== '' && values.titularId != null && parSaldoCompleto(values);

  async function salvar() {
    if (!podeSalvar) return;

    setSalvando(true);
    try {
      await updateCartaoConta(id, cartaoContaParaInput(values));
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
        <CartaoContaForm
          values={values}
          onChange={setValues}
          pessoas={pessoas}
          // um cartão não pode debitar a fatura de si mesmo
          contas={contas.filter((c) => c.id !== id)}
        />

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
