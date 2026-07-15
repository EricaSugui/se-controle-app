import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import { router, useNavigation, useLocalSearchParams } from 'expo-router';
import { createExcecaoDespesaFixa } from '@/src/services/api/despesasFixas';
import { CurrencyInput } from '@/src/components/ui/CurrencyInput';
import { notificar } from '@/src/utils/confirmar';
import { formatCurrency } from '@/src/utils/formatters';

export default function JustificarDespesaFixaScreen() {
  const params = useLocalSearchParams<{
    despesaFixaId: string;
    competenciaReferencia: string;
    descricao: string;
    valorReferencia: string;
  }>();
  const navigation = useNavigation();

  const [motivo, setMotivo] = useState('');
  const [valorOcorrido, setValorOcorrido] = useState<number | null>(null);
  const [salvando, setSalvando] = useState(false);

  // A tela fica montada entre navegações — reseta ao trocar de competência.
  useEffect(() => {
    setMotivo('');
    setValorOcorrido(null);
    navigation.setOptions({
      title: params.descricao ? `Justificar — ${params.descricao}` : 'Justificar competência',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.despesaFixaId, params.competenciaReferencia]);

  const podeSalvar = motivo.trim() !== '' && !salvando;

  async function salvar() {
    if (!podeSalvar) return;

    setSalvando(true);
    try {
      await createExcecaoDespesaFixa(Number(params.despesaFixaId), {
        competencia_referencia: params.competenciaReferencia,
        valor_ocorrido: valorOcorrido,
        motivo: motivo.trim(),
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
        <Text style={styles.info}>
          {params.descricao}
          {'\n'}Competência {params.competenciaReferencia}
          {'\n'}Valor de referência: {formatCurrency(Number(params.valorReferencia))}
        </Text>

        <Text style={styles.label}>Motivo</Text>
        <TextInput
          style={styles.motivo}
          value={motivo}
          onChangeText={setMotivo}
          placeholder="Ex.: carência negociada com o locador"
          multiline
          numberOfLines={3}
          maxLength={255}
        />

        <Text style={styles.label}>Valor ocorrido (opcional)</Text>
        <CurrencyInput value={valorOcorrido} onChange={setValorOcorrido} />
        <Text style={styles.hint}>Deixe em branco se a competência foi isenta ou não vai ocorrer.</Text>

        <Pressable
          style={[styles.botao, !podeSalvar && styles.botaoDesabilitado]}
          onPress={salvar}
          disabled={!podeSalvar}
        >
          {salvando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.botaoTexto}>Registrar exceção</Text>
          }
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:         { padding: 24, gap: 6 },

  info:              { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16, fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 8 },

  label:             { fontSize: 14, color: '#555', marginTop: 10 },
  motivo:            { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, textAlignVertical: 'top', minHeight: 72 },
  hint:              { fontSize: 13, color: '#777', marginTop: 4 },

  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },
});
