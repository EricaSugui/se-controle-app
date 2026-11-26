import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useHover } from '@/src/hooks/useHover';
import { cores, raio } from '@/src/theme/tokens';

// Competência × Caixa nas listas de Despesas e Receitas (mesmo visual do
// seletor do Dashboard).
export type Eixo = 'competencia' | 'caixa';

const OPCOES: { valor: Eixo; label: string }[] = [
  { valor: 'competencia', label: 'Competência' },
  { valor: 'caixa', label: 'Caixa' },
];

type Props = {
  eixo: Eixo;
  onChange: (eixo: Eixo) => void;
  dica: string; // explica o eixo escolhido, abaixo das opções
};

export function SeletorEixo({ eixo, onChange, dica }: Props) {
  return (
    <View style={styles.bloco}>
      <View style={styles.linha}>
        {OPCOES.map((o) => (
          <Opcao key={o.valor} label={o.label} ativo={eixo === o.valor} onPress={() => onChange(o.valor)} />
        ))}
      </View>
      <Text style={styles.dica}>{dica}</Text>
    </View>
  );
}

function Opcao({ label, ativo, onPress }: { label: string; ativo: boolean; onPress: () => void }) {
  const { hover, hoverProps } = useHover();
  return (
    <Pressable
      {...hoverProps}
      style={[styles.opcao, hover && !ativo && styles.opcaoHover, ativo && styles.opcaoAtiva]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
    >
      <Text style={[styles.texto, ativo && styles.textoAtivo]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bloco:      { gap: 6, alignItems: 'center' },
  linha:      { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  opcao:      { borderWidth: 1, borderColor: cores.borda, borderRadius: raio.md, paddingVertical: 6, paddingHorizontal: 14 },
  opcaoHover: { backgroundColor: cores.fundoHover },
  opcaoAtiva: { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  texto:      { fontSize: 13, color: cores.textoMedio },
  textoAtivo: { color: cores.primaria, fontWeight: '600' },
  dica:       { fontSize: 12, color: cores.textoSuave, textAlign: 'center' },
});
