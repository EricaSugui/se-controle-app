import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { getMembros } from '@/src/services/api/casas';
import { getPercentuaisCusteio, setPercentualCusteio } from '@/src/services/api/percentuaisCusteio';
import { MonthPicker } from '@/src/components/ui/MonthPicker';
import { competenciaAtual } from '@/src/utils/competencia';
import { notificar } from '@/src/utils/confirmar';
import type { MembroCasa } from '@/src/types';

function parsePercentual(texto: string): number {
  const n = Number(texto.replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

export default function CombinadoScreen() {
  const { id, nome } = useLocalSearchParams<{ id: string; nome: string }>();
  const navigation = useNavigation();
  const casaId = Number(id);

  const [competencia, setCompetencia] = useState(competenciaAtual());
  const [pickerVisivel, setPickerVisivel] = useState(false);
  const [membros, setMembros] = useState<MembroCasa[]>([]);
  // pessoa_id → texto do input ('' = sem linha registrada)
  const [valores, setValores] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(() => {
    if (!casaId) return;
    setLoading(true);
    setError(null);
    Promise.all([getMembros(casaId), getPercentuaisCusteio(casaId, competencia)])
      .then(([membrosResp, percentuais]) => {
        setMembros(membrosResp);
        const iniciais: Record<number, string> = {};
        for (const m of membrosResp) {
          const linha = percentuais.find((p) => p.pessoa_id === m.pessoa_id);
          iniciais[m.pessoa_id] = linha != null ? String(Number(linha.percentual)) : '';
        }
        setValores(iniciais);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [casaId, competencia]);

  useFocusEffect(carregar);

  useFocusEffect(
    useCallback(() => {
      if (nome) navigation.setOptions({ title: `Combinado — ${nome}` });
    }, [nome, navigation])
  );

  const total = membros.reduce((soma, m) => soma + parsePercentual(valores[m.pessoa_id] ?? ''), 0);
  const soma100 = Math.abs(total - 100) < 0.01;
  const algumPreenchido = membros.some((m) => (valores[m.pessoa_id] ?? '').trim() !== '');

  async function salvar() {
    setSalvando(true);
    try {
      // input vazio vira 0 — sem linha o mês fica fora do acerto por inteiro
      for (const m of membros) {
        await setPercentualCusteio(casaId, {
          pessoa_id: m.pessoa_id,
          competencia,
          percentual: parsePercentual(valores[m.pessoa_id] ?? ''),
        });
      }
      notificar('Combinado salvo', `Percentuais de ${competencia} registrados.`);
      carregar();
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

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.erro}>{error}</Text>
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
          Quanto cada pessoa banca dos gastos da casa no mês. O acerto de contas usa esses
          percentuais para calcular o devido de cada uma — sem o combinado do mês, as compras
          daquele mês ficam fora do acerto.
        </Text>

        <Text style={styles.label}>Competência</Text>
        <Pressable style={styles.input} onPress={() => setPickerVisivel(true)}>
          <Text style={styles.inputTexto}>{competencia}</Text>
        </Pressable>

        <Text style={styles.label}>Percentual por pessoa</Text>
        {membros.map((m) => (
          <View key={m.pessoa_id} style={styles.linha}>
            <Text style={styles.linhaNome}>{m.nome}</Text>
            <View style={styles.percentualBox}>
              <TextInput
                style={styles.percentualInput}
                value={valores[m.pessoa_id] ?? ''}
                onChangeText={(v) => setValores((atual) => ({ ...atual, [m.pessoa_id]: v }))}
                keyboardType="decimal-pad"
                placeholder="0"
              />
              <Text style={styles.percentualSufixo}>%</Text>
            </View>
          </View>
        ))}

        <Text style={[styles.total, !soma100 && algumPreenchido && styles.totalErrado]}>
          Total: {total.toLocaleString('pt-BR')}%
          {!soma100 && algumPreenchido ? ' — deveria somar 100%' : ''}
        </Text>

        <Pressable
          style={[styles.botao, (!algumPreenchido || salvando) && styles.botaoDesabilitado]}
          onPress={salvar}
          disabled={!algumPreenchido || salvando}
        >
          {salvando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.botaoTexto}>Salvar combinado</Text>
          }
        </Pressable>
        <Text style={styles.hint}>Somente admins da casa podem definir o combinado.</Text>

        <MonthPicker
          visivel={pickerVisivel}
          valor={competencia}
          onSelecionar={setCompetencia}
          onFechar={() => setPickerVisivel(false)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:         { padding: 16, gap: 8 },

  hint:              { fontSize: 12, color: '#999' },
  label:             { fontSize: 14, color: '#555', marginTop: 8 },
  input:             { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12 },
  inputTexto:        { fontSize: 16 },

  linha:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12 },
  linhaNome:         { fontSize: 15, fontWeight: '500', flexShrink: 1 },
  percentualBox:     { flexDirection: 'row', alignItems: 'center', gap: 4 },
  percentualInput:   { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8, fontSize: 16, minWidth: 72, textAlign: 'right', backgroundColor: '#fff' },
  percentualSufixo:  { fontSize: 16, color: '#555' },

  total:             { fontSize: 14, fontWeight: '600', color: '#2e7d32', textAlign: 'right', marginTop: 4 },
  totalErrado:       { color: '#c62828' },

  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 12 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },

  erro:              { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:             { padding: 10 },
  retryTexto:        { color: '#1565c0' },
});
