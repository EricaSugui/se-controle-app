import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MonthPicker } from '@/src/components/ui/MonthPicker';
import { deleteReceita, getReceitas } from '@/src/services/api/receitas';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import type { Receita } from '@/src/types';

function competenciaAtual(): string {
  const now = new Date();
  const mes = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const ano = String(now.getFullYear()).slice(-2);
  return `${mes}-${ano}`;
}

export default function ReceitasScreen() {
  const [competencia, setCompetencia] = useState(competenciaAtual);
  const [seletorVisivel, setSeletorVisivel] = useState(false);
  const [itens, setItens] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    getReceitas(competencia)
      .then(setItens)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [competencia]);

  useFocusEffect(carregar);

  function editar(item: Receita) {
    router.push({
      pathname: '/(app)/mais/receitas/[id]',
      params: {
        id: item.id,
        casaId: item.casa_id,
        pessoaId: item.pessoa_id != null ? String(item.pessoa_id) : '',
        origemId: item.origem_id != null ? String(item.origem_id) : '',
        observacao: item.observacao ?? '',
        valorBruto: item.valor_bruto != null ? String(item.valor_bruto) : '',
        descontos: item.descontos != null ? String(item.descontos) : '',
        valorLiquido: String(item.valor_liquido),
        data: item.data ?? '',
        competencia: item.competencia ?? '',
      },
    });
  }

  function confirmarExcluir(item: Receita) {
    Alert.alert(
      'Excluir receita',
      `Deseja excluir esta receita${item.origem_nome ? ` de ${item.origem_nome}` : ''}? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => excluir(item.id) },
      ]
    );
  }

  async function excluir(id: number) {
    try {
      await deleteReceita(id);
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
      <Pressable onPress={() => setSeletorVisivel(true)} style={styles.competenciaBotao}>
        <Text style={styles.competencia}>{competencia}</Text>
        <Text style={styles.competenciaHint}>▼ trocar mês</Text>
      </Pressable>

      <FlatList
        data={itens}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vazio}>Nenhuma receita nesta competência.</Text>}
        renderItem={({ item }: { item: Receita }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemValor}>{formatCurrency(item.valor_liquido)}</Text>
              <Text style={styles.itemDetalhe}>
                {[item.origem_nome, item.pessoa_nome].filter(Boolean).join(' · ') || 'Sem origem/pessoa'}
              </Text>
              {item.data && <Text style={styles.itemData}>{formatDate(item.data)}</Text>}
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
      <Pressable style={styles.botaoNova} onPress={() => router.push('/(app)/mais/receitas/novo')}>
        <Text style={styles.botaoNovaTexto}>+ Nova receita</Text>
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
  itemValor:         { fontSize: 16, fontWeight: '600', color: '#2e7d32' },
  itemDetalhe:       { fontSize: 13, color: '#555', marginTop: 2 },
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
