import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from '@/src/components/ui/Button';
import { aceitarConvite } from '@/src/services/api/convite';
import { supabaseUpdatePassword } from '@/src/services/supabase/auth';

type ConviteContexto = {
  email: string;
  casaNome?: string;
  papel?: string;
  convidadoPorNome?: string;
};

function parseHash(hash: string): Record<string, string> {
  return Object.fromEntries(
    hash.replace(/^#/, '').split('&').filter(Boolean).map((p) => {
      const [k, ...v] = p.split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
}

function contextoDoAccessToken(accessToken: string): ConviteContexto {
  try {
    const payload = accessToken.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { email, user_metadata } = JSON.parse(decoded) as {
      email?: string;
      user_metadata?: { casa_nome?: string; papel?: string; convidado_por_nome?: string };
    };
    return {
      email: email ?? '',
      casaNome: user_metadata?.casa_nome,
      papel: user_metadata?.papel,
      convidadoPorNome: user_metadata?.convidado_por_nome,
    };
  } catch {
    return { email: '' };
  }
}

export default function ConvidadoScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [hashChecado, setHashChecado] = useState(false);

  useEffect(() => {
    console.log('[convidado] href:', Platform.OS === 'web' ? window.location.href : '(não é web)');
    console.log('[convidado] token (query):', token);

    if (Platform.OS !== 'web') { setHashChecado(true); return; }
    const params = parseHash(window.location.hash);
    console.log('[convidado] hash parseado:', params);

    setAccessToken(params.access_token ?? null);
    setHashChecado(true);
  }, []);

  const contexto = accessToken ? contextoDoAccessToken(accessToken) : null;
  console.log('[convidado] contexto extraído do access_token:', contexto);

  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleConfirmar() {
    if (!nome.trim()) { setErro('Informe seu nome.'); return; }
    if (senha.length < 6) { setErro('A senha deve ter ao menos 6 caracteres.'); return; }
    if (senha !== confirmarSenha) { setErro('As senhas não coincidem.'); return; }
    if (!token || !accessToken) { setErro('Link de convite inválido.'); return; }

    setErro(null);
    setLoading(true);

    try {
      await supabaseUpdatePassword(senha, accessToken);
      await aceitarConvite(token, nome.trim(), accessToken);
      router.replace('/(auth)/login');
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : 'Erro ao confirmar conta.');
    } finally {
      setLoading(false);
    }
  }

  if (!hashChecado) return null;

  if (!token || !accessToken) {
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
      <Text style={styles.emailTexto}>{contexto?.email}</Text>

      {(contexto?.casaNome || contexto?.convidadoPorNome) && (
        <View style={styles.card}>
          <Text style={styles.cardTexto}>
            {contexto.convidadoPorNome ? `${contexto.convidadoPorNome} te convidou` : 'Você foi convidado'}
            {contexto.casaNome ? ` para fazer parte de "${contexto.casaNome}"` : ''}
            {contexto.papel ? ` como ${contexto.papel}` : ''}.
          </Text>
        </View>
      )}

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
  emailTexto: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
  card:       { backgroundColor: '#e3f2fd', borderRadius: 8, padding: 14, marginBottom: 16 },
  cardTexto:  { color: '#1565c0', fontSize: 14, textAlign: 'center' },
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
