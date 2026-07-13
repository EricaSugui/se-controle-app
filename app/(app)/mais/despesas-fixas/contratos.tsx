import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getDespesasFixas } from '@/src/services/api/despesasFixas';
import { formatCurrency } from '@/src/utils/formatters';
import type { DespesaFixa } from '@/src/types';

type Filtro = 'vigentes' | 'encerradas' | 'todas';

const FILTROS: { valor: Filtro; label: string }[] = [
  { valor: 'vigentes', label: 'Vigentes' },
  { valor: 'encerradas', label: 'Encerradas' },
  { valor: 'todas', label: 'Todas' },
];

function hojeISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export default function ContratosScreen() {
  const [filtro, setFiltro] = useState<Filtro>('vigentes');
  const [itens, setItens] = useState<DespesaFixa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    getDespesasFixas(filtro === 'todas' ? undefined : { vigente: filtro === 'vigentes' })
      .then(setItens)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filtro]);

  useFocusEffect(carregar);

  function abrirDetalhe(item: DespesaFixa) {
    router.push({
      pathname: '/(app)/mais/despesas-fixas/[id]',
      params: { id: item.id, descricao: item.descricao },
    });
  }

  const hoje = hojeISO();

  return (
    <View style={styles.container}>
      <View style={styles.filtros}>
        {FILTROS.map((f) => (
          <Pressable
            key={f.valor}
            style={[styles.opcao, filtro === f.valor && styles.opcaoAtiva]}
            onPress={() => setFiltro(f.valor)}
          >
            <Text style={[styles.opcaoTexto, filtro === f.valor && styles.opcaoTextoAtivo]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.erro}>{error}</Text>
          <Pressable onPress={carregar} style={styles.retry}>
            <Text style={styles.retryTexto}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhuma despesa fixa encontrada.</Text>}
          renderItem={({ item }: { item: DespesaFixa }) => {
            const encerrada = item.vigente_ate != null && item.vigente_ate.slice(0, 10) < hoje;
            return (
              <Pressable
                style={[styles.item, encerrada && styles.itemInativo]}
                onPress={() => abrirDetalhe(item)}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome}>{item.descricao}</Text>
                  <Text style={styles.itemDetalhe}>
                    {[
                      item.categoria_nome,
                      item.periodicidade === 'mensal' ? 'Mensal' : 'Anual',
                      `dia ${item.dia_esperado}`,
                      item.casa_id != null ? 'Casa' : 'Pessoal',
                      encerrada ? 'Encerrada' : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                </View>
                <Text style={styles.itemValor}>
                  {item.tipo_valor === 'variavel_estimado' ? '~' : ''}
                  {formatCurrency(item.valor_referencia)}
                </Text>
              </Pressable>
            );
          }}
        />
      )}

      <Pressable style={styles.botaoNovo} onPress={() => router.push('/(app)/mais/despesas-fixas/novo')}>
        <Text style={styles.botaoNovoTexto}>+ Nova despesa fixa</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:       { flex: 1 },

  filtros:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, paddingBottom: 0 },
  opcao:           { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  opcaoAtiva:      { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  opcaoTexto:      { fontSize: 14, color: '#555' },
  opcaoTextoAtivo: { color: '#1565c0', fontWeight: '600' },

  lista:           { padding: 16, gap: 8, flexGrow: 1 },
  vazio:           { textAlign: 'center', color: '#888', marginTop: 32 },

  item:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 14, gap: 12 },
  itemInativo:     { opacity: 0.5 },
  itemInfo:        { flex: 1 },
  itemNome:        { fontSize: 15, fontWeight: '500' },
  itemDetalhe:     { fontSize: 12, color: '#777', marginTop: 2 },
  itemValor:       { fontSize: 14, fontWeight: '600' },

  botaoNovo:       { margin: 16, backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center' },
  botaoNovoTexto:  { color: '#fff', fontWeight: '600', fontSize: 15 },

  erro:            { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:           { padding: 10 },
  retryTexto:      { color: '#1565c0' },
});
