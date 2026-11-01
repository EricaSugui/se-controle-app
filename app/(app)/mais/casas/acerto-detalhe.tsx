import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { baixarArquivoAcerto, obterAcerto } from '@/src/services/api/acerto';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import { notificar } from '@/src/utils/confirmar';
import { salvarArquivoRelatorio } from '@/src/utils/arquivoRelatorio';
import type { AcertoRelatorio } from '@/src/types';

function rotuloEvento(tipo: AcertoRelatorio['eventos'][number]['tipo']): string {
  const rotulos = {
    confirmado: 'Relatório confirmado',
    pdf_gerado: 'PDF gerado',
    csv_gerado: 'CSV gerado',
    pdf_erro: 'Falha ao gerar PDF',
    csv_erro: 'Falha ao gerar CSV',
    compartilhado: 'Relatório compartilhado',
  };
  return rotulos[tipo];
}

export default function AcertoDetalheScreen() {
  const { id, acertoId, nome } = useLocalSearchParams<{ id: string; acertoId: string; nome?: string }>();
  const navigation = useNavigation();
  const [acerto, setAcerto] = useState<AcertoRelatorio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [baixando, setBaixando] = useState<'pdf' | 'csv' | null>(null);

  const carregar = useCallback(() => {
    setError(null);
    obterAcerto(Number(id), Number(acertoId))
      .then(setAcerto)
      .catch((e: Error) => setError(e.message));
  }, [id, acertoId]);

  useFocusEffect(carregar);
  useFocusEffect(useCallback(() => {
    navigation.setOptions({ title: `Relatório — ${nome ?? 'Acerto'}` });
  }, [navigation, nome]));

  async function baixar(formato: 'pdf' | 'csv') {
    if (baixando) return;
    setBaixando(formato);
    try {
      const arquivo = await baixarArquivoAcerto(Number(id), Number(acertoId), formato);
      await salvarArquivoRelatorio(
        arquivo,
        formato,
        formato === 'pdf' ? 'application/pdf' : 'text/csv',
      );
      notificar('Arquivo pronto', `${formato.toUpperCase()} salvo ou compartilhado com sucesso.`);
    } catch (e: unknown) {
      notificar('Não foi possível gerar o arquivo', (e as Error).message);
    } finally {
      setBaixando(null);
    }
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable onPress={carregar} style={styles.retry}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }
  if (!acerto) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Acerto de {formatDate(acerto.confirmado_em)}</Text>
      <Text style={styles.subtitle}>{acerto.nome_casa} · {acerto.moeda} · Confirmado</Text>
      <View style={styles.arquivos}>
        <Pressable
          style={[styles.arquivoBotao, baixando === 'pdf' && styles.disabled]}
          onPress={() => baixar('pdf')}
          disabled={baixando !== null}
        >
          <Text style={styles.arquivoTexto}>{baixando === 'pdf' ? 'Gerando PDF...' : 'Baixar PDF'}</Text>
        </Pressable>
        <Pressable
          style={[styles.arquivoBotao, baixando === 'csv' && styles.disabled]}
          onPress={() => baixar('csv')}
          disabled={baixando !== null}
        >
          <Text style={styles.arquivoTexto}>{baixando === 'csv' ? 'Gerando CSV...' : 'Baixar CSV'}</Text>
        </Pressable>
      </View>

      <Text style={styles.section}>Resumo por pessoa</Text>
      {acerto.participantes.map((p) => (
        <View key={p.pessoa_id} style={styles.card}>
          <View style={styles.row}><Text style={styles.name}>{p.nome}</Text><Text style={styles.balance}>{formatCurrency(p.saldo)}</Text></View>
          <Text style={styles.detail}>Devido {formatCurrency(p.devido)} · Desembolsado {formatCurrency(p.desembolsado)}</Text>
        </View>
      ))}

      {acerto.transferencias.length > 0 && (
        <>
          <Text style={styles.section}>Transferências</Text>
          {acerto.transferencias.map((t, index) => (
            <View key={`${t.de_pessoa_id}-${t.para_pessoa_id}-${index}`} style={styles.card}>
              <Text style={styles.name}>{t.de_nome} → {t.para_nome}</Text>
              <Text style={[styles.detail, t.tipo === 'estorno' && styles.estorno]}>
                {formatCurrency(t.valor)} · {t.tipo === 'estorno' ? 'Estorno aplicado' : 'Pagamento'}
              </Text>
            </View>
          ))}
        </>
      )}

      {acerto.meses.length > 0 && (
        <>
          <Text style={styles.section}>Distribuição mensal</Text>
          {acerto.meses.map((mes, index) => (
            <View key={`${mes.mes}-${mes.pessoa_id}-${index}`} style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.name}>{mes.mes} · {mes.nome}</Text>
                <Text style={styles.balance}>{formatCurrency(mes.acerto)}</Text>
              </View>
              <Text style={styles.detail}>
                Devido {formatCurrency(mes.devido)} · Desembolsado {formatCurrency(mes.desembolsado)}
              </Text>
            </View>
          ))}
        </>
      )}

      <Text style={styles.section}>Despesas incluídas: {acerto.despesas.length}</Text>
      {acerto.despesas.map((d, index) => (
        <View key={`${d.data}-${index}`} style={styles.card}>
          <View style={styles.row}><Text style={styles.name}>{d.descricao}</Text><Text>{formatCurrency(d.valor)}</Text></View>
          <Text style={styles.detail}>{formatDate(d.data)} · {d.nome_pessoa}</Text>
        </View>
      ))}

      {acerto.eventos.length > 0 && (
        <>
          <Text style={styles.section}>Eventos do relatório</Text>
          {acerto.eventos.map((evento, index) => (
            <View key={`${evento.tipo}-${evento.created_at}-${index}`} style={styles.card}>
              <Text style={styles.name}>{rotuloEvento(evento.tipo)}</Text>
              <Text style={styles.detail}>{formatDate(evento.created_at)}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  error: { color: '#c62828', textAlign: 'center' },
  retry: { padding: 10 },
  retryText: { color: '#1565c0', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { color: '#666', fontSize: 14 },
  section: { color: '#555', fontSize: 14, fontWeight: '600', marginTop: 16, textTransform: 'uppercase' },
  card: { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  balance: { fontWeight: '700' },
  detail: { color: '#666', fontSize: 13 },
  estorno: { color: '#8e24aa', fontWeight: '600' },
  arquivos: { flexDirection: 'row', gap: 8, marginTop: 12 },
  arquivoBotao: { backgroundColor: '#1565c0', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  arquivoTexto: { color: '#fff', fontWeight: '600' },
  disabled: { opacity: 0.5 },
});
