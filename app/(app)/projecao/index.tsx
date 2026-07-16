import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getSaldoProjetado } from '@/src/services/api/saldoProjetado';
import { ProjecaoChart, CORES_SERIES } from '@/src/components/domain/ProjecaoChart';
import { useAuth } from '@/src/context/AuthContext';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import type { AvisoProjecao, ContaProjetada, SaldoProjetado, TipoEventoProjecao } from '@/src/types';

type Horizonte = 'este_mes' | 'padrao' | 'tres_meses';

const HORIZONTES: { valor: Horizonte; label: string }[] = [
  { valor: 'este_mes', label: 'Este mês' },
  { valor: 'padrao', label: 'Mês que vem' },
  { valor: 'tres_meses', label: '+3 meses' },
];

const LABEL_EVENTO: Record<TipoEventoProjecao, string> = {
  receita: 'Receita',
  receita_esperada: 'Receita esperada',
  parcela_debito: 'Parcela',
  fatura: 'Fatura',
  despesa_esperada: 'Despesa esperada',
};

const ROTA_AVISO: Record<AvisoProjecao['tipo'], string> = {
  cartao_sem_conta_debito: '/(app)/mais/cartoes-contas',
  despesas_fixas_sem_meio_padrao: '/(app)/mais/despesas-fixas/contratos',
  receitas_fixas_sem_conta_destino: '/(app)/mais/receitas-fixas/contratos',
};

