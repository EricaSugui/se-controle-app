import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function MaisScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mais</Text>
      <Link href="/(app)/mais/receitas">Receitas</Link>
      <Link href="/(app)/mais/relatorios">Relatórios</Link>
      <Link href="/(app)/mais/casas">Gerenciar casas</Link>
      <Link href="/(app)/mais/convidar">Convidar amigos</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
});
