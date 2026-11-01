import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { obterAcerto } from '@/src/services/api/acerto';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import type { AcertoRelatorio } from '@/src/types';

export default function AcertoDetalheScreen() {
  const { id, acertoId, nome } = useLocalSearchParams<{ id: string; acertoId: string; nome?: string }>();
  const navigation = useNavigation();
  const [acerto, setAcerto] = useState<AcertoRelatorio | null>(null);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(() => {
    obterAcerto(Number(id), Number(acertoId))
      .then(setAcerto)
      .catch((e: Error) => setError(e.message));
  }, [id, acertoId]);

  useFocusEffect(carregar);
  useFocusEffect(useCallback(() => {
    navigation.setOptions({ title: `Relatório — ${nome ?? 'Acerto'}` });
  }, [navigation, nome]));

  if (error) return <View style={styles.center}><Text style={styles.error}>{error}</Text></View>;
  if (!acerto) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Acerto de {formatDate(acerto.confirmado_em)}</Text>
      <Text style={styles.subtitle}>{acerto.nome_casa} · {acerto.moeda}</Text>

      <Text style={styles.section}>Resumo por pessoa</Text>
      {acerto.participantes.map((p) => (
        <View key={p.pessoa_id} style={styles.card}>
          <View style={styles.row}><Text style={styles.name}>{p.nome}</Text><Text style={styles.balance}>{formatCurrency(p.saldo)}</Text></View>
          <Text style={styles.detail}>Devido {formatCurrency(p.devido)} · Desembolsado {formatCurrency(p.desembolsado)}</Text>
        </View>
      ))}

      {acerto.transferencias.length > 0 && (
        <>
          <Text style={styles.section}>Transferências</Text>
          {acerto.transferencias.map((t, index) => (
            <View key={`${t.de_pessoa_id}-${t.para_pessoa_id}-${index}`} style={styles.card}>
              <Text style={styles.name}>{t.de_nome} → {t.para_nome}</Text>
              <Text style={styles.detail}>{formatCurrency(t.valor)} · {t.tipo}</Text>
            </View>
          ))}
        </>
      )}

      <Text style={styles.section}>Despesas incluídas: {acerto.despesas.length}</Text>
      {acerto.despesas.map((d, index) => (
        <View key={`${d.data}-${index}`} style={styles.card}>
          <View style={styles.row}><Text style={styles.name}>{d.descricao}</Text><Text>{formatCurrency(d.valor)}</Text></View>
          <Text style={styles.detail}>{formatDate(d.data)} · {d.nome_pessoa}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  error: { color: '#c62828', textAlign: 'center' },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#666', fontSize: 14 },
  section: { color: '#555', fontSize: 14, fontWeight: '600', marginTop: 16, textTransform: 'uppercase' },
  card: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  balance: { fontWeight: '700' },
  detail: { color: '#666', fontSize: 13 },
});
