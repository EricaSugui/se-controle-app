import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useDashboard } from '@/src/hooks/useDashboard';
import { useBreakpoint } from '@/src/hooks/useBreakpoint';
import { useHover } from '@/src/hooks/useHover';
import { MonthPicker } from '@/src/components/ui/MonthPicker';
import { getStatusDespesasFixas } from '@/src/services/api/despesasFixas';
import { getStatusReceitasFixas } from '@/src/services/api/receitasFixas';
import { competenciaAtual } from '@/src/utils/competencia';
import { formatCurrency } from '@/src/utils/formatters';
import { cores, raio } from '@/src/theme/tokens';

const EIXOS: { valor: 'caixa' | 'competencia'; label: string }[] = [
  { valor: 'caixa', label: 'Caixa' },
  { valor: 'competencia', label: 'Competência' },
];

export default function DashboardScreen() {
  const [competencia, setCompetencia] = useState(competenciaAtual);
  const [eixo, setEixo] = useState<'caixa' | 'competencia'>('caixa');
  const [seletorVisivel, setSeletorVisivel] = useState(false);
  const [alertas, setAlertas] = useState(0);
  const [recebimentosAtrasados, setRecebimentosAtrasados] = useState(0);
  // Acima de 768px os 4 resumos cabem lado a lado; abaixo, viram linhas.
  const { compacto } = useBreakpoint();
  const state = useDashboard(competencia, eixo);

  useFocusEffect(
    useCallback(() => {
      getStatusDespesasFixas()
        .then((itens) =>
          setAlertas(itens.filter((i) => i.status === 'em_atraso' || i.status === 'vencendo_hoje').length)
        )
        .catch(() => setAlertas(0));
      getStatusReceitasFixas()
        .then((itens) =>
          setRecebimentosAtrasados(itens.filter((i) => i.status === 'atrasado').length)
        )
        .catch(() => setRecebimentosAtrasados(0));
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
        {/* No desktop competência e eixo dividem a linha; empilhados sobra
            uma faixa vazia enorme antes do primeiro dado. */}
        <View style={[styles.cabecalho, !compacto && styles.cabecalhoLargo]}>
          <Pressable onPress={() => setSeletorVisivel(true)} style={styles.competenciaBotao}>
            <Text style={styles.competencia}>{data.competencia}</Text>
            <Text style={styles.competenciaHint}>▼ trocar mês</Text>
          </Pressable>

          <View style={styles.eixoBloco}>
            <View style={styles.eixoRow}>
              {EIXOS.map((e) => (
                <OpcaoEixo
                  key={e.valor}
                  label={e.label}
                  ativo={eixo === e.valor}
                  onPress={() => setEixo(e.valor)}
                />
              ))}
            </View>
            <Text style={styles.eixoHint}>
              {eixo === 'caixa'
                ? 'Caixa: parcelas que saem do bolso neste mês'
                : 'Competência: compras decididas neste mês'}
            </Text>
          </View>
        </View>

        {alertas > 0 && (
          <Alerta
            tom="negativo"
            texto={
              alertas === 1
                ? '1 conta fixa vencendo ou em atraso'
                : `${alertas} contas fixas vencendo ou em atraso`
            }
            onPress={() => router.push('/(app)/mais/despesas-fixas')}
          />
        )}

        {recebimentosAtrasados > 0 && (
          <Alerta
            tom="positivo"
            texto={
              recebimentosAtrasados === 1
                ? '1 recebimento atrasado'
                : `${recebimentosAtrasados} recebimentos atrasados`
            }
            onPress={() => router.push('/(app)/mais/receitas-fixas')}
          />
        )}

        <View style={[styles.resumo, !compacto && styles.resumoGrid]}>
          <ResumoItem label="Receitas" valor={receitas_total} cor={cores.positivo} card={!compacto} />
          <ResumoItem label="Gastos" valor={gastos_total} cor={cores.negativo} card={!compacto} />
          <ResumoItem label="Minha parte" valor={data.minha_parte_total} cor={cores.alerta} card={!compacto} />
          <ResumoItem
            label="Saldo"
            valor={saldo}
            cor={saldo >= 0 ? cores.positivo : cores.negativo}
            card={!compacto}
          />
        </View>

        <Text style={styles.secao}>Casas</Text>
        {data.casas.length === 0 && (
          <Text style={styles.vazio}>
            Nenhuma casa vinculada. Acesse Mais {'>'} Gerenciar casas para cadastrar.
          </Text>
        )}
        {/* flexWrap resolve a grade sozinho: com flexBasis 260 cabe 1 card no
            celular e 3-4 no desktop, sem precisar de breakpoint. */}
        <View style={styles.casasGrid}>
          {data.casas.map((casa) => (
            <View key={casa.id} style={styles.casa}>
              <Text style={styles.casaNome}>{casa.nome}</Text>
              <LinhaCasa label="Receitas" valor={formatCurrency(casa.receitas_total)} />
              <LinhaCasa label="Gastos" valor={formatCurrency(casa.gastos_total)} />
              <LinhaCasa label="Saldo" valor={formatCurrency(casa.saldo_casa)} />
              <LinhaCasa label="Minha parte" valor={formatCurrency(casa.minha_parte)} />
              <LinhaCasa label="Custeio" valor={`${casa.percentual_custeio}%`} />
            </View>
          ))}
        </View>
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

function OpcaoEixo({ label, ativo, onPress }: { label: string; ativo: boolean; onPress: () => void }) {
  const { hover, hoverProps } = useHover();

  return (
    <Pressable
      {...hoverProps}
      style={[styles.eixoOpcao, hover && !ativo && styles.eixoOpcaoHover, ativo && styles.eixoOpcaoAtiva]}
      onPress={onPress}
    >
      <Text style={[styles.eixoTexto, ativo && styles.eixoTextoAtivo]}>{label}</Text>
    </Pressable>
  );
}

function Alerta({
  tom,
  texto,
  onPress,
}: {
  tom: 'negativo' | 'positivo';
  texto: string;
  onPress: () => void;
}) {
  const { hover, hoverProps } = useHover();
  const negativo = tom === 'negativo';

  return (
    <Pressable
      {...hoverProps}
      style={[
        styles.alerta,
        { backgroundColor: negativo ? cores.negativoSuave : cores.positivoSuave },
        hover && styles.alertaHover,
      ]}
      onPress={onPress}
    >
      <Text style={[styles.alertaTexto, { color: negativo ? cores.negativo : cores.positivo }]}>
        {texto} ›
      </Text>
    </Pressable>
  );
}

function ResumoItem({
  label,
  valor,
  cor,
  card,
}: {
  label: string;
  valor: number;
  cor: string;
  card: boolean;
}) {
  return (
    <View style={card ? styles.resumoCard : styles.resumoLinha}>
      <Text style={styles.resumoLabel}>{label}</Text>
      <Text style={[styles.resumoValor, card && styles.resumoValorCard, { color: cor }]}>
        {formatCurrency(valor)}
      </Text>
    </View>
  );
}

function LinhaCasa({ label, valor }: { label: string; valor: string }) {
  return (
    <View style={styles.casaLinha}>
      <Text style={styles.casaLabel}>{label}</Text>
      <Text style={styles.casaValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center:             { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container:          { padding: 16, gap: 12 },

  cabecalho:          { gap: 12 },
  cabecalhoLargo:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  competenciaBotao:   { alignItems: 'center' },
  competencia:        { fontSize: 20, fontWeight: 'bold' },
  competenciaHint:    { fontSize: 12, color: cores.textoSuave, marginTop: 2 },

  eixoBloco:          { gap: 6 },
  eixoRow:            { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  eixoOpcao:          { borderWidth: 1, borderColor: cores.borda, borderRadius: raio.md, paddingVertical: 8, paddingHorizontal: 16 },
  eixoOpcaoHover:     { backgroundColor: cores.fundoHover },
  eixoOpcaoAtiva:     { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  eixoTexto:          { fontSize: 13, color: cores.textoMedio },
  eixoTextoAtivo:     { color: cores.primaria, fontWeight: '600' },
  eixoHint:           { fontSize: 12, color: cores.textoSuave, textAlign: 'center' },

  alerta:             { borderRadius: raio.md, padding: 12 },
  alertaHover:        { opacity: 0.85 },
  alertaTexto:        { fontWeight: '600', fontSize: 14, textAlign: 'center' },

  resumo:             { backgroundColor: cores.fundoSuave, borderRadius: raio.md, padding: 16, gap: 8 },
  // Some a caixa cinza: no desktop cada resumo vira seu próprio card.
  resumoGrid:         { backgroundColor: 'transparent', padding: 0, flexDirection: 'row', gap: 12 },
  resumoLinha:        { flexDirection: 'row', justifyContent: 'space-between' },
  resumoCard:         { flex: 1, backgroundColor: cores.fundoSuave, borderRadius: raio.md, padding: 14, gap: 4 },
  resumoLabel:        { fontSize: 14, color: cores.textoMedio },
  resumoValor:        { fontSize: 14, fontWeight: '600' },
  resumoValorCard:    { fontSize: 20 },

  secao:              { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  casasGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  casa:               { flexGrow: 1, flexBasis: 260, backgroundColor: cores.fundoSuave, borderRadius: raio.md, padding: 12, gap: 4 },
  casaNome:           { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  casaLinha:          { flexDirection: 'row', justifyContent: 'space-between' },
  casaLabel:          { fontSize: 13, color: cores.textoMedio },
  casaValor:          { fontSize: 13, color: cores.textoForte },
  vazio:              { color: cores.textoSuave, textAlign: 'center', fontStyle: 'italic', paddingVertical: 8 },
  error:              { color: cores.negativo, textAlign: 'center', padding: 16 },
});
