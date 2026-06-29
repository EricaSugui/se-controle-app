import { useState } from 'react';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { supabaseSignUp } from '@/src/services/supabase/auth';
import { criarPessoa, vincularConta } from '@/src/services/api/convite';

export default function CadastroScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleCadastro() {
    if (!nome.trim())        { setErro('Informe seu nome.'); return; }
    if (!email.trim())       { setErro('Informe seu e-mail.'); return; }
    if (senha.length < 6)   { setErro('A senha deve ter ao menos 6 caracteres.'); return; }
    if (senha !== confirmarSenha) { setErro('As senhas não coincidem.'); return; }

    setErro(null);
    setLoading(true);

    try {
      const result = await supabaseSignUp(email.trim(), senha, nome.trim());

      if (result.status === 'pending_confirmation') {
        router.replace({ pathname: '/(auth)/confirmacao', params: { email: email.trim() } });
        return;
      }

      const { access_token } = result.session;
      const pessoa = await criarPessoa(nome.trim(), email.trim(), access_token);
      await vincularConta(pessoa.id, access_token);
      router.replace('/(auth)/login');
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.titulo}>Criar conta</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Nome"
            value={nome}
            onChangeText={setNome}
            autoCapitalize="words"
            autoFocus
          />
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

          <Button label="Criar conta" onPress={handleCadastro} loading={loading} />
          <Button label="Já tenho conta" variant="ghost" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper:    { flex: 1 },
  container:  { flexGrow: 1, justifyContent: 'center', padding: 24 },
  titulo:     { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 24 },
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
