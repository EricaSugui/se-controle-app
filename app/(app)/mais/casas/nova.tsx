import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { createCasa, vincularPessoa } from '@/src/services/api/casas';
import { useAuth } from '@/src/context/AuthContext';
import { notificar } from '@/src/utils/confirmar';

export default function NovaCasaScreen() {
  const { user } = useAuth();
  const [nome, setNome] = useState('');
  const [salvando, setSalvando] = useState(false);

  // A tela fica montada entre navegações — sem o reset, reabrir "+ Nova
  // casa" mostraria o que foi digitado na última vez.
  useFocusEffect(
    useCallback(() => {
      setNome('');
    }, [])
  );

  async function salvar() {
    const nomeTrimmed = nome.trim();
    if (!nomeTrimmed || !user) return;

    setSalvando(true);
    try {
      const casa = await createCasa(nomeTrimmed);
      await vincularPessoa(casa.id, Number(user.id));
      router.back();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome da casa</Text>
      <TextInput
        style={styles.input}
        value={nome}
        onChangeText={setNome}
        placeholder="Ex: Minha Casa"
        autoFocus
        returnKeyType="done"
        onSubmitEditing={salvar}
      />
      <Pressable
        style={[styles.botao, (!nome.trim() || salvando) && styles.botaoDesabilitado]}
        onPress={salvar}
        disabled={!nome.trim() || salvando}
      >
        {salvando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botaoTexto}>Salvar</Text>
        }
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container:         { flex: 1, padding: 24, gap: 12 },
  label:             { fontSize: 14, color: '#555' },
  input:             { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },
});
