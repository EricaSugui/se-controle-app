import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ativarCartaoConta, desativarCartaoConta, getCartoesContas } from '@/src/services/api/cartoesContas';
import { confirmar, notificar } from '@/src/utils/confirmar';
import type { CartaoConta } from '@/src/types';

export default function CartoesContasScreen() {
  const [itens, setItens] = useState<CartaoConta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    getCartoesContas()
      .then(setItens)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(carregar);

  function editar(item: CartaoConta) {
    router.push({
      pathname: '/(app)/mais/cartoes-contas/[id]',
      params: {
        id: item.id,
        nome: item.nome,
        tipo: item.tipo,
        titularId: item.titular_id != null ? String(item.titular_id) : '',
        limite: item.limite != null ? String(item.limite) : '',
        diaFechamento: item.dia_fechamento != null ? String(item.dia_fechamento) : '',
        diaVencimento: item.dia_vencimento != null ? String(item.dia_vencimento) : '',
      },
    });
  }

  function compartilhar(item: CartaoConta) {
    router.push({
      pathname: '/(app)/mais/cartoes-contas/visibilidade',
      params: { cartaoId: item.id, nome: item.nome },
    });
  }

  function verFaturas(item: CartaoConta) {
    router.push({
      pathname: '/(app)/mais/cartoes-contas/faturas',
      params: { cartaoId: item.id, nome: item.nome },
    });
  }

  function confirmarDesativar(item: CartaoConta) {
    confirmar(
      { titulo: 'Desativar', mensagem: `Deseja desativar "${item.nome}"?`, textoConfirmar: 'Desativar' },
      () => alternarStatus(item, false)
    );
  }

  async function alternarStatus(item: CartaoConta, ativar: boolean) {
    try {
      if (ativar) await ativarCartaoConta(item.id);
      else await desativarCartaoConta(item.id);
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
        ListEmptyComponent={<Text style={styles.vazio}>Nenhum cartão ou conta cadastrado.</Text>}
        renderItem={({ item }: { item: CartaoConta }) => (
          <View style={[styles.item, !item.ativo && styles.itemInativo]}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <Text style={styles.itemTipo}>{item.tipo === 'credito' ? 'Crédito' : 'Débito'}</Text>
            </View>
            {item.pode_editar && (
              <View style={styles.acoes}>
                <Pressable onPress={() => editar(item)}>
                  <Text style={styles.editar}>Editar</Text>
                </Pressable>
                <Pressable onPress={() => compartilhar(item)}>
                  <Text style={styles.editar}>Compartilhar</Text>
                </Pressable>
                {item.tipo === 'credito' && (
                  <Pressable onPress={() => verFaturas(item)}>
                    <Text style={styles.editar}>Faturas</Text>
                  </Pressable>
                )}
                {item.ativo ? (
                  <Pressable onPress={() => confirmarDesativar(item)}>
                    <Text style={styles.desativar}>Desativar</Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={() => alternarStatus(item, true)}>
                    <Text style={styles.ativar}>Ativar</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        )}
      />
      <Pressable style={styles.botaoNovo} onPress={() => router.push('/(app)/mais/cartoes-contas/novo')}>
        <Text style={styles.botaoNovoTexto}>+ Novo cartão/conta</Text>
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
  itemInativo:     { opacity: 0.5 },
  itemInfo:        { flex: 1 },
  itemNome:        { fontSize: 15, fontWeight: '500' },
  itemTipo:        { fontSize: 12, color: '#777', marginTop: 2 },
  acoes:           { flexDirection: 'row', gap: 16 },
  editar:          { color: '#1565c0', fontSize: 14 },
  desativar:       { color: '#c62828', fontSize: 14 },
  ativar:          { color: '#2e7d32', fontSize: 14 },

  botaoNovo:       { margin: 16, backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center' },
  botaoNovoTexto:  { color: '#fff', fontWeight: '600', fontSize: 15 },

  erro:            { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:           { padding: 10 },
  retryTexto:      { color: '#1565c0' },
});
