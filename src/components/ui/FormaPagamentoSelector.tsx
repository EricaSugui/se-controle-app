import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import type { FormaPagamento } from '@/src/types';

const ICONE_PADRAO = 'dots-horizontal-circle-outline';
const COR_PADRAO = '#9E9E9E';

// A maioria dos ícones vem de MaterialCommunityIcons (mesma família de
// categoria/cartão-conta), mas "pix" só existe em MaterialIcons — ver
// docs/brief-formas-pagamento-icone-cor.md no backend.
const ICONES_MATERIAL_ICONS = new Set(['pix']);

function Icone({ nome, size, color }: { nome: string; size: number; color: string }) {
  if (ICONES_MATERIAL_ICONS.has(nome)) {
    return <MaterialIcons name={nome as never} size={size} color={color} />;
  }
  return <MaterialCommunityIcons name={(nome || ICONE_PADRAO) as never} size={size} color={color} />;
}

type ItemGrid = { id: number | null; nome: string; icone: string; cor: string };

const NENHUMA: ItemGrid = { id: null, nome: 'Nenhuma', icone: ICONE_PADRAO, cor: COR_PADRAO };

type Props = {
  formas: FormaPagamento[];
  formaSelecionadaId: number | null;
  onSelect: (formaId: number | null) => void;
};

export function FormaPagamentoSelector({ formas, formaSelecionadaId, onSelect }: Props) {
  const [aberto, setAberto] = useState(false);
  const { width } = useWindowDimensions();
  const colunas = width < 360 ? 2 : 3;
  const itemLargura = colunas === 2 ? '46%' : '30%';

  const formaSelecionada = formas.find((f) => f.id === formaSelecionadaId);
  const icone = formaSelecionada?.icone || (formaSelecionadaId === null ? NENHUMA.icone : ICONE_PADRAO);
  const cor = formaSelecionada?.cor || (formaSelecionadaId === null ? NENHUMA.cor : COR_PADRAO);
  const label = formaSelecionada?.nome ?? NENHUMA.nome;

  const itens: ItemGrid[] = [NENHUMA, ...formas];

  function selecionar(id: number | null) {
    onSelect(id);
    setAberto(false);
  }

  return (
    <>
      <Pressable style={styles.chip} onPress={() => setAberto(true)}>
        <View style={[styles.circulo, { backgroundColor: cor }]}>
          <Icone nome={icone} size={18} color="#fff" />
        </View>
        <Text style={styles.chipTexto} numberOfLines={1}>{label}</Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#777" />
      </Pressable>

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAberto(false)} />

        <View style={styles.sheet}>
          <Text style={styles.titulo}>Forma de pagamento</Text>

          <ScrollView contentContainerStyle={styles.grid}>
            {itens.map((item) => {
              const selecionado = item.id === formaSelecionadaId;
              return (
                <Pressable
                  key={String(item.id)}
                  style={[styles.item, { width: itemLargura }]}
                  onPress={() => selecionar(item.id)}
                >
                  <View style={[styles.itemCirculo, { backgroundColor: item.cor || COR_PADRAO }, selecionado && styles.itemCirculoSelecionado]}>
                    <Icone nome={item.icone} size={26} color="#fff" />
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
