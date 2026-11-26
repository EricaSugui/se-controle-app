import { ReceitaEditor } from '@/src/components/domain/ReceitaEditor';
import { MonthPicker } from '@/src/components/ui/MonthPicker';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { IconeRecorrencia, MarcaRecorrencia } from '@/src/components/ui/MarcaRecorrencia';
import { CabecalhoDia, DetalhesLancamento, LinhaLancamento } from '@/src/components/ui/LancamentoCompacto';
import { agruparPorDia } from '@/src/utils/agruparPorDia';
import { useBreakpoint } from '@/src/hooks/useBreakpoint';
import { useHover } from '@/src/hooks/useHover';
import { deleteReceita, getReceitas, getReceitasPorData } from '@/src/services/api/receitas';
import { SeletorEixo, type Eixo } from '@/src/components/ui/SeletorEixo';
import { cores, raio } from '@/src/theme/tokens';
import type { Receita } from '@/src/types';
import { competenciaAtual, intervaloDaCompetencia } from '@/src/utils/competencia';
import { confirmar, notificar } from '@/src/utils/confirmar';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';

// Mesmo padrão da lista de Despesas (simetria): cards no celular, tabela com
// colunas ordenáveis no desktop e edição em painel lateral no desktop largo.
// A descrição é o campo `observacao` da API.

type CampoOrdenacao = 'data' | 'descricao' | 'origem' | 'pessoa' | 'valor';
type DirecaoOrdenacao = 'asc' | 'desc';

