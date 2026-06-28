import { Button } from '@/src/components/ui/Button';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  // const handleLogin: any = () => {
  //   console.log("logado")
  // }
  // const goToCadastro: any = ()=>{
  //   console.log("cadastrar")
  // }
  return (
    <View style={styles.container}>
      <Text>Login</Text>
      <Link href="/(app)/dashboard" asChild>
        <Button label="Entrar" variant="primary" />
      </Link>
      <Link href="/(auth)/cadastro" asChild>
        <Button label="Criar conta" variant="outline" />
      </Link>
      {/* <Button label="Salvando..." loading /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
