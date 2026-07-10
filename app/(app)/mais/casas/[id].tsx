import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { getMembros, convidarMembro, removerMembro } from '@/src/services/api/casas';
import { useAuth } from '@/src/context/AuthContext';
import { confirmar, notificar } from '@/src/utils/confirmar';
import type { MembroCasa } from '@/src/types';

const PAPEIS: { valor: 'membro' | 'admin'; label: string }[] = [
  { valor: 'membro', label: 'Membro' },
  { valor: 'admin', label: 'Admin' },
];

export default function CasaDetalhesScreen() {
  const { id, nome } = useLocalSearchParams<{ id: string; nome: string }>();
  const navigation = useNavigation();
  const { user } = useAuth();

  const [membros, setMembros] = useState<MembroCasa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [papel, setPapel] = useState<'membro' | 'admin'>('membro');
  const [convidando, setConvidando] = useState(false);

  const casaId = Number(id);

  const carregar = useCallback(() => {
    if (!casaId) return;
    setLoading(true);
    setError(null);
    getMembros(casaId)
      .then(setMembros)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [casaId]);

  useFocusEffect(carregar);

  // Atualiza o título do header com o nome da casa
  useFocusEffect(
    useCallback(() => {
      if (nome) navigation.setOptions({ title: nome });
    }, [nome, navigation])
  );

  const souAdmin = membros.some((m) => m.pessoa_id === Number(user?.id) && m.papel === 'admin');

  function confirmarRemover(membro: MembroCasa) {
    confirmar(
      { titulo: 'Remover membro', mensagem: `Deseja remover "${membro.nome}" desta casa?`, textoConfirmar: 'Remover' },
      () => remover(membro)
    );
  }

  async function remover(membro: MembroCasa) {
    try {
      await removerMembro(casaId, membro.pessoa_id);
      carregar();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    }
  }

  async function convidar() {
    const emailTrimmed = email.trim().toLowerCase();
    if (!emailTrimmed) return;

    setConvidando(true);
    try {
      await convidarMembro(casaId, emailTrimmed, papel);
      setEmail('');
      notificar('Convite enviado', `Um convite foi enviado para ${emailTrimmed}.`);
      carregar();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setConvidando(false);
    }
  }

  function labelPapel(p: string) {
    return p === 'admin' ? 'Admin' : 'Membro';
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.secaoTitulo}>Membros</Text>

        {loading ? (
          <ActivityIndicator style={styles.loader} />
        ) : error ? (
          <View style={styles.erroContainer}>
            <Text style={styles.erro}>{error}</Text>
            <Pressable onPress={carregar}>
              <Text style={styles.retryTexto}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : membros.length === 0 ? (
          <Text style={styles.vazio}>Nenhum membro encontrado.</Text>
        ) : (
          membros.map((item) => (
            <View key={String(item.id)} style={styles.membroItem}>
              <View>
                <Text style={styles.membroNome}>{item.nome}</Text>
                <Text style={styles.membroEmail}>{item.email}</Text>
              </View>
              <View style={styles.membroAcoes}>
                <View style={[styles.badge, item.papel === 'admin' ? styles.badgeAdmin : styles.badgeMembro]}>
                  <Text style={styles.badgeTexto}>{labelPapel(item.papel)}</Text>
                </View>
                {souAdmin && item.pessoa_id !== Number(user?.id) && (
                  <Pressable onPress={() => confirmarRemover(item)}>
                    <Text style={styles.remover}>Remover</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))
        )}

        <View style={styles.divider} />

        <Text style={styles.secaoTitulo}>Convidar pessoa</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="E-mail do convidado"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.papelContainer}>
            {PAPEIS.map((p) => (
              <Pressable
                key={p.valor}
                style={[styles.papelOpcao, papel === p.valor && styles.papelOpcaoAtiva]}
                onPress={() => setPapel(p.valor)}
              >
                <Text style={[styles.papelTexto, papel === p.valor && styles.papelTextoAtivo]}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.botao, (!email.trim() || convidando) && styles.botaoDesabilitado]}
            onPress={convidar}
            disabled={!email.trim() || convidando}
          >
            {convidando
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.botaoTexto}>Enviar convite</Text>
            }
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:        { padding: 16 },
  secaoTitulo:      { fontSize: 14, fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  loader:           { marginVertical: 20 },

  erroContainer:    { alignItems: 'center', gap: 8, marginVertical: 16 },
  erro:             { color: '#c62828', textAlign: 'center' },
  retryTexto:       { color: '#1565c0' },

  lista:            { maxHeight: 280 },
  vazio:            { color: '#888', textAlign: 'center', marginVertical: 16 },

  membroItem:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, marginBottom: 6 },
  membroNome:       { fontSize: 14, fontWeight: '500' },
  membroEmail:      { fontSize: 12, color: '#666', marginTop: 2 },

  membroAcoes:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge:            { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeAdmin:       { backgroundColor: '#1565c0' },
  badgeMembro:      { backgroundColor: '#757575' },
  badgeTexto:       { color: '#fff', fontSize: 12, fontWeight: '600' },
  remover:          { color: '#c62828', fontSize: 13 },

  divider:          { height: 1, backgroundColor: '#e0e0e0', marginVertical: 16 },

  form:             { gap: 10 },
  input:            { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },

  papelContainer:   { flexDirection: 'row', gap: 8 },
  papelOpcao:       { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, alignItems: 'center' },
  papelOpcaoAtiva:  { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  papelTexto:       { fontSize: 14, color: '#555' },
  papelTextoAtivo:  { color: '#1565c0', fontWeight: '600' },

  botao:            { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center' },
  botaoDesabilitado:{ opacity: 0.5 },
  botaoTexto:       { color: '#fff', fontWeight: '600', fontSize: 15 },
});
