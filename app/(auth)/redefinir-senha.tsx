import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { supabaseUpdatePassword } from '@/src/services/supabase/auth';

export default function RedefinirSenhaScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  async function handleSalvar() {
    if (!token) {
      setErro('O link de recuperação é inválido ou está incompleto. Solicite um novo e-mail.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha deve ter ao menos 6 caracteres.');
      return;
    }
    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }

    setErro(null);
    setLoading(true);
    try {
      await supabaseUpdatePassword(senha, token);
      setSucesso(true);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Não foi possível atualizar a senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Definir nova senha</Text>
      {sucesso ? (
        <>
          <Text style={styles.descricao}>Sua senha foi atualizada. Agora você já pode entrar com a nova senha.</Text>
          <Button label="Ir para o login" onPress={() => router.replace('/(auth)/login')} />
        </>
      ) : (
        <>
          <Text style={styles.descricao}>Escolha uma nova senha para sua conta.</Text>
          <TextInput
            style={styles.input}
            placeholder="Nova senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            autoComplete="new-password"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirmar nova senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
            autoComplete="new-password"
          />
          {erro && <Text style={styles.erro}>{erro}</Text>}
          <Button label="Salvar nova senha" onPress={handleSalvar} loading={loading} />
          <Button label="Voltar ao login" variant="ghost" onPress={() => router.replace('/(auth)/login')} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 16, maxWidth: 480, width: '100%', alignSelf: 'center' },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' },
  descricao: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 22 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  erro: { color: '#c62828', fontSize: 14, textAlign: 'center' },
});
