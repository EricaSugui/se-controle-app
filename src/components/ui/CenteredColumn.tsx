import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

// Limites de largura do conteúdo. Sem isso, tudo estica até a borda do
// monitor — um campo de senha de 2500px é o caso extremo, mas listas e
// dashboards também ficam ilegíveis muito além disso.
export const LARGURA_MAX = {
  /** Listas, dashboard, telas de dados — a coluna ao lado da sidebar. */
  conteudo: 1200,
  /** Formulários curtos (login, cadastro). Campo largo demais atrapalha ler. */
  formulario: 420,
} as const;

type Props = {
  children: React.ReactNode;
  largura?: number;
  /** Aplicado à coluna interna — é onde padding e alinhamento fazem sentido. */
  style?: StyleProp<ViewStyle>;
};

export function CenteredColumn({ children, largura = LARGURA_MAX.conteudo, style }: Props) {
  return (
    <View style={styles.area}>
      <View style={[styles.coluna, { maxWidth: largura }, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Abaixo do limite isto é no-op: a coluna tem width 100% e ocupa tudo.
  area:   { flex: 1, alignItems: 'center' },
  coluna: { flex: 1, width: '100%' },
});
