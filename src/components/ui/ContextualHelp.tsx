import { StyleSheet, Text, View } from 'react-native';
import { cores } from '@/src/theme/tokens';

type Props = {
  titulo: string;
  texto: string;
};

export function ContextualHelp({ titulo, texto }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: cores.primariaSuave, borderRadius: 6, gap: 2, padding: 10 },
  titulo:    { color: cores.primaria, fontSize: 12, fontWeight: '700' },
  texto:     { color: cores.textoMedio, fontSize: 12, lineHeight: 18 },
});
