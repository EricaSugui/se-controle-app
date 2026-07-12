import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  ativarCategoria,
  createCategoria,
  desativarCategoria,
  getCategorias,
  updateCategoria,
} from '@/src/services/api/categorias';
import {
  ativarFormaPagamento,
  createFormaPagamento,
  desativarFormaPagamento,
  getFormasPagamento,
  updateFormaPagamento,
} from '@/src/services/api/formasPagamento';
import {
  ativarOrigemReceita,
  createOrigemReceita,
  desativarOrigemReceita,
  getOrigensReceita,
  updateOrigemReceita,
} from '@/src/services/api/origensReceita';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/Button';
import { confirmar, notificar } from '@/src/utils/confirmar';

type ItemCatalogo = {
  id: number;
  nome: string;
  ativo: boolean;
  created_at: string;
};

type CatalogoConfig = {
  key: 'categorias' | 'formas-pagamento' | 'origens-receita';
  label: string;
  labelSingular: string;
  listar: () => Promise<ItemCatalogo[]>;
  criar: (nome: string) => Promise<ItemCatalogo>;
  atualizar: (id: number, nome: string) => Promise<ItemCatalogo>;
  ativar: (id: number) => Promise<ItemCatalogo>;
  desativar: (id: number) => Promise<ItemCatalogo>;
};

const CATALOGOS: CatalogoConfig[] = [
  {
    key: 'categorias',
    label: 'Categorias',
    labelSingular: 'categoria',
    listar: () => getCategorias(),
    criar: createCategoria,
    atualizar: updateCategoria,
    ativar: ativarCategoria,
    desativar: desativarCategoria,
  },
  {
    key: 'formas-pagamento',
    label: 'Formas de pagamento',
    labelSingular: 'forma de pagamento',
    listar: () => getFormasPagamento(),
    criar: createFormaPagamento,
    atualizar: updateFormaPagamento,
    ativar: ativarFormaPagamento,
    desativar: desativarFormaPagamento,
  },
  {
    key: 'origens-receita',
    label: 'Origens de receita',
    labelSingular: 'origem de receita',
    listar: () => getOrigensReceita(),
    criar: createOrigemReceita,
    atualizar: updateOrigemReceita,
    ativar: ativarOrigemReceita,
    desativar: desativarOrigemReceita,
  },
];

export default function AdministracaoScreen() {
  const { user } = useAuth();

  const [catalogo, setCatalogo] = useState<CatalogoConfig>(CATALOGOS[0]);
  const [itens, setItens] = useState<ItemCatalogo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [itemEditando, setItemEditando] = useState<ItemCatalogo | null>(null);
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    catalogo
      .listar()
      .then(setItens)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [catalogo]);

  useFocusEffect(carregar);

  function abrirCriar() {
    setItemEditando(null);
    setNome('');
    setModalVisivel(true);
  }

  function abrirEditar(item: ItemCatalogo) {
    setItemEditando(item);
    setNome(item.nome);
    setModalVisivel(true);
  }

  async function salvar() {
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      notificar('Atenção', 'Informe o nome.');
      return;
    }
    setSalvando(true);
    try {
      if (itemEditando) await catalogo.atualizar(itemEditando.id, nomeLimpo);
      else await catalogo.criar(nomeLimpo);
      setModalVisivel(false);
      carregar();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  function confirmarDesativar(item: ItemCatalogo) {
    confirmar(
      { titulo: 'Desativar', mensagem: `Deseja desativar "${item.nome}"?`, textoConfirmar: 'Desativar' },
      () => alternarStatus(item, false)
    );
  }

  async function alternarStatus(item: ItemCatalogo, ativar: boolean) {
    try {
      if (ativar) await catalogo.ativar(item.id);
      else await catalogo.desativar(item.id);
      carregar();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    }
  }

  if (!user?.admin_sistema) {
    return (
      <View style={styles.center}>
        <Text style={styles.erro}>Acesso restrito a administradores.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.opcoesContainer}>
        {CATALOGOS.map((c) => (
          <Pressable
            key={c.key}
            style={[styles.opcao, catalogo.key === c.key && styles.opcaoAtiva]}
            onPress={() => setCatalogo(c)}
          >
            <Text style={[styles.opcaoTexto, catalogo.key === c.key && styles.opcaoTextoAtivo]}>
              {c.label}
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
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum item cadastrado.</Text>}
          renderItem={({ item }: { item: ItemCatalogo }) => (
            <View style={[styles.item, !item.ativo && styles.itemInativo]}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemNome}>{item.nome}</Text>
                {!item.ativo && <Text style={styles.itemStatus}>Inativo</Text>}
              </View>
              <View style={styles.acoes}>
                <Pressable onPress={() => abrirEditar(item)}>
                  <Text style={styles.editar}>Editar</Text>
                </Pressable>
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
            </View>
          )}
        />
      )}

      <Pressable style={styles.botaoNovo} onPress={abrirCriar}>
        <Text style={styles.botaoNovoTexto}>+ Nova {catalogo.labelSingular}</Text>
      </Pressable>

      <Modal
        visible={modalVisivel}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisivel(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setModalVisivel(false)} />
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>
            {itemEditando ? `Editar ${catalogo.labelSingular}` : `Nova ${catalogo.labelSingular}`}
          </Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Nome"
            autoFocus
          />
          <View style={styles.cardBotoes}>
            <Button label="Cancelar" variant="outline" onPress={() => setModalVisivel(false)} />
            <Button label="Salvar" loading={salvando} onPress={salvar} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:       { flex: 1 },

  opcoesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, paddingBottom: 0 },
  opcao:           { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  opcaoAtiva:      { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  opcaoTexto:      { fontSize: 14, color: '#555' },
  opcaoTextoAtivo: { color: '#1565c0', fontWeight: '600' },

  lista:           { padding: 16, gap: 8, flexGrow: 1 },
  vazio:           { textAlign: 'center', color: '#888', marginTop: 32 },

  item:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 14 },
  itemInativo:     { opacity: 0.5 },
  itemInfo:        { flex: 1 },
  itemNome:        { fontSize: 15, fontWeight: '500' },
  itemStatus:      { fontSize: 12, color: '#777', marginTop: 2 },
  acoes:           { flexDirection: 'row', gap: 16 },
  editar:          { color: '#1565c0', fontSize: 14 },
  desativar:       { color: '#c62828', fontSize: 14 },
  ativar:          { color: '#2e7d32', fontSize: 14 },

  botaoNovo:       { margin: 16, backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center' },
  botaoNovoTexto:  { color: '#fff', fontWeight: '600', fontSize: 15 },

  backdrop:        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  card: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: 300,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTitulo:      { fontSize: 16, fontWeight: 'bold' },
  input:           { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 15 },
  cardBotoes:      { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },

  erro:            { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:           { padding: 10 },
  retryTexto:      { color: '#1565c0' },
});
