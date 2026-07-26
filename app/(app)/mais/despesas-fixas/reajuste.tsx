import { useCallback, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { getDespesaFixa, reajustarDespesaFixa } from '@/src/services/api/despesasFixas';
import { CurrencyInput } from '@/src/components/ui/CurrencyInput';
import { DatePickerField } from '@/src/components/ui/DatePickerField';
import { notificar } from '@/src/utils/confirmar';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import type { DespesaFixa } from '@/src/types';

function hojeISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export default function ReajusteDespesaFixaScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const navigation = useNavigation();

  const [contrato, setContrato] = useState<DespesaFixa | null>(null);
  const [valor, setValor] = useState<number | null>(null);
  const [vigenteDesde, setVigenteDesde] = useState(hojeISO());
  const [diaEsperado, setDiaEsperado] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    getDespesaFixa(id)
      .then((d) => {
        setContrato(d);
        setDiaEsperado(String(d.dia_esperado));
        navigation.setOptions({ title: `Reajuste — ${d.descricao}` });
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useFocusEffect(carregar);

  const inicioAtual = contrato?.vigente_desde?.slice(0, 10) ?? '';
  const diaEsperadoNum = Number(diaEsperado);
  const inicioInvalido = vigenteDesde !== '' && inicioAtual !== '' && vigenteDesde <= inicioAtual;
  const podeSalvar =
    contrato != null &&
    valor != null &&
    vigenteDesde !== '' &&
    !inicioInvalido &&
    Number.isInteger(diaEsperadoNum) &&
    diaEsperadoNum >= 1 &&
    diaEsperadoNum <= 31 &&
    !salvando;

  async function salvar() {
    if (!podeSalvar || valor == null) return;

    setSalvando(true);
    try {
      await reajustarDespesaFixa(id, {
        valor_referencia: valor,
        vigente_desde: vigenteDesde,
        dia_esperado: diaEsperadoNum,
      });
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

  if (error || contrato == null) {
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
        <View style={styles.resumo}>
          <Text style={styles.resumoTitulo}>{contrato.descricao}</Text>
          <Text style={styles.resumoLinha}>
            Valor atual: {formatCurrency(contrato.valor_referencia)}
            {contrato.tipo_valor === 'variavel_estimado' ? ' (estimado)' : ''} · dia {contrato.dia_esperado}
          </Text>
          <Text style={styles.resumoLinha}>Vigente desde {formatDate(inicioAtual)}</Text>
        </View>

        <Text style={styles.hint}>
          O contrato atual será encerrado na véspera do novo início e a nova versão herda
          categoria, descrição, tipo e cartão/conta padrão — tudo numa operação só.
        </Text>

        <Text style={styles.label}>Novo valor</Text>
        <CurrencyInput value={valor} onChange={setValor} />

        <Text style={styles.label}>Novo valor vigente desde</Text>
        <DatePickerField valor={vigenteDesde} onSelecionar={setVigenteDesde} />
        {inicioInvalido && (
          <Text style={styles.alerta}>
            O início da nova versão deve ser posterior a {formatDate(inicioAtual)}.
          </Text>
        )}

        <Text style={styles.label}>Dia esperado do pagamento</Text>
        <TextInput
          style={styles.input}
          value={diaEsperado}
          onChangeText={setDiaEsperado}
          keyboardType="number-pad"
          placeholder="1 a 31"
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
  container:         { padding: 24, gap: 8 },

  resumo:            { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, gap: 4 },
  resumoTitulo:      { fontSize: 15, fontWeight: '600' },
  resumoLinha:       { fontSize: 13, color: '#666' },

  hint:              { fontSize: 12, color: '#999' },
  label:             { fontSize: 14, color: '#555', marginTop: 10 },
  input:             { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  alerta:            { fontSize: 13, color: '#c62828', marginTop: 4 },

  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },

  erro:              { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:             { padding: 10 },
  retryTexto:        { color: '#1565c0' },
});