export default function ReceitasScreen() {
  // Competência e receita aberta vivem na URL, como em Despesas: o mês é
  // compartilhável por link, o voltar do browser funciona e trocar de linha
  // no painel lateral não remonta a lista.
  const params = useLocalSearchParams<{ competencia?: string; editar?: string; eixo?: string }>();
  const competencia = params.competencia || competenciaAtual();
  // Competência (padrão): receitas do mês a que pertencem. Caixa: o que
  // entrou no mês, pela data do recebimento.
  const eixo: Eixo = params.eixo === 'caixa' ? 'caixa' : 'competencia';
  const editandoId = params.editar ? Number(params.editar) : null;

  const [seletorVisivel, setSeletorVisivel] = useState(false);
  const [itens, setItens] = useState<Receita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenacao, setOrdenacao] = useState<{ campo: CampoOrdenacao; direcao: DirecaoOrdenacao }>({
    campo: 'data',
    direcao: 'desc',
  });
  const { compacto, painelDuplo } = useBreakpoint();
  const mostrandoPainel = painelDuplo && editandoId != null;

  const itensOrdenados = useMemo(() => ordenarReceitas(itens, ordenacao), [itens, ordenacao]);
  // Celular: grupos por dia (a ordenação por coluna é só da tabela).
  const grupos = useMemo(
    () => agruparPorDia(itens, (r) => r.data, (r) => r.valor_liquido, { relativo: competencia === competenciaAtual() }),
    [itens, competencia]
  );
  // Receita aberta na janela de detalhes (celular).
  const [detalhe, setDetalhe] = useState<Receita | null>(null);

  const vazio = (
    <EmptyState
      titulo={eixo === 'caixa' ? 'Nada entrou neste mês' : 'Nenhuma receita neste mês'}
      // Sem botão aqui: "+ Nova receita" já fica sempre visível (rodapé no
      // celular, topo no desktop).
      descricao={eixo === 'caixa'
        ? 'Nenhuma receita com data de recebimento neste mês.'
        : 'Use “+ Nova receita” para registrar a primeira.'}
    />
  );

  function alternarOrdenacao(campo: CampoOrdenacao) {
    setOrdenacao((atual) => {
      if (atual.campo === campo) {
        return { campo, direcao: atual.direcao === 'asc' ? 'desc' : 'asc' };
      }
      return { campo, direcao: campo === 'data' || campo === 'valor' ? 'desc' : 'asc' };
    });
  }

  function irPara(competenciaNova: string) {
    router.setParams({ competencia: competenciaNova });
  }

  function fecharPainel() {
    router.setParams({ editar: undefined });
  }

  const carregar = useCallback(() => {
    setLoading(true);
    setError(null);
    const { de, ate } = intervaloDaCompetencia(competencia);
    (eixo === 'caixa' ? getReceitasPorData(de, ate) : getReceitas(competencia))
      .then(setItens)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [competencia, eixo]);

  useFocusEffect(carregar);

  // Só o desktop largo edita no painel. Abaixo disso vai para a tela cheia,
  // que no celular é o único jeito de o gesto de voltar fechar o formulário.
  function editar(item: Receita) {
    if (painelDuplo) {
      router.setParams({ editar: String(item.id) });
      return;
    }
    router.push({ pathname: '/(app)/receitas/[id]', params: { id: item.id } });
  }

  function confirmarExcluir(item: Receita) {
    const nome = item.observacao || item.origem_nome;
    confirmar(
      {
        titulo: 'Excluir receita',
        mensagem: `Deseja excluir esta receita${nome ? ` (${nome})` : ''}? Esta ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir',
      },
      () => excluir(item.id)
    );
  }

  async function excluir(id: number) {
    try {
      await deleteReceita(id);
      // Excluir o que está aberto no painel deixaria um formulário órfão.
      if (editandoId === id) fecharPainel();
      carregar();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
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
    <View style={styles.container}>
      {/* No desktop a competência e o botão de nova receita dividem a linha;
          no celular o botão fica fixo no rodapé, ao alcance do polegar. */}
      <View style={[styles.cabecalho, !compacto && styles.cabecalhoLargo]}>
        <Pressable onPress={() => setSeletorVisivel(true)} style={styles.competenciaBotao}>
          <Text style={styles.competencia}>{competencia}</Text>
          <Text style={styles.competenciaHint}>▼ trocar mês</Text>
        </Pressable>

        <SeletorEixo
          eixo={eixo}
          onChange={(e) => router.setParams({ eixo: e === 'caixa' ? 'caixa' : undefined, editar: undefined })}
          dica={eixo === 'caixa'
            ? `Caixa: o que entrou em ${competencia}, pela data do recebimento`
            : 'Competência: receitas do mês a que pertencem'}
        />

        {!compacto && <BotaoNova />}
      </View>

      <View style={styles.corpo}>
        {compacto ? (
          // Celular: agrupado por dia, linha compacta; toque abre os detalhes.
          <SectionList
            sections={grupos}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.lista}
            stickySectionHeadersEnabled={false}
            ListEmptyComponent={vazio}
            renderSectionHeader={({ section }) => (
              <CabecalhoDia titulo={section.titulo} total={section.total} cor={cores.positivo} />
            )}
            renderItem={({ item }) => (
              <LinhaLancamento
                titulo={item.observacao || item.origem_nome || 'Sem descrição'}
                subtitulo={[item.observacao ? item.origem_nome : null, item.pessoa_nome].filter(Boolean).join(' · ')}
                valor={item.valor_liquido}
                cor={cores.positivo}
                recorrente={item.receita_fixa_id != null}
                onPress={() => setDetalhe(item)}
              />
            )}
          />
        ) : (
          <FlatList
            data={itensOrdenados}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.tabela}
            ListHeaderComponent={
              itensOrdenados.length === 0 ? null : (
                <CabecalhoTabela ordenacao={ordenacao} onOrdenar={alternarOrdenacao} />
              )
            }
            ListEmptyComponent={vazio}
            renderItem={({ item }: { item: Receita }) => (
              <LinhaTabela
                item={item}
                selecionado={item.id === editandoId}
                onEditar={() => editar(item)}
                onExcluir={() => confirmarExcluir(item)}
              />
            )}
          />
        )}

        {mostrandoPainel && (
          <View style={styles.painel}>
            <View style={styles.painelCabecalho}>
              <Text style={styles.painelTitulo}>Editar receita</Text>
              <Pressable onPress={fecharPainel} style={styles.painelFechar}>
                <Text style={styles.painelFecharTexto}>✕</Text>
              </Pressable>
            </View>
            {/* key: trocar de linha remonta o editor, senão o formulário
                ficaria com o estado da receita anterior enquanto carrega. */}
            <ReceitaEditor
              key={editandoId}
              id={editandoId!}
              onSalvo={() => {
                fecharPainel();
                carregar();
              }}
            />
          </View>
        )}
      </View>

      {compacto && (
        <View style={styles.rodape}>
          <BotaoNova />
        </View>
      )}

      <MonthPicker
        visivel={seletorVisivel}
        valor={competencia}
        onSelecionar={irPara}
        onFechar={() => setSeletorVisivel(false)}
      />

      {detalhe && (
        <DetalhesLancamento
          visivel
          titulo={detalhe.observacao || detalhe.origem_nome || 'Receita'}
          valor={detalhe.valor_liquido}
          cor={cores.positivo}
          marca={detalhe.receita_fixa_id != null ? (
            <MarcaRecorrencia tipo="receita" referencia={detalhe.competencia_referencia} competencia={detalhe.competencia} />
          ) : undefined}
          linhas={[
            { rotulo: 'Data', valor: detalhe.data ? formatDate(detalhe.data) : '—' },
            { rotulo: 'Origem', valor: detalhe.origem_nome || '—' },
            { rotulo: 'Quem recebeu', valor: detalhe.pessoa_nome || '—' },
            ...(detalhe.valor_bruto != null
              ? [{ rotulo: 'Valor bruto', valor: formatCurrency(detalhe.valor_bruto) }]
              : []),
            ...(detalhe.descontos != null
              ? [{ rotulo: 'Descontos', valor: formatCurrency(detalhe.descontos) }]
              : []),
            { rotulo: 'Competência', valor: detalhe.competencia || '—' },
          ]}
          podeEditar={detalhe.pode_editar}
          onEditar={() => { const item = detalhe; setDetalhe(null); editar(item); }}
          onExcluir={() => { const item = detalhe; setDetalhe(null); confirmarExcluir(item); }}
          onFechar={() => setDetalhe(null)}
        />
      )}
    </View>
  );
}

function BotaoNova() {
  const { hover, hoverProps } = useHover();

  return (
    <Pressable
      {...hoverProps}
      style={[styles.botaoNova, hover && styles.botaoNovaHover]}
      onPress={() => router.push('/(app)/receitas/novo')}
    >
      <Text style={styles.botaoNovaTexto}>+ Nova receita</Text>
    </Pressable>
  );
}

function CabecalhoTabela({
  ordenacao,
  onOrdenar,
}: {
  ordenacao: { campo: CampoOrdenacao; direcao: DirecaoOrdenacao };
  onOrdenar: (campo: CampoOrdenacao) => void;
}) {
  return (
    <View style={styles.thead}>
      <CabecalhoOrdenavel label="Data" campo="data" estiloColuna={COL.data} ordenacao={ordenacao} onOrdenar={onOrdenar} />
      <CabecalhoOrdenavel label="Descrição" campo="descricao" estiloColuna={COL.descricao} ordenacao={ordenacao} onOrdenar={onOrdenar} />
      <CabecalhoOrdenavel label="Origem" campo="origem" estiloColuna={COL.origem} ordenacao={ordenacao} onOrdenar={onOrdenar} />
      <CabecalhoOrdenavel label="Quem recebeu" campo="pessoa" estiloColuna={COL.pessoa} ordenacao={ordenacao} onOrdenar={onOrdenar} />
      <CabecalhoOrdenavel
        label="Valor"
        campo="valor"
        estiloColuna={[COL.valor, styles.thDireita]}
        ordenacao={ordenacao}
        onOrdenar={onOrdenar}
      />
      <View style={COL.acoes} />
    </View>
  );
}

function CabecalhoOrdenavel({
  label,
  campo,
  estiloColuna,
  ordenacao,
  onOrdenar,
}: {
  label: string;
  campo: CampoOrdenacao;
  estiloColuna: object;
  ordenacao: { campo: CampoOrdenacao; direcao: DirecaoOrdenacao };
  onOrdenar: (campo: CampoOrdenacao) => void;
}) {
  const selecionado = ordenacao.campo === campo;
  const seta = selecionado ? (ordenacao.direcao === 'asc' ? ' ▲' : ' ▼') : '';

  return (
    <Pressable onPress={() => onOrdenar(campo)} style={estiloColuna} accessibilityRole="button">
      <Text style={[styles.th, selecionado && styles.thAtivo]}>{`${label}${seta}`}</Text>
    </Pressable>
  );
}

function ordenarReceitas(itens: Receita[], ordenacao: { campo: CampoOrdenacao; direcao: DirecaoOrdenacao }) {
  const fator = ordenacao.direcao === 'asc' ? 1 : -1;

  return [...itens].sort((a, b) => {
    let comparacao = 0;

    switch (ordenacao.campo) {
      case 'data':
        // receita sem data vai para o fim na ordem decrescente
        comparacao = compararTexto(a.data || '', b.data || '');
        break;
      case 'descricao':
        comparacao = compararTexto(a.observacao || '', b.observacao || '');
        break;
      case 'origem':
        comparacao = compararTexto(a.origem_nome || '', b.origem_nome || '');
        break;
      case 'pessoa':
        comparacao = compararTexto(a.pessoa_nome || '', b.pessoa_nome || '');
        break;
      case 'valor':
        comparacao = a.valor_liquido - b.valor_liquido;
        break;
    }

    if (comparacao === 0) {
      comparacao = a.id - b.id;
    }

    return comparacao * fator;
  });
}

function compararTexto(a: string, b: string) {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

function LinhaTabela({
  item,
  selecionado,
  onEditar,
  onExcluir,
}: {
  item: Receita;
  selecionado: boolean;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const { hover, hoverProps } = useHover();

  return (
    <View {...hoverProps} style={[styles.tr, hover && styles.trHover, selecionado && styles.trSelecionada]}>
      <Text style={[styles.td, COL.data]}>{item.data ? formatDate(item.data) : '—'}</Text>
      <Text style={[styles.td, styles.tdForte, COL.descricao]} numberOfLines={1}>
        {item.receita_fixa_id != null && <IconeRecorrencia />}
        {item.observacao || '—'}
      </Text>
      <Text style={[styles.td, COL.origem]} numberOfLines={1}>
        {item.origem_nome || '—'}
      </Text>
      <Text style={[styles.td, COL.pessoa]} numberOfLines={1}>
        {item.pessoa_nome || '—'}
      </Text>

      <View style={COL.valor}>
        <Text style={styles.tdValor}>{formatCurrency(item.valor_liquido)}</Text>
      </View>

      <View style={[COL.acoes, styles.acoes]}>
        {item.pode_editar && (
          <>
            <AcaoTexto label="Editar" cor={cores.primaria} onPress={onEditar} />
            <AcaoTexto label="Excluir" cor={cores.negativo} onPress={onExcluir} />
          </>
        )}
      </View>
    </View>
  );
}

function AcaoTexto({ label, cor, onPress }: { label: string; cor: string; onPress: () => void }) {
  const { hover, hoverProps } = useHover();

  return (
    <Pressable {...hoverProps} onPress={onPress}>
      <Text style={[styles.acaoTexto, { color: cor }, hover && styles.acaoTextoHover]}>{label}</Text>
    </Pressable>
  );
}

// Larguras compartilhadas entre o cabeçalho e as linhas — se divergirem, as
// colunas desalinham.
const COL = StyleSheet.create({
  data:      { width: 92 },
  descricao: { flex: 2, minWidth: 110 },
  origem:    { flex: 1, minWidth: 80 },
  pessoa:    { flex: 1, minWidth: 80 },
  valor:     { width: 150, alignItems: 'flex-end' },
  acoes:     { width: 118 },
});

const styles = StyleSheet.create({
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:         { flex: 1 },

  cabecalho:         { paddingTop: 16, paddingHorizontal: 16, gap: 10 },
  cabecalhoLargo:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  competenciaBotao:  { alignItems: 'center' },
  competencia:       { fontSize: 18, fontWeight: 'bold' },
  competenciaHint:   { fontSize: 12, color: cores.textoSuave, marginTop: 2 },

  corpo:             { flex: 1, flexDirection: 'row' },
  lista:             { paddingHorizontal: 16, paddingBottom: 16, flexGrow: 1 },
  tabela:            { padding: 16, flexGrow: 1 },

  painel:            { width: 420, borderLeftWidth: 1, borderLeftColor: cores.bordaSuave, backgroundColor: cores.fundo },
  painelCabecalho:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 },
  painelTitulo:      { fontSize: 15, fontWeight: '600' },
  painelFechar:      { padding: 6 },
  painelFecharTexto: { fontSize: 16, color: cores.textoSuave },

  // Tabela (desktop)
  thead:             { flexDirection: 'row', gap: 12, paddingHorizontal: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: cores.bordaSuave },
  th:                { fontSize: 12, fontWeight: '600', color: cores.textoSuave, textTransform: 'uppercase', letterSpacing: 0.4 },
  thAtivo:           { color: cores.primaria },
  thDireita:         { textAlign: 'right' },
  tr:                { flexDirection: 'row', gap: 12, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: raio.md, borderBottomWidth: 1, borderBottomColor: cores.bordaSuave },
  trHover:           { backgroundColor: cores.fundoHover },
  trSelecionada:     { backgroundColor: cores.primariaSuave },
  td:                { fontSize: 13, color: cores.textoMedio },
  tdForte:           { color: cores.textoForte, fontWeight: '500' },
  tdValor:           { fontSize: 14, fontWeight: '600', color: cores.positivo },

  acoes:             { flexDirection: 'row', gap: 16 },
  acaoTexto:         { fontSize: 14 },
  acaoTextoHover:    { textDecorationLine: 'underline' },

  rodape:            { padding: 16 },
  botaoNova:         { backgroundColor: cores.primaria, borderRadius: raio.md, paddingVertical: 12, paddingHorizontal: 18, alignItems: 'center' },
  botaoNovaHover:    { opacity: 0.9 },
  botaoNovaTexto:    { color: cores.textoInverso, fontWeight: '600', fontSize: 15 },

  erro:              { color: cores.negativo, textAlign: 'center', padding: 16 },
  retry:             { padding: 10 },
  retryTexto:        { color: cores.primaria },
});
