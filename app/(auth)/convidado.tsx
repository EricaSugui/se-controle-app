import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { criarPessoa, vincularConta } from '@/src/services/api/convite';
import { supabaseUpdatePassword } from '@/src/services/supabase/auth';

function emailDoToken(token: string): string {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return (JSON.parse(decoded) as { email?: string }).email ?? '';
  } catch {
    return '';
  }
}

export default function ConvidadoScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();

  const email = token ? emailDoToken(token) : '';

  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleConfirmar() {
    if (!nome.trim()) { setErro('Informe seu nome.'); return; }
    if (senha.length < 6) { setErro('A senha deve ter ao menos 6 caracteres.'); return; }
    if (senha !== confirmarSenha) { setErro('As senhas não coincidem.'); return; }
    if (!token) { setErro('Link de convite inválido.'); return; }

    setErro(null);
    setLoading(true);

    try {
      await supabaseUpdatePassword(senha, token);
      const pessoa = await criarPessoa(nome.trim(), email, token);
      await vincularConta(pessoa.id, token);
      router.replace('/(auth)/login');
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao confirmar conta.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.erro}>Link de convite inválido ou expirado.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.titulo}>Criar sua conta</Text>
      <Text style={styles.emailTexto}>{email}</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Seu nome"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
          autoFocus
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          autoComplete="new-password"
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
          autoComplete="new-password"
        />

        {erro && <Text style={styles.erro}>{erro}</Text>}

        <Button label="Confirmar conta" onPress={handleConfirmar} loading={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, justifyContent: 'center', padding: 24 },
  titulo:     { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  emailTexto: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  form:       { gap: 12 },
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
