import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { getDashboard } from '@/src/services/api/dashboard';
import { atualizarVisibilidade, criarVisibilidade, getVisibilidade } from '@/src/services/api/cartaoCasaVisibilidade';
import { notificar } from '@/src/utils/confirmar';
import { competenciaAtual } from '@/src/utils/competencia';
import type { CartaoCasaVisibilidade, CasaDashboard } from '@/src/types';

type CampoVisibilidade = 'compartilhado' | 'compartilha_saldo';

export default function VisibilidadeCartaoContaScreen() {
  const { cartaoId, nome } = useLocalSearchParams<{ cartaoId: string; nome: string }>();
  const navigation = useNavigation();
  const id = Number(cartaoId);

  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [entradas, setEntradas] = useState<CartaoCasaVisibilidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [atualizando, setAtualizando] = useState<{ casaId: number; campo: CampoVisibilidade } | null>(null);

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

  async function alternar(casa: CasaDashboard, campo: CampoVisibilidade) {
    const entrada = entradas.find((e) => e.casa_id === casa.id);
    setAtualizando({ casaId: casa.id, campo });
    try {
      if (entrada) {
        // PATCH parcial: o campo omitido mantém o valor atual no backend.
        const valorAtual = campo === 'compartilhado' ? entrada.compartilhado : entrada.compartilha_saldo;
        const atualizada = await atualizarVisibilidade(id, casa.id, { [campo]: !valorAtual });
        setEntradas((prev) => prev.map((e) => (e.casa_id === casa.id ? atualizada : e)));
      } else {
        const criada = await criarVisibilidade(id, {
          casa_id: casa.id,
          compartilhado: campo === 'compartilhado',
          compartilha_saldo: campo === 'compartilha_saldo',
        });
        setEntradas((prev) => [...prev, criada]);
      }
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setAtualizando(null);
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
        Escolha, por casa, o que os outros membros veem deste cartão/conta: os lançamentos e o
        saldo. O saldo só entra na projeção dos membros quando os dois estão ativados.
      </Text>

      {casas.length === 0 && (
        <Text style={styles.vazio}>Você ainda não faz parte de nenhuma casa.</Text>
      )}

      {casas.map((casa) => {
        const entrada = entradas.find((e) => e.casa_id === casa.id);
        const compartilhado = entrada?.compartilhado ?? false;
        const compartilhaSaldo = entrada?.compartilha_saldo ?? false;

        const toggle = (campo: CampoVisibilidade, ativo: boolean, labelAtivo: string, labelInativo: string) => {
          const emVoo = atualizando?.casaId === casa.id && atualizando.campo === campo;
          return (
            <Pressable
              style={[styles.opcao, ativo && styles.opcaoAtiva]}
              onPress={() => alternar(casa, campo)}
              disabled={atualizando != null}
            >
              {emVoo ? (
                <ActivityIndicator size="small" color={ativo ? '#1565c0' : '#555'} />
              ) : (
                <Text style={[styles.opcaoTexto, ativo && styles.opcaoTextoAtivo]}>
                  {ativo ? labelAtivo : labelInativo}
                </Text>
              )}
            </Pressable>
          );
        };

        return (
          <View key={casa.id} style={styles.linha}>
            <Text style={styles.casaNome}>{casa.nome}</Text>
            <View style={styles.toggles}>
              {toggle('compartilhado', compartilhado, 'Compartilhado', 'Privado')}
              {toggle('compartilha_saldo', compartilhaSaldo, 'Saldo visível', 'Saldo oculto')}
            </View>
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

  linha:           { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 14, gap: 10 },
  casaNome:        { fontSize: 15, fontWeight: '500' },
  toggles:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  opcao:           { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, minWidth: 110, alignItems: 'center' },
  opcaoAtiva:      { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  opcaoTexto:      { fontSize: 13, color: '#555' },
  opcaoTextoAtivo: { color: '#1565c0', fontWeight: '600' },

  erro:            { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:           { padding: 10 },
  retryTexto:      { color: '#1565c0' },
});
