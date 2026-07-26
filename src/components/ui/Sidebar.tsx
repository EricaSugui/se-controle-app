import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link, useSegments } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/context/AuthContext';
import { ABAS, type Aba } from '@/src/navigation/abas';
import { cores, raio } from '@/src/theme/tokens';
import { useHover } from '@/src/hooks/useHover';

export const LARGURA_SIDEBAR = 240;

// Navegação lateral do desktop. Substitui a barra de abas de baixo (que fica
// escondida em telas amplas) — mesmas rotas, só a moldura muda.
export function Sidebar() {
  const { user } = useAuth();
  const segmentos = useSegments() as string[];
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.sidebar, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.marca}>
        <Text style={styles.marcaTexto}>Se Controle</Text>
        {user && <Text style={styles.usuario} numberOfLines={1}>{user.nome}</Text>}
      </View>

      <View style={styles.nav}>
        {ABAS.map((aba) => (
          <ItemNav key={aba.nome} aba={aba} ativo={segmentos.includes(aba.segmento)} />
        ))}
      </View>
    </View>
  );
}

function ItemNav({ aba, ativo }: { aba: Aba; ativo: boolean }) {
  const { hover, hoverProps } = useHover();

  return (
    // `asChild` faz o Link virar um <a href> de verdade no web — abrir em nova
    // aba com ctrl+clique continua funcionando.
    <Link href={aba.href} asChild>
      <Pressable
        // Achatado: o <Slot> do Link não aceita array de estilos no filho.
        style={StyleSheet.flatten([
          styles.item,
          hover && !ativo && styles.itemHover,
          ativo && styles.itemAtivo,
        ])}
        {...hoverProps}
        accessibilityRole="link"
        accessibilityState={{ selected: ativo }}
      >
        <Ionicons name={aba.icone} size={20} color={ativo ? cores.primaria : cores.textoMedio} />
        <Text style={[styles.itemTexto, ativo && styles.itemTextoAtivo]}>{aba.titulo}</Text>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  sidebar:        { width: LARGURA_SIDEBAR, backgroundColor: cores.fundoElevado, borderRightWidth: 1, borderRightColor: cores.bordaSuave, paddingHorizontal: 12, gap: 24 },

  marca:          { paddingHorizontal: 8, gap: 2 },
  marcaTexto:     { fontSize: 18, fontWeight: 'bold', color: cores.primaria },
  usuario:        { fontSize: 12, color: cores.textoSuave },

  nav:            { gap: 4 },
  item:           { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderRadius: raio.md },
  itemHover:      { backgroundColor: cores.fundoHover },
  itemAtivo:      { backgroundColor: cores.primariaSuave },
  itemTexto:      { fontSize: 14, color: cores.textoMedio },
  itemTextoAtivo: { color: cores.primaria, fontWeight: '600' },
});