// Último dia do mês `offset` meses à frente, no fuso do dispositivo.
function ultimoDiaDoMes(offsetMeses: number): string {
  const agora = new Date();
  const d = new Date(agora.getFullYear(), agora.getMonth() + offsetMeses + 1, 0);
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

function ateDoHorizonte(h: Horizonte): string | undefined {
  if (h === 'este_mes') return ultimoDiaDoMes(0);
  if (h === 'tres_meses') return ultimoDiaDoMes(3);
  return undefined; // padrão do backend: último dia do mês seguinte
}

export default function ProjecaoScreen() {
  const { user } = useAuth();
  const [horizonte, setHorizonte] = useState<Horizonte>('padrao');
  const [data, setData] = useState<SaldoProjetado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // null = todas as contas
  const [contaFiltroId, setContaFiltroId] = useState<number | null>(null);

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    getSaldoProjetado(ateDoHorizonte(horizonte))
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [horizonte]);

  useFocusEffect(carregar);

  function editarConta(c: ContaProjetada) {
    router.push({
      pathname: '/(app)/mais/cartoes-contas/[id]',
      params: {
        id: c.conta.id,
        nome: c.conta.nome,
        tipo: c.conta.tipo,
        titularId: String(c.conta.titular_id),
        saldoBase: c.saldo_base != null ? String(c.saldo_base) : '',
        saldoBaseData: c.saldo_base_data ?? '',
      },
    });
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || data == null) {
    return (
      <View style={styles.center}>
        <Text style={styles.erro}>{error ?? 'Não foi possível carregar a projeção.'}</Text>
        <Pressable onPress={carregar} style={styles.retry}>
          <Text style={styles.retryTexto}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  const contasComSaldo = data.contas.filter((c) => !c.sem_saldo_base);
  const contasFiltradas =
    contaFiltroId === null ? data.contas : data.contas.filter((c) => c.conta.id === contaFiltroId);
  const eventos = contasFiltradas
    .flatMap((c) => c.eventos.map((e) => ({ ...e, contaNome: c.conta.nome })))
    .sort((a, b) => a.data.localeCompare(b.data));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.horizonteRow}>
        {HORIZONTES.map((h) => (
          <Pressable
            key={h.valor}
            style={[styles.chip, horizonte === h.valor && styles.chipAtivo]}
            onPress={() => setHorizonte(h.valor)}
          >
            <Text style={[styles.chipTexto, horizonte === h.valor && styles.chipTextoAtivo]}>
              {h.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.periodoHint}>
        Projeção de {formatDate(data.hoje)} até {formatDate(data.ate)}
      </Text>

      {data.avisos.map((aviso) => (
        <Pressable
          key={aviso.tipo}
          style={styles.aviso}
          onPress={() => router.push(ROTA_AVISO[aviso.tipo] as never)}
        >
          <Text style={styles.avisoTexto}>{aviso.mensagem} ›</Text>
        </Pressable>
      ))}

      {data.contas.length === 0 && (
        <View style={styles.vazioBox}>
          <Text style={styles.vazio}>
            Nenhuma conta na projeção. Cadastre uma conta (débito ou aplicação) para começar.
          </Text>
          <Pressable
            style={styles.botaoNovo}
            onPress={() => router.push('/(app)/mais/cartoes-contas/novo')}
          >
            <Text style={styles.botaoNovoTexto}>+ Nova conta</Text>
          </Pressable>
        </View>
      )}

      {data.contas.map((c) => {
        const idxSerie = contasComSaldo.indexOf(c);
        const minhaConta = c.conta.titular_id === Number(user?.id);
        return (
          <View key={c.conta.id} style={styles.conta}>
            <View style={styles.contaHeader}>
              {idxSerie >= 0 && (
                <View
                  style={[styles.contaCor, { backgroundColor: CORES_SERIES[idxSerie % CORES_SERIES.length] }]}
                />
              )}
              <Text style={styles.contaNome}>{c.conta.nome}</Text>
              <Text style={styles.contaTipo}>
                {c.conta.tipo === 'aplicacao' ? 'Aplicação' : 'Conta'}
                {!minhaConta ? ` · ${c.conta.titular_nome}` : ''}
              </Text>
            </View>

            {c.sem_saldo_base ? (
              <>
                <Text style={styles.contaLinha}>
                  Fluxo no período:{' '}
                  <Text style={{ color: c.fluxo_liquido >= 0 ? '#2e7d32' : '#c62828', fontWeight: '600' }}>
                    {formatCurrency(c.fluxo_liquido)}
                  </Text>
                </Text>
                {minhaConta && (
                  <Pressable onPress={() => editarConta(c)}>
                    <Text style={styles.cta}>Informe o saldo atual para ver a projeção ›</Text>
                  </Pressable>
                )}
              </>
            ) : (
              <>
                <Text style={styles.contaLinha}>
                  Saldo em {formatDate(c.saldo_base_data!)}: {formatCurrency(c.saldo_base!)}
                </Text>
                <Text style={styles.contaLinha}>
                  Projetado em {formatDate(data.ate)}:{' '}
                  <Text style={styles.contaProjetado}>{formatCurrency(c.saldo_projetado!)}</Text>
                  {'  '}
                  <Text style={{ color: c.fluxo_liquido >= 0 ? '#2e7d32' : '#c62828' }}>
                    ({c.fluxo_liquido >= 0 ? '+' : ''}
                    {formatCurrency(c.fluxo_liquido)})
                  </Text>
                </Text>
              </>
            )}
          </View>
        );
      })}

      {contasComSaldo.length > 0 && (
        <ProjecaoChart contas={contasComSaldo} hoje={data.hoje} ate={data.ate} />
      )}

      {data.contas.length > 0 && (
        <>
          <Text style={styles.secao}>Extrato futuro</Text>
          {data.contas.length > 1 && (
            <View style={styles.filtroRow}>
              <Pressable
                style={[styles.chip, contaFiltroId === null && styles.chipAtivo]}
                onPress={() => setContaFiltroId(null)}
              >
                <Text style={[styles.chipTexto, contaFiltroId === null && styles.chipTextoAtivo]}>
                  Todas
                </Text>
              </Pressable>
              {data.contas.map((c) => (
                <Pressable
                  key={c.conta.id}
                  style={[styles.chip, contaFiltroId === c.conta.id && styles.chipAtivo]}
                  onPress={() => setContaFiltroId(c.conta.id)}
                >
                  <Text style={[styles.chipTexto, contaFiltroId === c.conta.id && styles.chipTextoAtivo]}>
                    {c.conta.nome}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {eventos.length === 0 && (
            <Text style={styles.vazio}>Nenhum evento previsto no período.</Text>
          )}
          {eventos.map((e, i) => (
            <View key={`${e.data}-${e.descricao}-${i}`} style={styles.evento}>
              <View style={styles.eventoInfo}>
                <Text style={styles.eventoDescricao}>{e.descricao}</Text>
                <Text style={styles.eventoDetalhe}>
                  {formatDate(e.data)} · {LABEL_EVENTO[e.tipo]}
                  {contaFiltroId === null && data.contas.length > 1 ? ` · ${e.contaNome}` : ''}
                </Text>
              </View>
              {e.valor_indefinido ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeTexto}>valor variável</Text>
                </View>
              ) : (
                <Text style={[styles.eventoValor, { color: e.valor >= 0 ? '#2e7d32' : '#c62828' }]}>
                  {e.valor >= 0 ? '+' : ''}
                  {formatCurrency(e.valor)}
                </Text>
              )}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:      { padding: 16, gap: 12 },

  horizonteRow:   { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  filtroRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  chipAtivo:      { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  chipTexto:      { fontSize: 13, color: '#555' },
  chipTextoAtivo: { color: '#1565c0', fontWeight: '600' },
  periodoHint:    { fontSize: 12, color: '#888', textAlign: 'center' },

  aviso:          { backgroundColor: '#fff8e1', borderRadius: 8, padding: 12 },
  avisoTexto:     { color: '#e65100', fontWeight: '600', fontSize: 14 },

  conta:          { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 14, gap: 4 },
  contaHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contaCor:       { width: 10, height: 10, borderRadius: 2 },
  contaNome:      { fontSize: 15, fontWeight: '600', flexShrink: 1 },
  contaTipo:      { fontSize: 12, color: '#777', marginLeft: 'auto' },
  contaLinha:     { fontSize: 14, color: '#555' },
  contaProjetado: { fontWeight: '700', color: '#000' },
  cta:            { color: '#1565c0', fontSize: 14, fontWeight: '600', marginTop: 4 },

  secao:          { fontSize: 16, fontWeight: 'bold', marginTop: 8 },

  evento:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, gap: 8 },
  eventoInfo:     { flex: 1, gap: 2 },
  eventoDescricao:{ fontSize: 14, fontWeight: '500' },
  eventoDetalhe:  { fontSize: 12, color: '#777' },
  eventoValor:    { fontSize: 14, fontWeight: '600' },
  badge:          { backgroundColor: '#eeeeee', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10 },
  badgeTexto:     { fontSize: 11, color: '#666' },

  vazioBox:       { alignItems: 'center', gap: 12, paddingVertical: 16 },
  vazio:          { color: '#888', textAlign: 'center', fontStyle: 'italic', paddingVertical: 8 },
  botaoNovo:      { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', alignSelf: 'stretch' },
  botaoNovoTexto: { color: '#fff', fontWeight: '600', fontSize: 15, textAlign: 'center' },

  erro:           { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:          { padding: 10 },
  retryTexto:     { color: '#1565c0' },
});
