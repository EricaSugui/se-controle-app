import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import type { FormaPagamento } from '@/src/types';
import { Sheet } from '@/src/components/ui/Sheet';
import { cores, raio } from '@/src/theme/tokens';

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
          <Icone nome={icone} size={18} color={cores.textoInverso} />
        </View>
        <Text style={styles.chipTexto} numberOfLines={1}>{label}</Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color={cores.textoSuave} />
      </Pressable>

      <Sheet visivel={aberto} titulo="Forma de pagamento" onFechar={() => setAberto(false)}>
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
                  <Icone nome={item.icone} size={26} color={cores.textoInverso} />
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
