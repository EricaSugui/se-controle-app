import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MonthPicker, competenciaParaData, dataParaCompetencia } from '@/src/components/ui/MonthPicker';
import { GastosMensalChart } from '@/src/components/domain/GastosMensalChart';
import { getRelatorioGastos } from '@/src/services/api/relatorios';
import { getDashboard } from '@/src/services/api/dashboard';
import { formatCurrency } from '@/src/utils/formatters';
import { competenciaAtual } from '@/src/utils/competencia';
import type { CasaDashboard, EixoAcerto, LinhaRelatorioGastos, RelatorioGastos } from '@/src/types';

const EIXOS: { valor: EixoAcerto; label: string }[] = [
  { valor: 'competencia', label: 'Competência' },
  { valor: 'caixa', label: 'Caixa' },
];

const HINT_EIXO: Record<EixoAcerto, string> = {
  competencia: 'Para onde foi o dinheiro: compra parcelada entra inteira no mês da compra.',
  caixa: 'O que sai do bolso: cada parcela entra no mês em que é paga.',
};

function indiceCompetencia(competencia: string): number {
  const { mes, ano } = competenciaParaData(competencia);
  return ano * 12 + mes;
}

function competenciaMesesAtras(n: number): string {
  const hoje = new Date();
  const d = new Date(hoje.getFullYear(), hoje.getMonth() - n, 1);
  return dataParaCompetencia(d.getMonth(), d.getFullYear());
}

function mesesDoIntervalo(de: string, ate: string): string[] {
  const meses: string[] = [];
  for (let i = indiceCompetencia(de); i <= indiceCompetencia(ate); i++) {
    meses.push(dataParaCompetencia(i % 12, Math.floor(i / 12)));
  }
  return meses;
}

type Grupo = { id: number; nome: string; icone?: string; cor?: string; total: number };

function agrupar(
  linhas: LinhaRelatorioGastos[],
  chave: (l: LinhaRelatorioGastos) => Grupo
): Grupo[] {
  const grupos = new Map<number, Grupo>();
  for (const linha of linhas) {
    const g = chave(linha);
    const atual = grupos.get(g.id);
    if (atual) atual.total += linha.total;
    else grupos.set(g.id, g);
  }
  return [...grupos.values()].sort((a, b) => b.total - a.total);
}

