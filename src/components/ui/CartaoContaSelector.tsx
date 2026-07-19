import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { CartaoConta, TipoCartaoConta } from '@/src/types';

// tipo é um enum fixo de 3 valores — ao contrário de categoria, não há
// icone/cor por linha vindos do backend, então o mapeamento é local.
const ICONE_POR_TIPO: Record<TipoCartaoConta, keyof typeof MaterialCommunityIcons.glyphMap> = {
  credito: 'credit-card-outline',
  debito: 'bank-outline',
  aplicacao: 'chart-line',
};

const COR_POR_TIPO: Record<TipoCartaoConta, string> = {
  credito: '#5C6BC0',
  debito: '#42A5F5',
  aplicacao: '#66BB6A',
};

const LABEL_TIPO: Record<TipoCartaoConta, string> = {
  credito: 'Crédito',
  debito: 'Débito',
  aplicacao: 'Aplicação',
};

type Props = {
  contas: CartaoConta[];
  contaSelecionadaId: number | null;
  onSelect: (contaId: number | null) => void;
  nenhumLabel?: string;
};

export function CartaoContaSelector({ contas, contaSelecionadaId, onSelect, nenhumLabel = 'Nenhum' }: Props) {
  const [aberto, setAberto] = useState(false);

  const contaSelecionada = contas.find((c) => c.id === contaSelecionadaId);
  const icone = contaSelecionada ? ICONE_POR_TIPO[contaSelecionada.tipo] : 'circle-off-outline';
  const cor = contaSelecionada ? COR_POR_TIPO[contaSelecionada.tipo] : '#9E9E9E';
  const label = contaSelecionada?.nome ?? nenhumLabel;

  function selecionar(id: number | null) {
    onSelect(id);
    setAberto(false);
  }

  return (
    <>
      <Pressable style={styles.chip} onPress={() => setAberto(true)}>
        <View style={[styles.circulo, { backgroundColor: cor }]}>
          <MaterialCommunityIcons name={icone} size={18} color="#fff" />
        </View>
        <Text style={styles.chipTexto} numberOfLines={1}>{label}</Text>
        <MaterialCommunityIcons name="chevron-down" size={20} color="#777" />
      </Pressable>

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAberto(false)} />

        <View style={styles.sheet}>
          <Text style={styles.titulo}>Cartão/conta</Text>

          <ScrollView contentContainerStyle={styles.lista}>
            <Pressable style={styles.item} onPress={() => selecionar(null)}>
              <View style={[styles.itemCirculo, { backgroundColor: '#9E9E9E' }]}>
                <MaterialCommunityIcons name="circle-off-outline" size={22} color="#fff" />
              </View>
              <Text style={[styles.itemTexto, contaSelecionadaId === null && styles.itemTextoSelecionado]}>
                {nenhumLabel}
              </Text>
            </Pressable>

            {contas.map((conta) => {
              const selecionado = conta.id === contaSelecionadaId;
              return (
                <Pressable key={conta.id} style={styles.item} onPress={() => selecionar(conta.id)}>
                  <View style={[styles.itemCirculo, { backgroundColor: COR_POR_TIPO[conta.tipo] }]}>
                    <MaterialCommunityIcons name={ICONE_POR_TIPO[conta.tipo]} size={22} color="#fff" />
                  </View>
                  <View style={styles.itemTextos}>
                    <Text style={[styles.itemTexto, selecionado && styles.itemTextoSelecionado]}>
                      {conta.nome}
                    </Text>
                    <Text style={styles.itemSubtexto}>{LABEL_TIPO[conta.tipo]}</Text>
                  </View>
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

  lista: { gap: 4, paddingBottom: 8 },
  item:                    { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44, paddingVertical: 6 },
  itemCirculo:             { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  itemTextos:              { flex: 1 },
  itemTexto:               { fontSize: 15, color: '#333' },
  itemTextoSelecionado:    { color: '#6200ee', fontWeight: '700' },
  itemSubtexto:            { fontSize: 12, color: '#888' },
});
