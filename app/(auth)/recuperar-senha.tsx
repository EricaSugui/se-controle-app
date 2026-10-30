import { useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { supabaseRecoverPassword } from '@/src/services/supabase/auth';

export default function RecuperarSenhaScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function handleEnviar() {
    if (!email.trim()) {
      setErro('Informe seu e-mail.');
      return;
    }
    setErro(null);
    setLoading(true);
    try {
      await supabaseRecoverPassword(email.trim());
      setEnviado(true);
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Não foi possível solicitar a recuperação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Recuperar senha</Text>
      {enviado ? (
        <>
          <Text style={styles.descricao}>
            Se houver uma conta associada a esse e-mail, você receberá uma mensagem com as instruções para criar uma nova senha.
          </Text>
          <Button label="Voltar ao login" onPress={() => router.replace('/(auth)/login')} />
        </>
      ) : (
        <>
          <Text style={styles.descricao}>
            Informe o e-mail cadastrado. Enviaremos um link para você definir uma nova senha.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          {erro && <Text style={styles.erro}>{erro}</Text>}
          <Button label="Enviar link" onPress={handleEnviar} loading={loading} />
          <Button label="Voltar" variant="ghost" onPress={() => router.back()} />
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
