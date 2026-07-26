import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useBreakpoint } from '@/src/hooks/useBreakpoint';
import { cores, raio } from '@/src/theme/tokens';

type Props = {
  visivel: boolean;
  titulo: string;
  onFechar: () => void;
  children: React.ReactNode;
};

// Casca de seleção compartilhada pelos selectors de categoria, forma de
// pagamento e cartão/conta.
//
// No celular é bottom sheet: sobe do rodapé, ao alcance do polegar. No
// desktop vira card centralizado — uma folha de 1200px subindo do pé da
// tela não corresponde a nada, e o alvo do mouse não tem nada a ver com
// onde o polegar alcança.
export function Sheet({ visivel, titulo, onFechar, children }: Props) {
  const { compacto } = useBreakpoint();

  return (
    <Modal
      visible={visivel}
      transparent
      animationType={compacto ? 'slide' : 'fade'}
      onRequestClose={onFechar}
    >
      <Pressable style={styles.backdrop} onPress={onFechar} />

      <View style={compacto ? styles.folha : styles.card}>
        <Text style={styles.titulo}>{titulo}</Text>
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: cores.overlay },

  folha: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '70%',
    backgroundColor: cores.fundo,
    borderTopLeftRadius: raio.lg,
    borderTopRightRadius: raio.lg,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  card: {
    position: 'absolute',
    alignSelf: 'center',
    top: '12%',
    width: 520,
    maxHeight: '70%',
    backgroundColor: cores.fundo,
    borderRadius: raio.lg,
    padding: 20,
  },

  titulo: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
});