export default function RelatorioGastosScreen() {
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [casaId, setCasaId] = useState<number | null>(null);
  const [de, setDe] = useState(() => competenciaMesesAtras(5));
  const [ate, setAte] = useState(competenciaAtual);
  const [eixo, setEixo] = useState<EixoAcerto>('competencia');
  const [seletorDeVisivel, setSeletorDeVisivel] = useState(false);
  const [seletorAteVisivel, setSeletorAteVisivel] = useState(false);

  const [relatorio, setRelatorio] = useState<RelatorioGastos | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filtros derivados client-side sobre a matriz
  const [pessoaFiltroId, setPessoaFiltroId] = useState<number | null>(null);
  const [mesSelecionado, setMesSelecionado] = useState<string | null>(null);
  const [categoriaExpandidaId, setCategoriaExpandidaId] = useState<number | null>(null);

  const periodoInvalido = indiceCompetencia(de) > indiceCompetencia(ate);

  useFocusEffect(
    useCallback(() => {
      getDashboard(competenciaAtual()).then((d) => setCasas(d.casas)).catch(() => {});
    }, [])
  );

  useEffect(() => {
    if (casas.length > 0 && casaId === null) setCasaId(casas[0].id);
  }, [casas, casaId]);

  const carregar = useCallback(() => {
    if (casaId == null || periodoInvalido) return;
    setLoading(true);
    setError(null);
    setMesSelecionado(null);
    setCategoriaExpandidaId(null);
    setPessoaFiltroId(null);
    getRelatorioGastos(casaId, { de, ate, eixo })
      .then(setRelatorio)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [casaId, de, ate, eixo, periodoInvalido]);

  useFocusEffect(carregar);

  const linhas = relatorio?.linhas ?? [];
  const pessoas = agrupar(linhas, (l) => ({ id: l.pessoa_id, nome: l.pessoa_nome, total: l.total }));

  const linhasDaPessoa = pessoaFiltroId == null ? linhas : linhas.filter((l) => l.pessoa_id === pessoaFiltroId);
  const linhasVisiveis = mesSelecionado == null ? linhasDaPessoa : linhasDaPessoa.filter((l) => l.mes === mesSelecionado);

  // evolução: todos os meses do intervalo, zero quando não há gasto
  const serieMensal = relatorio
    ? mesesDoIntervalo(relatorio.de, relatorio.ate).map((mes) => ({
        mes,
        total: linhasDaPessoa.filter((l) => l.mes === mes).reduce((soma, l) => soma + l.total, 0),
      }))
    : [];

  const totalVisivel = linhasVisiveis.reduce((soma, l) => soma + l.total, 0);

  const porCategoria = agrupar(linhasVisiveis, (l) => ({
    id: l.categoria_id,
    nome: l.categoria_nome,
    icone: l.categoria_icone,
    cor: l.categoria_cor,
    total: l.total,
  }));
  const maiorCategoria = porCategoria[0]?.total ?? 0;

  const porPessoaVisivel = agrupar(
    mesSelecionado == null ? linhas : linhas.filter((l) => l.mes === mesSelecionado),
    (l) => ({ id: l.pessoa_id, nome: l.pessoa_nome, total: l.total })
  );
  const totalTodasPessoas = porPessoaVisivel.reduce((soma, g) => soma + g.total, 0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {casas.length > 1 && (
        <View style={styles.chipsRow}>
          {casas.map((c) => (
            <Pressable
              key={c.id}
              style={[styles.chip, casaId === c.id && styles.chipAtivo]}
              onPress={() => setCasaId(c.id)}
            >
              <Text style={[styles.chipTexto, casaId === c.id && styles.chipTextoAtivo]}>{c.nome}</Text>
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
        <View style={styles.eixoBox}>
          {EIXOS.map((e) => (
            <Pressable
              key={e.valor}
              style={[styles.chip, eixo === e.valor && styles.chipAtivo]}
              onPress={() => setEixo(e.valor)}
            >
              <Text style={[styles.chipTexto, eixo === e.valor && styles.chipTextoAtivo]}>{e.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Text style={styles.hint}>{HINT_EIXO[eixo]}</Text>

      {periodoInvalido ? (
        <Text style={styles.periodoInvalido}>Período inválido: o mês inicial vem depois do final.</Text>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.erro}>{error}</Text>
          <Pressable onPress={carregar} style={styles.retry}>
            <Text style={styles.retryTexto}>Tentar novamente</Text>
          </Pressable>
        </View>
      ) : loading || relatorio == null ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : linhas.length === 0 ? (
        <Text style={styles.vazio}>Nenhum gasto no período.</Text>
      ) : (
        <>
          {pessoas.length > 1 && (
            <View style={styles.chipsRow}>
              <Pressable
                style={[styles.chip, pessoaFiltroId === null && styles.chipAtivo]}
                onPress={() => setPessoaFiltroId(null)}
              >
                <Text style={[styles.chipTexto, pessoaFiltroId === null && styles.chipTextoAtivo]}>Todas</Text>
              </Pressable>
              {pessoas.map((p) => (
                <Pressable
                  key={p.id}
                  style={[styles.chip, pessoaFiltroId === p.id && styles.chipAtivo]}
                  onPress={() => setPessoaFiltroId(pessoaFiltroId === p.id ? null : p.id)}
                >
                  <Text style={[styles.chipTexto, pessoaFiltroId === p.id && styles.chipTextoAtivo]}>
                    {p.nome}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <Text style={styles.totalValor}>{formatCurrency(totalVisivel)}</Text>
          <Text style={styles.totalLegenda}>
            {mesSelecionado ?? `${relatorio.de} a ${relatorio.ate}`}
            {pessoaFiltroId != null ? ` · ${pessoas.find((p) => p.id === pessoaFiltroId)?.nome}` : ''}
          </Text>

          <GastosMensalChart
            dados={serieMensal}
            mesSelecionado={mesSelecionado}
            onSelecionarMes={setMesSelecionado}
          />
          {mesSelecionado != null ? (
            <Pressable onPress={() => setMesSelecionado(null)}>
              <Text style={styles.limparFiltro}>Mostrando só {mesSelecionado} — ver período todo ✕</Text>
            </Pressable>
          ) : (
            <Text style={styles.hint}>Toque numa barra para ver só aquele mês.</Text>
          )}

          <Text style={styles.secaoTitulo}>Por categoria</Text>
          {porCategoria.length === 0 && <Text style={styles.vazio}>Nenhum gasto com esses filtros.</Text>}
          {porCategoria.map((cat) => {
            const expandida = categoriaExpandidaId === cat.id;
            const pessoasDaCategoria = agrupar(
              linhasVisiveis.filter((l) => l.categoria_id === cat.id),
              (l) => ({ id: l.pessoa_id, nome: l.pessoa_nome, total: l.total })
            );
            return (
              <View key={cat.id} style={styles.catCard}>
                <Pressable
                  style={styles.catLinha}
                  onPress={() => setCategoriaExpandidaId(expandida ? null : cat.id)}
                >
                  <View style={[styles.catCirculo, { backgroundColor: cat.cor ?? '#9E9E9E' }]}>
                    <MaterialCommunityIcons name={(cat.icone ?? 'dots-horizontal-circle-outline') as never} size={16} color="#fff" />
                  </View>
                  <View style={styles.catInfo}>
                    <View style={styles.catTopo}>
                      <Text style={styles.catNome} numberOfLines={1}>{cat.nome}</Text>
                      <Text style={styles.catTotal}>{formatCurrency(cat.total)}</Text>
                    </View>
                    <View style={styles.catBarraFundo}>
                      <View
                        style={[
                          styles.catBarra,
                          {
                            backgroundColor: cat.cor ?? '#9E9E9E',
                            width: `${maiorCategoria > 0 ? (cat.total / maiorCategoria) * 100 : 0}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <MaterialCommunityIcons name={expandida ? 'chevron-up' : 'chevron-down'} size={20} color="#999" />
                </Pressable>

                {expandida && pessoasDaCategoria.map((p) => (
                  <View key={p.id} style={styles.catPessoaLinha}>
                    <Text style={styles.catPessoaNome}>{p.nome}</Text>
                    <Text style={styles.catPessoaTotal}>
                      {formatCurrency(p.total)}
                      <Text style={styles.catPessoaShare}>
                        {'  '}{cat.total > 0 ? Math.round((p.total / cat.total) * 100) : 0}%
                      </Text>
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}

          {pessoaFiltroId === null && porPessoaVisivel.length > 1 && (
            <>
              <Text style={styles.secaoTitulo}>Por pessoa</Text>
              {porPessoaVisivel.map((p) => (
                <Pressable key={p.id} style={styles.pessoaLinha} onPress={() => setPessoaFiltroId(p.id)}>
                  <Text style={styles.pessoaNome}>{p.nome}</Text>
                  <Text style={styles.pessoaTotal}>
                    {formatCurrency(p.total)}
                    <Text style={styles.catPessoaShare}>
                      {'  '}{totalTodasPessoas > 0 ? Math.round((p.total / totalTodasPessoas) * 100) : 0}%
                    </Text>
                  </Text>
                </Pressable>
              ))}
            </>
          )}
        </>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { padding: 16, gap: 8 },
  center:           { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 12 },

  chipsRow:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:             { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  chipAtivo:        { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  chipTexto:        { fontSize: 13, color: '#555' },
  chipTextoAtivo:   { color: '#1565c0', fontWeight: '600' },

  periodoRow:       { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 4 },
  periodoBotao:     { alignItems: 'center' },
  periodoLabel:     { fontSize: 12, color: '#888' },
  periodoValor:     { fontSize: 15, fontWeight: '600', marginTop: 2 },
  eixoBox:          { flexDirection: 'row', gap: 8, marginLeft: 'auto' },

  periodoInvalido:  { color: '#c62828', textAlign: 'center', marginTop: 24 },
  hint:             { fontSize: 12, color: '#999' },

  totalValor:       { fontSize: 28, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  totalLegenda:     { fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 4 },

  limparFiltro:     { color: '#1565c0', fontSize: 13, fontWeight: '600', textAlign: 'center', paddingVertical: 4 },

  secaoTitulo:      { fontSize: 14, fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16 },
  vazio:            { color: '#888', textAlign: 'center', fontStyle: 'italic', paddingVertical: 16 },

  catCard:          { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, gap: 6 },
  catLinha:         { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catCirculo:       { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  catInfo:          { flex: 1, gap: 4 },
  catTopo:          { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  catNome:          { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  catTotal:         { fontSize: 14, fontWeight: '600' },
  catBarraFundo:    { height: 6, borderRadius: 3, backgroundColor: '#e0e0e0', overflow: 'hidden' },
  catBarra:         { height: 6, borderRadius: 3 },

  catPessoaLinha:   { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 40, paddingRight: 30 },
  catPessoaNome:    { fontSize: 13, color: '#555' },
  catPessoaTotal:   { fontSize: 13, color: '#333', fontWeight: '500' },
  catPessoaShare:   { fontSize: 12, color: '#999', fontWeight: '400' },

  pessoaLinha:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12 },
  pessoaNome:       { fontSize: 14, fontWeight: '500' },
  pessoaTotal:      { fontSize: 14, fontWeight: '600' },

  erro:             { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:            { padding: 10 },
  retryTexto:       { color: '#1565c0' },
});
