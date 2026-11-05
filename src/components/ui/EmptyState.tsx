import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { cores } from '@/src/theme/tokens';

type Props = {
  titulo: string;
  descricao: string;
  acaoLabel: string;
  onAcao: () => void;
};

export function EmptyState({ titulo, descricao, acaoLabel, onAcao }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.descricao}>{descricao}</Text>
      <Button label={acaoLabel} onPress={onAcao} />
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { alignItems: 'center', gap: 12, padding: 24 },
  titulo:     { color: cores.textoForte, fontSize: 18, fontWeight: '600', textAlign: 'center' },
  descricao:  { color: cores.textoSuave, fontSize: 14, lineHeight: 20, textAlign: 'center' },
});
