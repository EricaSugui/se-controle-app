import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleLogin() {
    if (!email || !password) {
      setErro('Preencha e-mail e senha.');
      return;
    }

    setErro(null);
    setLoading(true);

    try {
      await signIn(email, password);
      router.replace('/(app)/dashboard');
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.titulo}>Se Controle</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />

        {erro && <Text style={styles.erro}>{erro}</Text>}

        <Button label="Entrar" onPress={handleLogin} loading={loading} />

        <Link href="/(auth)/cadastro" asChild>
          <Button label="Criar conta" variant="outline" />
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  titulo:    { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 },
  form:      { gap: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  erro: { color: '#c62828', fontSize: 14, textAlign: 'center' },
});
