import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { convidarPessoa } from '@/src/services/api/convite';
import { useAuth } from '@/src/context/AuthContext';

export default function ConvidarAmigoScreen() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function convidar() {
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed || !user) return;

    setEnviando(true);
    try {
      await convidarPessoa(emailTrimmed, Number(user.id));
      setEmail('');
      Alert.alert('Convite enviado', `Um convite foi enviado para ${emailTrimmed}.`);
    } catch (e: unknown) {
      Alert.alert('Erro', (e as Error).message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.titulo}>Convide seus amigos</Text>
      <Text style={styles.descricao}>Convide seus amigos para conhecer o app Se Controle!</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail do seu amigo"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Pressable
        style={[styles.botao, (!email.trim() || enviando) && styles.botaoDesabilitado]}
        onPress={convidar}
        disabled={!email.trim() || enviando}
      >
        {enviando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botaoTexto}>Enviar convite</Text>
        }
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, padding: 24, justifyContent: 'center', gap: 12 },
  titulo:           { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  descricao:        { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 12 },
  input:            { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  botao:            { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center' },
  botaoDesabilitado:{ opacity: 0.5 },
  botaoTexto:       { color: '#fff', fontWeight: '600', fontSize: 15 },
});
