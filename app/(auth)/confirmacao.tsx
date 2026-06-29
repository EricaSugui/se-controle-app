import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { criarPessoa, vincularConta } from '@/src/services/api/convite';
import { Button } from '@/src/components/ui/Button';

function dadosDoToken(token: string): { email: string; nome: string } {
  try {
    const payload = token.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { email, user_metadata } = JSON.parse(decoded) as {
      email?: string;
      user_metadata?: { nome?: string };
    };
    return { email: email ?? '', nome: user_metadata?.nome ?? '' };
  } catch {
    return { email: '', nome: '' };
  }
}

export default function ConfirmacaoScreen() {
  const { token, email } = useLocalSearchParams<{ token?: string; email?: string }>();
  const router = useRouter();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    const { email: emailToken, nome } = dadosDoToken(token);

    criarPessoa(nome, emailToken, token)
      .then((pessoa) => vincularConta(pessoa.id, token))
      .then(() => router.replace('/(auth)/login'))
      .catch((e: unknown) => setErro(e instanceof Error ? e.message : 'Erro ao confirmar conta.'));
  }, [token]);

  // Aguardando confirmação por e-mail
  if (!token) {
    return (
      <View style={styles.container}>
        <Text style={styles.titulo}>Confirme seu e-mail</Text>
        <Text style={styles.descricao}>
          Enviamos um link de confirmação para{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>
        <Text style={styles.dica}>Clique no link do e-mail para ativar sua conta.</Text>
        <Button label="Voltar ao login" variant="outline" onPress={() => router.replace('/(auth)/login')} />
      </View>
    );
  }

  // Processando o token do link
  if (erro) {
    return (
      <View style={styles.container}>
        <Text style={styles.erro}>{erro}</Text>
        <Button label="Voltar ao login" variant="outline" onPress={() => router.replace('/(auth)/login')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.dica}>Ativando sua conta...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  titulo:     { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  descricao:  { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 24 },
  email:      { fontWeight: '600', color: '#333' },
  dica:       { fontSize: 13, color: '#888', textAlign: 'center' },
  erro:       { color: '#c62828', textAlign: 'center' },
});
