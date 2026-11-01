import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { listarAcertos } from '@/src/services/api/acerto';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import type { AcertoRelatorioResumo } from '@/src/types';

export default function AcertosScreen() {
  const { id, nome } = useLocalSearchParams<{ id: string; nome?: string }>();
  const casaId = Number(id);
  const [acertos, setAcertos] = useState<AcertoRelatorioResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    listarAcertos(casaId)
      .then(setAcertos)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [casaId]);

  useFocusEffect(carregar);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.intro}>Relatórios permanentes dos acertos confirmados desta casa.</Text>
      {error && (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={carregar} style={styles.retry}><Text style={styles.retryText}>Tentar novamente</Text></Pressable>
        </View>
      )}
      {!error && acertos.length === 0 && <Text style={styles.empty}>Nenhum acerto confirmado ainda.</Text>}
      {acertos.map((acerto) => (
        <Pressable
          key={acerto.id}
          style={styles.card}
          onPress={() => router.push({
            pathname: '/(app)/mais/casas/acerto-detalhe',
            params: { id: casaId, acertoId: acerto.id, nome },
          })}
        >
          <View style={styles.row}>
            <Text style={styles.title}>Acerto de {formatDate(acerto.confirmado_em)}</Text>
            <Text style={styles.total}>{formatCurrency(acerto.total)}</Text>
          </View>
          <Text style={styles.detail}>{acerto.nome_casa} · {acerto.moeda}</Text>
          <Text style={styles.link}>Ver relatório ›</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 10 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20 },
  intro: { color: '#666', fontSize: 14, marginBottom: 4 },
  card: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, gap: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  title: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  total: { fontSize: 15, fontWeight: '700' },
  detail: { color: '#666', fontSize: 13 },
  link: { color: '#1565c0', fontSize: 13, fontWeight: '600', marginTop: 4 },
  empty: { color: '#888', fontStyle: 'italic', textAlign: 'center', paddingVertical: 24 },
  error: { color: '#c62828', textAlign: 'center' },
  retry: { padding: 10 },
  retryText: { color: '#1565c0', fontWeight: '600' },
});
