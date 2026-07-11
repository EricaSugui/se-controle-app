import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { deleteMeta, getMetas } from '@/src/services/api/metas';
import { getDashboard } from '@/src/services/api/dashboard';
import { formatCurrency } from '@/src/utils/formatters';
import { competenciaAtual } from '@/src/utils/competencia';
import { confirmar, notificar } from '@/src/utils/confirmar';
import type { CasaDashboard, Meta } from '@/src/types';

export default function MetasScreen() {
  const [itens, setItens] = useState<Meta[]>([]);
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getMetas(),
      getDashboard(competenciaAtual()).then((d) => d.casas).catch(() => [] as CasaDashboard[]),
    ])
      .then(([metas, casasResp]) => {
        setItens(metas);
        setCasas(casasResp);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(carregar);

  function nomeEscopo(meta: Meta): string {
    if (meta.pessoa_id != null) return 'Pessoal';
    const casa = casas.find((c) => c.id === meta.casa_id);
    return casa?.nome ?? `Casa #${meta.casa_id}`;
  }

  function editar(item: Meta) {
    router.push({ pathname: '/(app)/metas/[id]', params: { id: item.id } });
  }

  function confirmarExcluir(item: Meta) {
    confirmar(
      { titulo: 'Excluir meta', mensagem: `Deseja excluir a meta "${item.objetivo}"?`, textoConfirmar: 'Excluir' },
      () => excluir(item.id)
    );
  }

  async function excluir(id: number) {
    try {
      await deleteMeta(id);
      carregar();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
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
        data={itens}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma meta cadastrada.</Text>}
        renderItem={({ item }: { item: Meta }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <View style={styles.itemTopo}>
                <Text style={styles.itemObjetivo}>{item.objetivo}</Text>
                <View style={[styles.badge, item.pessoa_id != null ? styles.badgePessoal : styles.badgeCasa]}>
                  <Text style={styles.badgeTexto}>{nomeEscopo(item)}</Text>
                </View>
              </View>
              <Text style={styles.itemValores}>
                {formatCurrency(item.valor_atual)}
                {item.meta != null && ` / ${formatCurrency(item.meta)}`}
                {item.falta != null && ` · falta ${formatCurrency(item.falta)}`}
              </Text>
            </View>
            <View style={styles.acoes}>
              <Pressable onPress={() => editar(item)}>
                <Text style={styles.editar}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => confirmarExcluir(item)}>
                <Text style={styles.excluir}>Excluir</Text>
              </Pressable>
            </View>
          </View>
        )}
      />
      <Pressable style={styles.botaoNova} onPress={() => router.push('/(app)/metas/novo')}>
        <Text style={styles.botaoNovaTexto}>+ Nova meta</Text>
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
  itemInfo:        { flex: 1 },
  itemTopo:        { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  itemObjetivo:    { fontSize: 15, fontWeight: '600' },
  itemValores:     { fontSize: 13, color: '#555', marginTop: 4 },

  badge:           { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgePessoal:    { backgroundColor: '#757575' },
  badgeCasa:       { backgroundColor: '#1565c0' },
  badgeTexto:      { color: '#fff', fontSize: 12, fontWeight: '600' },

  acoes:           { flexDirection: 'row', gap: 16, marginLeft: 12 },
  editar:          { color: '#1565c0', fontSize: 14 },
  excluir:         { color: '#c62828', fontSize: 14 },

  botaoNova:       { margin: 16, backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center' },
  botaoNovaTexto:  { color: '#fff', fontWeight: '600', fontSize: 15 },

  erro:            { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:           { padding: 10 },
  retryTexto:      { color: '#1565c0' },
});
