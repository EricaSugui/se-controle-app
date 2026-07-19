import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Categoria } from '@/src/types';

// Defaults espelham os defaults de coluna no backend (icone/cor de "Outros")
// — usados aqui apenas como rede de segurança caso o payload venha incompleto.
const ICONE_PADRAO = 'dots-horizontal-circle-outline';
const COR_PADRAO = '#9E9E9E';

type ItemGrid = { id: number | null; nome: string; icone: string; cor: string };

const TODAS_CATEGORIAS: ItemGrid = { id: null, nome: 'Todas', icone: 'apps', cor: '#616161' };

type Props = {
  categorias: Categoria[];
  categoriaSelecionadaId: number | null;
  onSelect: (categoriaId: number | null) => void;
  // 'filter' adiciona a opção "Todas as categorias" no topo do grid
  mode?: 'select' | 'filter';
};

export function CategoriaSelector({ categorias, categoriaSelecionadaId, onSelect, mode = 'select' }: Props) {
  const [aberto, setAberto] = useState(false);
  const { width } = useWindowDimensions();
  const colunas = width < 360 ? 2 : 3;
  const itemLargura = colunas === 2 ? '46%' : '30%';

  const categoriaSelecionada = categorias.find((c) => c.id === categoriaSelecionadaId);

  const icone = categoriaSelecionada?.icone || (mode === 'filter' && categoriaSelecionadaId == null ? TODAS_CATEGORIAS.icone : ICONE_PADRAO);
  const cor = categoriaSelecionada?.cor || (mode === 'filter' && categoriaSelecionadaId == null ? TODAS_CATEGORIAS.cor : COR_PADRAO);
  const label = categoriaSelecionada?.nome ?? (mode === 'filter' ? 'Todas as categorias' : 'Selecionar categoria');

  const itens: ItemGrid[] = mode === 'filter' ? [TODAS_CATEGORIAS, ...categorias] : categorias;

  function selecionar(id: number | null) {
    onSelect(id);
    setAberto(false);
  }

  return (
    <>
      <Pressable style={styles.chip} onPress={() => setAberto(true)}>
        <View style={[styles.circulo, { backgroundColor: cor }]}>
          <MaterialCommunityIcons name={icone as never} size={18} color="#fff" />
        </View>
        <Text style={styles.chipTexto} numberOfLines={1}>{label}</Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#777" />
      </Pressable>

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAberto(false)} />

        <View style={styles.sheet}>
          <Text style={styles.titulo}>Categoria</Text>

          <ScrollView contentContainerStyle={styles.grid}>
            {itens.map((item) => {
              const selecionado = item.id === categoriaSelecionadaId;
              return (
                <Pressable
                  key={String(item.id)}
                  style={[styles.item, { width: itemLargura }]}
                  onPress={() => selecionar(item.id)}
                >
                  <View style={[styles.itemCirculo, { backgroundColor: item.cor || COR_PADRAO }, selecionado && styles.itemCirculoSelecionado]}>
                    <MaterialCommunityIcons name={(item.icone || ICONE_PADRAO) as never} size={26} color="#fff" />
                  </View>
                  <Text style={[styles.itemTexto, selecionado && styles.itemTextoSelecionado]} numberOfLines={2}>
                    {item.nome}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  circulo:    { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chipTexto:  { flex: 1, fontSize: 16, color: '#000' },

  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },

  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  titulo: { fontSize: 16, fontWeight: '600', marginBottom: 12 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 8 },
  item: { minHeight: 44, alignItems: 'center', gap: 6 },
  itemCirculo:             { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  itemCirculoSelecionado:  { borderWidth: 3, borderColor: '#6200ee' },
  itemTexto:               { fontSize: 12, color: '#555', textAlign: 'center' },
  itemTextoSelecionado:    { color: '#6200ee', fontWeight: '700' },
});
