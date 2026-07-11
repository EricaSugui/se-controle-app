import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { getFaturas } from '@/src/services/api/faturas';
import { formatDate } from '@/src/utils/formatters';
import type { Fatura } from '@/src/types';

export default function FaturasScreen() {
  const { cartaoId, nome } = useLocalSearchParams<{ cartaoId: string; nome: string }>();
  const navigation = useNavigation();
  const id = Number(cartaoId);

  const [itens, setItens] = useState<Fatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getFaturas(id)
      .then(setItens)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(carregar);

  useFocusEffect(
    useCallback(() => {
      if (nome) navigation.setOptions({ title: `Faturas — ${nome}` });
    }, [nome, navigation])
  );

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
        data={itens}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            Nenhuma fatura ainda — faturas nascem automaticamente com a primeira compra no cartão.
          </Text>
        }
        renderItem={({ item }: { item: Fatura }) => (
          <Pressable
            style={styles.item}
            onPress={() => router.push({ pathname: '/(app)/mais/cartoes-contas/fatura', params: { faturaId: item.id } })}
          >
            <Text style={styles.itemMes}>{item.mes_referencia}</Text>
            <Text style={styles.itemDatas}>
              {`Vencimento ${formatDate(item.data_vencimento)} · Fechamento ${formatDate(item.data_fechamento)}`}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:  { flex: 1 },
  lista:      { padding: 16, gap: 8, flexGrow: 1 },
  vazio:      { textAlign: 'center', color: '#888', marginTop: 32, paddingHorizontal: 24 },

  item:       { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 14 },
  itemMes:    { fontSize: 15, fontWeight: '600' },
  itemDatas:  { fontSize: 13, color: '#555', marginTop: 2 },

  erro:       { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:      { padding: 10 },
  retryTexto: { color: '#1565c0' },
});
