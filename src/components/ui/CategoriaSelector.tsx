import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Categoria } from '@/src/types';
import { Sheet } from '@/src/components/ui/Sheet';
import { cores, raio } from '@/src/theme/tokens';

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
          <MaterialCommunityIcons name={icone as never} size={18} color={cores.textoInverso} />
        </View>
        <Text style={styles.chipTexto} numberOfLines={1}>{label}</Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color={cores.textoSuave} />
      </Pressable>

      <Sheet visivel={aberto} titulo="Categoria" onFechar={() => setAberto(false)}>
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
                  <MaterialCommunityIcons name={(item.icone || ICONE_PADRAO) as never} size={26} color={cores.textoInverso} />
                </View>
                <Text style={[styles.itemTexto, selecionado && styles.itemTextoSelecionado]} numberOfLines={2}>
                  {item.nome}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raio.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  circulo:    { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  chipTexto:  { flex: 1, fontSize: 16, color: cores.texto },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 8 },
  item: { minHeight: 44, alignItems: 'center', gap: 6 },
  itemCirculo:             { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  itemCirculoSelecionado:  { borderWidth: 3, borderColor: cores.primaria },
  itemTexto:               { fontSize: 12, color: cores.textoMedio, textAlign: 'center' },
  itemTextoSelecionado:    { color: cores.primaria, fontWeight: '700' },
});
