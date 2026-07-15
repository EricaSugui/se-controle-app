import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';

export default function MaisScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mais</Text>
      <Link href="/(app)/mais/receitas">Receitas</Link>
      <Link href="/(app)/mais/cartoes-contas">Cartões e contas</Link>
      <Link href="/(app)/mais/despesas-fixas">Despesas fixas</Link>
      <Link href="/(app)/mais/receitas-fixas">Receitas fixas</Link>
      <Link href="/(app)/mais/relatorios">Relatórios</Link>
      <Link href="/(app)/mais/casas">Gerenciar casas</Link>
      <Link href="/(app)/mais/convidar">Convidar amigos</Link>
      <Link href="/(app)/mais/perfil">Perfil</Link>
      {user?.admin_sistema && <Link href="/(app)/mais/administracao">Administração</Link>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
});
