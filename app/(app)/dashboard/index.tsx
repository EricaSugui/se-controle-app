import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useDashboard } from '@/src/hooks/useDashboard';
import { MonthPicker } from '@/src/components/ui/MonthPicker';
import { getStatusDespesasFixas } from '@/src/services/api/despesasFixas';
import { competenciaAtual } from '@/src/utils/competencia';
import { formatCurrency } from '@/src/utils/formatters';

const EIXOS: { valor: 'caixa' | 'competencia'; label: string }[] = [
  { valor: 'caixa', label: 'Caixa' },
  { valor: 'competencia', label: 'Competência' },
];

export default function DashboardScreen() {
  const [competencia, setCompetencia] = useState(competenciaAtual);
  const [eixo, setEixo] = useState<'caixa' | 'competencia'>('caixa');
  const [seletorVisivel, setSeletorVisivel] = useState(false);
  const [alertas, setAlertas] = useState(0);
  const state = useDashboard(competencia, eixo);

  useFocusEffect(
    useCallback(() => {
      getStatusDespesasFixas()
        .then((itens) =>
          setAlertas(itens.filter((i) => i.status === 'em_atraso' || i.status === 'vencendo_hoje').length)
        )
        .catch(() => setAlertas(0));
    }, [])
  );

  if (state.status === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (state.status === 'error') {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{state.error}</Text>
      </View>
    );
  }

  const { data } = state;

  const receitas_total = data.casas.reduce((acc, c) => acc + c.receitas_total, 0);
  const gastos_total = data.casas.reduce((acc, c) => acc + c.gastos_total, 0);
  const saldo = data.casas.reduce((acc, c) => acc + c.saldo_casa, 0);

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => setSeletorVisivel(true)} style={styles.competenciaBotao}>
          <Text style={styles.competencia}>{data.competencia}</Text>
          <Text style={styles.competenciaHint}>▼ trocar mês</Text>
        </Pressable>

        <View style={styles.eixoRow}>
          {EIXOS.map((e) => (
            <Pressable
              key={e.valor}
              style={[styles.eixoOpcao, eixo === e.valor && styles.eixoOpcaoAtiva]}
              onPress={() => setEixo(e.valor)}
            >
              <Text style={[styles.eixoTexto, eixo === e.valor && styles.eixoTextoAtivo]}>{e.label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.eixoHint}>
          {eixo === 'caixa'
            ? 'Caixa: parcelas que saem do bolso neste mês'
            : 'Competência: compras decididas neste mês'}
        </Text>

        {alertas > 0 && (
          <Pressable style={styles.alertaContas} onPress={() => router.push('/(app)/mais/despesas-fixas')}>
            <Text style={styles.alertaContasTexto}>
              {alertas === 1
                ? '1 conta fixa vencendo ou em atraso'
                : `${alertas} contas fixas vencendo ou em atraso`}{' '}
              ›
            </Text>
          </Pressable>
        )}

        <View style={styles.resumo}>
          <ResumoItem label="Receitas" valor={receitas_total} cor="#2e7d32" />
          <ResumoItem label="Gastos" valor={gastos_total} cor="#c62828" />
          <ResumoItem label="Minha parte" valor={data.minha_parte_total} cor="#e65100" />
          <ResumoItem label="Saldo" valor={saldo} cor={saldo >= 0 ? '#2e7d32' : '#c62828'} />
        </View>

        <Text style={styles.secao}>Casas</Text>
        {data.casas.length === 0 && (
          <Text style={styles.vazio}>
            Nenhuma casa vinculada. Acesse Mais {'>'} Gerenciar casas para cadastrar.
          </Text>
        )}
        {data.casas.map((casa) => (
          <View key={casa.id} style={styles.casa}>
            <Text style={styles.casaNome}>{casa.nome}</Text>
            <Text>Receitas: {formatCurrency(casa.receitas_total)}</Text>
            <Text>Gastos: {formatCurrency(casa.gastos_total)}</Text>
            <Text>Saldo: {formatCurrency(casa.saldo_casa)}</Text>
            <Text>Minha parte: {formatCurrency(casa.minha_parte)}</Text>
            <Text>Custeio: {casa.percentual_custeio}%</Text>
          </View>
        ))}
      </ScrollView>

      <MonthPicker
        visivel={seletorVisivel}
        valor={competencia}
        onSelecionar={setCompetencia}
        onFechar={() => setSeletorVisivel(false)}
      />
    </>
  );
}

function ResumoItem({ label, valor, cor }: { label: string; valor: number; cor: string }) {
  return (
    <View style={styles.resumoItem}>
      <Text style={styles.resumoLabel}>{label}</Text>
      <Text style={[styles.resumoValor, { color: cor }]}>{formatCurrency(valor)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center:             { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container:          { padding: 16, gap: 12 },

  competenciaBotao:   { alignItems: 'center' },
  competencia:        { fontSize: 20, fontWeight: 'bold' },
  competenciaHint:    { fontSize: 12, color: '#888', marginTop: 2 },

  eixoRow:            { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  eixoOpcao:          { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  eixoOpcaoAtiva:     { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  eixoTexto:          { fontSize: 13, color: '#555' },
  eixoTextoAtivo:     { color: '#1565c0', fontWeight: '600' },
  eixoHint:           { fontSize: 12, color: '#888', textAlign: 'center' },

  alertaContas:       { backgroundColor: '#fdecea', borderRadius: 8, padding: 12 },
  alertaContasTexto:  { color: '#c62828', fontWeight: '600', fontSize: 14, textAlign: 'center' },

  resumo:             { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16, gap: 8 },
  resumoItem:         { flexDirection: 'row', justifyContent: 'space-between' },
  resumoLabel:        { fontSize: 14, color: '#555' },
  resumoValor:        { fontSize: 14, fontWeight: '600' },

  secao:              { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  casa:               { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, gap: 4 },
  casaNome:           { fontSize: 15, fontWeight: '600' },
  vazio:              { color: '#888', textAlign: 'center', fontStyle: 'italic', paddingVertical: 8 },
  error:              { color: '#c62828', textAlign: 'center', padding: 16 },
});
