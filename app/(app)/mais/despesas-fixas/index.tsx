import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getStatusDespesasFixas } from '@/src/services/api/despesasFixas';
import { MonthPicker } from '@/src/components/ui/MonthPicker';
import { competenciaAtual } from '@/src/utils/competencia';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import type { DespesaFixaStatusItem, StatusDespesaFixa } from '@/src/types';

type Modo = 'mes' | 'aberto';

const MODOS: { valor: Modo; label: string }[] = [
  { valor: 'mes', label: 'Mês' },
  { valor: 'aberto', label: 'Em aberto' },
];

const STATUS_INFO: Record<StatusDespesaFixa, { label: string; cor: string }> = {
  em_atraso: { label: 'Em atraso', cor: '#c62828' },
  vencendo_hoje: { label: 'Vence hoje', cor: '#e65100' },
  em_dia: { label: 'Em dia', cor: '#1565c0' },
  pago: { label: 'Pago', cor: '#2e7d32' },
  justificado: { label: 'Justificado', cor: '#616161' },
};

const ORDEM_STATUS: StatusDespesaFixa[] = ['em_atraso', 'vencendo_hoje', 'em_dia', 'pago', 'justificado'];

export default function ContasDoMesScreen() {
  const [modo, setModo] = useState<Modo>('mes');
  const [competencia, setCompetencia] = useState(competenciaAtual);
  const [seletorVisivel, setSeletorVisivel] = useState(false);
  const [itens, setItens] = useState<DespesaFixaStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    getStatusDespesasFixas(modo === 'mes' ? competencia : undefined)
      .then(setItens)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [modo, competencia]);

  useFocusEffect(carregar);

  // A API já ordena por severidade — aqui só particionamos em seções.
  const secoes = ORDEM_STATUS.map((status) => ({
    status,
    title: STATUS_INFO[status].label,
    cor: STATUS_INFO[status].cor,
    data: itens.filter((i) => i.status === status),
  })).filter((s) => s.data.length > 0);

  function abrirDetalhe(item: DespesaFixaStatusItem) {
    router.push({
      pathname: '/(app)/mais/despesas-fixas/[id]',
      params: { id: item.despesa_fixa_id, descricao: item.descricao },
    });
  }

  function registrarPagamento(item: DespesaFixaStatusItem) {
    router.push({
      pathname: '/(app)/mais/despesas-fixas/pagamento',
      params: {
        despesaFixaId: item.despesa_fixa_id,
        competenciaReferencia: item.competencia,
        descricao: item.descricao,
        valorReferencia: String(item.valor_referencia),
        categoriaId: item.categoria_id,
        casaId: item.casa_id != null ? String(item.casa_id) : '',
        pessoaId: item.pessoa_id != null ? String(item.pessoa_id) : '',
      },
    });
  }

  function justificar(item: DespesaFixaStatusItem) {
    router.push({
      pathname: '/(app)/mais/despesas-fixas/justificar',
      params: {
        despesaFixaId: item.despesa_fixa_id,
        competenciaReferencia: item.competencia,
        descricao: item.descricao,
        valorReferencia: String(item.valor_referencia),
      },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.modoRow}>
        {MODOS.map((m) => (
          <Pressable
            key={m.valor}
            style={[styles.opcao, modo === m.valor && styles.opcaoAtiva]}
            onPress={() => setModo(m.valor)}
          >
            <Text style={[styles.opcaoTexto, modo === m.valor && styles.opcaoTextoAtivo]}>
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {modo === 'mes' ? (
        <Pressable onPress={() => setSeletorVisivel(true)} style={styles.competenciaBotao}>
          <Text style={styles.competencia}>{competencia}</Text>
          <Text style={styles.competenciaHint}>▼ trocar mês</Text>
        </Pressable>
      ) : (
        <Text style={styles.modoHint}>Contas em aberto de todas as competências.</Text>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.erro}>{error}</Text>
          <Pressable onPress={carregar} style={styles.retry}>
            <Text style={styles.retryTexto}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          sections={secoes}
          keyExtractor={(item) => `${item.despesa_fixa_id}-${item.competencia}`}
          contentContainerStyle={styles.lista}
          stickySectionHeadersEnabled={false}
          ListEmptyComponent={
            <Text style={styles.vazio}>
              {modo === 'mes' ? 'Nenhuma conta fixa nesta competência.' : 'Nada em aberto.'}
            </Text>
          }
          renderSectionHeader={({ section }) => (
            <Text style={[styles.secaoTitulo, { color: section.cor }]}>{section.title}</Text>
          )}
          renderItem={({ item, section }) => (
            <Pressable style={styles.item} onPress={() => abrirDetalhe(item)}>
              <View style={styles.itemLinha}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemNome}>{item.descricao}</Text>
                  <Text style={styles.itemDetalhe}>
                    {item.categoria_nome} · {item.competencia} ·{' '}
                    {formatDate(item.data_esperada.slice(0, 10))}
                  </Text>
                </View>
                <Text style={[styles.itemValor, { color: section.cor }]}>
                  {item.tipo_valor === 'variavel_estimado' ? '~' : ''}
                  {formatCurrency(item.valor_referencia)}
                </Text>
              </View>
              {item.status !== 'pago' && item.status !== 'justificado' && (
                <Pressable onPress={() => registrarPagamento(item)}>
                  <Text style={styles.registrar}>Registrar pagamento</Text>
                </Pressable>
              )}
              {item.status === 'em_atraso' && (
                <Pressable onPress={() => justificar(item)}>
                  <Text style={styles.justificar}>Justificar</Text>
                </Pressable>
              )}
            </Pressable>
          )}
        />
      )}

      <Pressable
        style={styles.botaoContratos}
        onPress={() => router.push('/(app)/mais/despesas-fixas/contratos')}
      >
        <Text style={styles.botaoContratosTexto}>Gerenciar contratos</Text>
      </Pressable>

      <MonthPicker
        visivel={seletorVisivel}
        valor={competencia}
        onSelecionar={setCompetencia}
        onFechar={() => setSeletorVisivel(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center:              { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:           { flex: 1 },

  modoRow:             { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 16 },
  opcao:               { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  opcaoAtiva:          { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  opcaoTexto:          { fontSize: 13, color: '#555' },
  opcaoTextoAtivo:     { color: '#1565c0', fontWeight: '600' },

  competenciaBotao:    { alignItems: 'center', paddingTop: 12 },
  competencia:         { fontSize: 20, fontWeight: 'bold' },
  competenciaHint:     { fontSize: 12, color: '#888', marginTop: 2 },
  modoHint:            { fontSize: 12, color: '#888', textAlign: 'center', paddingTop: 12 },

  lista:               { padding: 16, gap: 8, flexGrow: 1 },
  vazio:               { textAlign: 'center', color: '#888', marginTop: 32 },

  secaoTitulo:         { fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  item:                { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 14, gap: 8, marginTop: 8 },
  itemLinha:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  itemInfo:            { flex: 1 },
  itemNome:            { fontSize: 15, fontWeight: '500' },
  itemDetalhe:         { fontSize: 12, color: '#777', marginTop: 2 },
  itemValor:           { fontSize: 14, fontWeight: '600' },
  registrar:           { color: '#1565c0', fontSize: 14 },
  justificar:          { color: '#616161', fontSize: 14 },

  botaoContratos:      { margin: 16, borderWidth: 1.5, borderColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center' },
  botaoContratosTexto: { color: '#1565c0', fontWeight: '600', fontSize: 15 },

  erro:                { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:               { padding: 10 },
  retryTexto:          { color: '#1565c0' },
});
