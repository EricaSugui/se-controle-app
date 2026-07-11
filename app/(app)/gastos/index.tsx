import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MonthPicker } from '@/src/components/ui/MonthPicker';
import { deleteCompra, getCompras } from '@/src/services/api/compras';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import { competenciaAtual } from '@/src/utils/competencia';
import { confirmar, notificar } from '@/src/utils/confirmar';
import type { Compra } from '@/src/types';

export default function GastosScreen() {
  const [competencia, setCompetencia] = useState(competenciaAtual);
  const [seletorVisivel, setSeletorVisivel] = useState(false);
  const [itens, setItens] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    getCompras(competencia)
      .then(setItens)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [competencia]);

  useFocusEffect(carregar);

  function editar(item: Compra) {
    router.push({ pathname: '/(app)/gastos/[id]', params: { id: item.id } });
  }

  function confirmarExcluir(item: Compra) {
    confirmar(
      {
        titulo: 'Excluir compra',
        mensagem: `Deseja excluir esta compra${item.descricao ? ` (${item.descricao})` : ''}? Todas as parcelas serão removidas.`,
        textoConfirmar: 'Excluir',
      },
      () => excluir(item.id)
    );
  }

  async function excluir(id: number) {
    try {
      await deleteCompra(id);
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
      <Pressable onPress={() => setSeletorVisivel(true)} style={styles.competenciaBotao}>
        <Text style={styles.competencia}>{competencia}</Text>
        <Text style={styles.competenciaHint}>▼ trocar mês</Text>
      </Pressable>

      <FlatList
        data={itens}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma compra nesta competência.</Text>}
        renderItem={({ item }: { item: Compra }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemValor}>
                {formatCurrency(item.valor_parcela * item.total_parcelas)}
                {item.total_parcelas > 1 && (
                  <Text style={styles.itemParcelas}>{`  · ${item.total_parcelas}x de ${formatCurrency(item.valor_parcela)}`}</Text>
                )}
              </Text>
              <Text style={styles.itemDetalhe}>{item.descricao || item.categoria_nome || 'Sem descrição'}</Text>
              {(item.pessoa_nome || item.cartao_conta_nome) && (
                <Text style={styles.itemMeta}>
                  {[item.pessoa_nome, item.cartao_conta_nome].filter(Boolean).join(' · ')}
                </Text>
              )}
              <Text style={styles.itemData}>{formatDate(item.data)}</Text>
            </View>
            {item.pode_editar && (
              <View style={styles.acoes}>
                <Pressable onPress={() => editar(item)}>
                  <Text style={styles.editar}>Editar</Text>
                </Pressable>
                <Pressable onPress={() => confirmarExcluir(item)}>
                  <Text style={styles.excluir}>Excluir</Text>
                </Pressable>
              </View>
            )}
          </View>
        )}
      />

      <Pressable style={styles.botaoNova} onPress={() => router.push('/(app)/gastos/novo')}>
        <Text style={styles.botaoNovaTexto}>+ Nova compra</Text>
      </Pressable>

      <MonthPicker
        visivel={seletorVisivel}
        valor={competencia}
        onSelecionar={setCompetencia}
        onFechar={() => setSeletorVisivel(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:         { flex: 1 },
  competenciaBotao:  { alignItems: 'center', paddingTop: 16 },
  competencia:       { fontSize: 18, fontWeight: 'bold' },
  competenciaHint:   { fontSize: 12, color: '#888', marginTop: 2 },

  lista:             { padding: 16, gap: 8, flexGrow: 1 },
  vazio:             { textAlign: 'center', color: '#888', marginTop: 32 },

  item:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 14 },
  itemInfo:          { flex: 1 },
  itemValor:         { fontSize: 16, fontWeight: '600', color: '#c62828' },
  itemParcelas:      { fontSize: 13, fontWeight: '400', color: '#777' },
  itemDetalhe:       { fontSize: 13, color: '#555', marginTop: 2 },
  itemMeta:          { fontSize: 12, color: '#777', marginTop: 2 },
  itemData:          { fontSize: 12, color: '#888', marginTop: 2 },
  acoes:             { flexDirection: 'row', gap: 16 },
  editar:            { color: '#1565c0', fontSize: 14 },
  excluir:           { color: '#c62828', fontSize: 14 },

  botaoNova:         { margin: 16, backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center' },
  botaoNovaTexto:    { color: '#fff', fontWeight: '600', fontSize: 15 },

  erro:              { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:             { padding: 10 },
  retryTexto:        { color: '#1565c0' },
});
