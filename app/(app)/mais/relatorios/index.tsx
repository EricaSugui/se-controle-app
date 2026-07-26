import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { MonthPicker, competenciaParaData, dataParaCompetencia } from '@/src/components/ui/MonthPicker';
import { getFechamentoMensal } from '@/src/services/api/fechamentoMensal';
import { formatCurrency } from '@/src/utils/formatters';
import { competenciaAtual } from '@/src/utils/competencia';
import type { Dashboard } from '@/src/types';

function competenciaMesesAtras(n: number): string {
  const hoje = new Date();
  const d = new Date(hoje.getFullYear(), hoje.getMonth() - n, 1);
  return dataParaCompetencia(d.getMonth(), d.getFullYear());
}

function indiceCompetencia(competencia: string): number {
  const { mes, ano } = competenciaParaData(competencia);
  return ano * 12 + mes;
}

export default function RelatoriosScreen() {
  const [de, setDe] = useState(() => competenciaMesesAtras(5));
  const [ate, setAte] = useState(competenciaAtual);
  const [seletorDeVisivel, setSeletorDeVisivel] = useState(false);
  const [seletorAteVisivel, setSeletorAteVisivel] = useState(false);

  const [meses, setMeses] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // null = soma de todas as casas
  const [casaFiltroId, setCasaFiltroId] = useState<number | null>(null);

  const periodoInvalido = indiceCompetencia(de) > indiceCompetencia(ate);

  const carregar = useCallback(() => {
    if (periodoInvalido) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getFechamentoMensal(de, ate)
      .then(setMeses)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [de, ate, periodoInvalido]);

  useFocusEffect(carregar);

  // União das casas que aparecem no período (uma casa pode não ter dados em
  // todos os meses).
  const casas: { id: number; nome: string }[] = [];
  for (const mes of meses) {
    for (const casa of mes.casas) {
      if (!casas.some((c) => c.id === casa.id)) casas.push({ id: casa.id, nome: casa.nome });
    }
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.linkGastos} onPress={() => router.push('/(app)/mais/relatorios/gastos')}>
        <Text style={styles.linkGastosTitulo}>Para onde foi meu dinheiro? ›</Text>
        <Text style={styles.linkGastosSub}>Gastos por categoria e por pessoa, casa a casa</Text>
      </Pressable>

      <Text style={styles.titulo}>Fechamento mensal</Text>

      {casas.length > 1 && (
        <View style={styles.casasRow}>
          <Pressable
            style={[styles.chip, casaFiltroId === null && styles.chipAtivo]}
            onPress={() => setCasaFiltroId(null)}
          >
            <Text style={[styles.chipTexto, casaFiltroId === null && styles.chipTextoAtivo]}>
              Todas as casas
            </Text>
          </Pressable>
          {casas.map((c) => (
            <Pressable
              key={c.id}
              style={[styles.chip, casaFiltroId === c.id && styles.chipAtivo]}
              onPress={() => setCasaFiltroId(c.id)}
            >
              <Text style={[styles.chipTexto, casaFiltroId === c.id && styles.chipTextoAtivo]}>
                {c.nome}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.periodoRow}>
        <Pressable onPress={() => setSeletorDeVisivel(true)} style={styles.periodoBotao}>
          <Text style={styles.periodoLabel}>De</Text>
          <Text style={styles.periodoValor}>{de} ▼</Text>
        </Pressable>
        <Pressable onPress={() => setSeletorAteVisivel(true)} style={styles.periodoBotao}>
          <Text style={styles.periodoLabel}>Até</Text>
          <Text style={styles.periodoValor}>{ate} ▼</Text>
        </Pressable>
      </View>

      {periodoInvalido ? (
        <Text style={styles.periodoInvalido}>Período inválido: o mês inicial vem depois do final.</Text>
      ) : loading ? (
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
        <FlatList
          data={meses}
          keyExtractor={(mes) => mes.competencia}
          contentContainerStyle={styles.lista}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum dado no período.</Text>}
          renderItem={({ item }: { item: Dashboard }) => {
            const casasDoMes =
              casaFiltroId === null ? item.casas : item.casas.filter((c) => c.id === casaFiltroId);
            const receitas = casasDoMes.reduce((acc, c) => acc + c.receitas_total, 0);
            const gastos = casasDoMes.reduce((acc, c) => acc + c.gastos_total, 0);
            const saldo = casasDoMes.reduce((acc, c) => acc + c.saldo_casa, 0);
            const minhaParte = casasDoMes.reduce((acc, c) => acc + c.minha_parte, 0);

            return (
              <View style={styles.card}>
                <Text style={styles.cardTitulo}>{item.competencia}</Text>
                <Linha label="Receitas" valor={receitas} cor="#2e7d32" />
                <Linha label="Gastos" valor={gastos} cor="#c62828" />
                <Linha label="Minha parte" valor={minhaParte} cor="#e65100" />
                <Linha label="Saldo" valor={saldo} cor={saldo >= 0 ? '#2e7d32' : '#c62828'} />
                {casaFiltroId === null && casasDoMes.length > 1 && (
                  <View style={styles.porCasa}>
                    {casasDoMes.map((c) => (
                      <View key={c.id} style={styles.linha}>
                        <Text style={styles.porCasaNome}>{c.nome}</Text>
                        <Text style={[styles.porCasaSaldo, { color: c.saldo_casa >= 0 ? '#2e7d32' : '#c62828' }]}>
                          {formatCurrency(c.saldo_casa)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          }}
        />
      )}

      <MonthPicker
        visivel={seletorDeVisivel}
        valor={de}
        onSelecionar={setDe}
        onFechar={() => setSeletorDeVisivel(false)}
      />
      <MonthPicker
        visivel={seletorAteVisivel}
        valor={ate}
        onSelecionar={setAte}
        onFechar={() => setSeletorAteVisivel(false)}
      />
    </View>
  );
}

function Linha({ label, valor, cor }: { label: string; valor: number; cor: string }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.linhaLabel}>{label}</Text>
      <Text style={[styles.linhaValor, { color: cor }]}>{formatCurrency(valor)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  center:           { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  titulo:           { fontSize: 18, fontWeight: 'bold', textAlign: 'center', paddingTop: 16 },

  linkGastos:       { backgroundColor: '#e3f2fd', borderRadius: 8, padding: 14, marginHorizontal: 16, marginTop: 16, gap: 2 },
  linkGastosTitulo: { color: '#1565c0', fontSize: 15, fontWeight: '700' },
  linkGastosSub:    { color: '#555', fontSize: 12 },

  casasRow:         { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 12 },
  chip:             { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  chipAtivo:        { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  chipTexto:        { fontSize: 13, color: '#555' },
  chipTextoAtivo:   { color: '#1565c0', fontWeight: '600' },

  periodoRow:       { flexDirection: 'row', justifyContent: 'center', gap: 24, paddingVertical: 12 },
  periodoBotao:     { alignItems: 'center' },
  periodoLabel:     { fontSize: 12, color: '#888' },
  periodoValor:     { fontSize: 15, fontWeight: '600', marginTop: 2 },

  periodoInvalido:  { color: '#c62828', textAlign: 'center', marginTop: 24, paddingHorizontal: 24 },

  lista:            { padding: 16, gap: 10, flexGrow: 1 },
  vazio:            { textAlign: 'center', color: '#888', marginTop: 32 },

  card:             { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 14, gap: 6 },
  cardTitulo:       { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  linha:            { flexDirection: 'row', justifyContent: 'space-between' },
  linhaLabel:       { fontSize: 14, color: '#555' },
  linhaValor:       { fontSize: 14, fontWeight: '600' },

  porCasa:          { borderTopWidth: 1, borderTopColor: '#e0e0e0', marginTop: 6, paddingTop: 6, gap: 4 },
  porCasaNome:      { fontSize: 12, color: '#888' },
  porCasaSaldo:     { fontSize: 12, fontWeight: '600' },

  erro:             { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:            { padding: 10 },
  retryTexto:       { color: '#1565c0' },
});
