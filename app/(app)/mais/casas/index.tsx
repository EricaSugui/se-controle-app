import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { desativarCasa } from '@/src/services/api/casas';
import { getDashboard } from '@/src/services/api/dashboard';
import type { CasaDashboard } from '@/src/types';

function competenciaAtual(): string {
  const now = new Date();
  const mes = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const ano = String(now.getFullYear()).slice(-2);
  return `${mes}-${ano}`;
}

export default function CasasScreen() {
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    getDashboard(competenciaAtual())
      .then((data) => setCasas(data.casas))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(carregar);

  function confirmarDesativar(casa: CasaDashboard) {
    Alert.alert(
      'Remover casa',
      `Deseja remover "${casa.nome}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: () => remover(casa.id) },
      ]
    );
  }

  async function remover(id: number) {
    try {
      await desativarCasa(id);
      carregar();
    } catch (e: unknown) {
      Alert.alert('Erro', (e as Error).message);
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
    <View style={styles.container}>
      <FlatList
        data={casas}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma casa cadastrada.</Text>}
        renderItem={({ item }: { item: CasaDashboard }) => (
          <View style={styles.item}>
            <Text style={styles.itemNome}>{item.nome}</Text>
            <View style={styles.acoes}>
              <Pressable onPress={() => router.push({ pathname: '/(app)/mais/casas/[id]', params: { id: item.id, nome: item.nome } })}>
                <Text style={styles.membros}>Membros</Text>
              </Pressable>
              <Pressable onPress={() => confirmarDesativar(item)}>
                <Text style={styles.remover}>Remover</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <Pressable style={styles.botaoNova} onPress={() => router.push('/(app)/mais/casas/nova')}>
        <Text style={styles.botaoNovaTexto}>+ Nova casa</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:       { flex: 1 },
  lista:           { padding: 16, gap: 8, flexGrow: 1 },
  vazio:           { textAlign: 'center', color: '#888', marginTop: 32 },

  item:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 14 },
  itemNome:        { fontSize: 15, fontWeight: '500', flex: 1 },
  acoes:           { flexDirection: 'row', gap: 16 },
  membros:         { color: '#1565c0', fontSize: 14 },
  remover:         { color: '#c62828', fontSize: 14 },

  botaoNova:       { margin: 16, backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center' },
  botaoNovaTexto:  { color: '#fff', fontWeight: '600', fontSize: 15 },

  erro:            { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:           { padding: 10 },
  retryTexto:      { color: '#1565c0' },
});
