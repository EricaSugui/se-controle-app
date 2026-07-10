import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { getDashboard } from '@/src/services/api/dashboard';
import { atualizarVisibilidade, criarVisibilidade, getVisibilidade } from '@/src/services/api/cartaoCasaVisibilidade';
import { notificar } from '@/src/utils/confirmar';
import type { CartaoCasaVisibilidade, CasaDashboard } from '@/src/types';

function competenciaAtual(): string {
  const now = new Date();
  const mes = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const ano = String(now.getFullYear()).slice(-2);
  return `${mes}-${ano}`;
}

export default function VisibilidadeCartaoContaScreen() {
  const { cartaoId, nome } = useLocalSearchParams<{ cartaoId: string; nome: string }>();
  const navigation = useNavigation();
  const id = Number(cartaoId);

  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [entradas, setEntradas] = useState<CartaoCasaVisibilidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atualizandoCasaId, setAtualizandoCasaId] = useState<number | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getDashboard(competenciaAtual()).then((d) => d.casas),
      getVisibilidade(id),
    ])
      .then(([casasResp, entradasResp]) => {
        setCasas(casasResp);
        setEntradas(entradasResp);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(carregar);

  useFocusEffect(
    useCallback(() => {
      if (nome) navigation.setOptions({ title: `Compartilhar — ${nome}` });
    }, [nome, navigation])
  );

  async function alternar(casa: CasaDashboard) {
    const entrada = entradas.find((e) => e.casa_id === casa.id);
    setAtualizandoCasaId(casa.id);
    try {
      if (entrada) {
        const atualizada = await atualizarVisibilidade(id, casa.id, !entrada.compartilhado);
        setEntradas((prev) => prev.map((e) => (e.casa_id === casa.id ? atualizada : e)));
      } else {
        const criada = await criarVisibilidade(id, { casa_id: casa.id, compartilhado: true });
        setEntradas((prev) => [...prev, criada]);
      }
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setAtualizandoCasaId(null);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.erro}>{error}</Text>
        <Pressable onPress={carregar} style={styles.retry}>
          <Text style={styles.retryTexto}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.explicacao}>
        Escolha em quais casas este cartão/conta fica visível para os outros membros.
      </Text>

      {casas.length === 0 && (
        <Text style={styles.vazio}>Você ainda não faz parte de nenhuma casa.</Text>
      )}

      {casas.map((casa) => {
        const entrada = entradas.find((e) => e.casa_id === casa.id);
        const compartilhado = entrada?.compartilhado ?? false;
        const atualizando = atualizandoCasaId === casa.id;

        return (
          <View key={casa.id} style={styles.linha}>
            <Text style={styles.casaNome}>{casa.nome}</Text>
            <Pressable
              style={[styles.opcao, compartilhado && styles.opcaoAtiva]}
              onPress={() => alternar(casa)}
              disabled={atualizando}
            >
              {atualizando ? (
                <ActivityIndicator size="small" color={compartilhado ? '#1565c0' : '#555'} />
              ) : (
                <Text style={[styles.opcaoTexto, compartilhado && styles.opcaoTextoAtivo]}>
                  {compartilhado ? 'Compartilhado' : 'Privado'}
                </Text>
              )}
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:       { padding: 16, gap: 12 },
  explicacao:      { fontSize: 13, color: '#666', marginBottom: 4 },
  vazio:           { textAlign: 'center', color: '#888', marginTop: 32 },

  linha:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 14 },
  casaNome:        { fontSize: 15, fontWeight: '500', flex: 1 },

  opcao:           { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, minWidth: 110, alignItems: 'center' },
  opcaoAtiva:      { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  opcaoTexto:      { fontSize: 13, color: '#555' },
  opcaoTextoAtivo: { color: '#1565c0', fontWeight: '600' },

  erro:            { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:           { padding: 10 },
  retryTexto:      { color: '#1565c0' },
});
