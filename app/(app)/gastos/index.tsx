import { CompraEditor } from '@/src/components/domain/CompraEditor';
import { MonthPicker } from '@/src/components/ui/MonthPicker';
import { useBreakpoint } from '@/src/hooks/useBreakpoint';
import { useHover } from '@/src/hooks/useHover';
import { deleteCompra, getCompras } from '@/src/services/api/compras';
import { cores, raio } from '@/src/theme/tokens';
import type { Compra } from '@/src/types';
import { competenciaAtual } from '@/src/utils/competencia';
import { confirmar, notificar } from '@/src/utils/confirmar';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

type CampoOrdenacao = 'data' | 'descricao' | 'categoria' | 'pessoa' | 'cartao' | 'valor';
type DirecaoOrdenacao = 'asc' | 'desc';

export default function GastosScreen() {
  // Competência e gasto aberto vivem na URL, não em useState: assim o mês
  // é compartilhável por link, o voltar do browser funciona, e trocar de
  // linha no painel lateral não remonta a lista.
  const params = useLocalSearchParams<{ competencia?: string; editar?: string }>();
  const competencia = params.competencia || competenciaAtual();
  const editandoId = params.editar ? Number(params.editar) : null;

  const [seletorVisivel, setSeletorVisivel] = useState(false);
  const [itens, setItens] = useState<Compra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Os 4 campos de cada card já são colunas querendo existir; acima de
  // 768px eles viram tabela de verdade.
  const [ordenacao, setOrdenacao] = useState<{ campo: CampoOrdenacao; direcao: DirecaoOrdenacao }>({
    campo: 'data',
    direcao: 'desc',
  });
  const { compacto, painelDuplo } = useBreakpoint();
  const mostrandoPainel = painelDuplo && editandoId != null;

  const itensOrdenados = useMemo(() => ordenarCompras(itens, ordenacao), [itens, ordenacao]);

  function alternarOrdenacao(campo: CampoOrdenacao) {
    setOrdenacao((atual) => {
      if (atual.campo === campo) {
        return { campo, direcao: atual.direcao === 'asc' ? 'desc' : 'asc' };
      }

      return {
        campo,
        direcao: campo === 'data' || campo === 'valor' ? 'desc' : 'asc',
      };
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
    getCompras(competencia)
      .then(setItens)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [competencia]);

  useFocusEffect(carregar);

  // Só o desktop largo edita no painel. Abaixo disso vai para a tela cheia,
  // que no celular é o único jeito de o gesto de voltar fechar o formulário
  // (setParams não empilha no navegador nativo).
  function editar(item: Compra) {
    if (painelDuplo) {
      router.setParams({ editar: String(item.id) });
      return;
    }
    router.push({ pathname: '/(app)/gastos/[id]', params: { id: item.id } });
  }

  function confirmarExcluir(item: Compra) {
    confirmar(
      {
        titulo: 'Excluir compra',
        mensagem: `Deseja excluir esta compra${item.descricao ? ` (${item.descricao})` : ''}? Todas as parcelas serão removidas.`,
        textoConfirmar: 'Excluir',
      },
      () => excluir(item.id)
    );
  }

  async function excluir(id: number) {
    try {
      await deleteCompra(id);
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
      {/* No desktop a competência e o botão de nova compra dividem a linha;
          no celular o botão continua fixo no rodapé, ao alcance do polegar. */}
      <View style={[styles.cabecalho, !compacto && styles.cabecalhoLargo]}>
        <Pressable onPress={() => setSeletorVisivel(true)} style={styles.competenciaBotao}>
          <Text style={styles.competencia}>{competencia}</Text>
          <Text style={styles.competenciaHint}>▼ trocar mês</Text>
        </Pressable>

        {!compacto && <BotaoNova />}
      </View>

      <View style={styles.corpo}>
        <FlatList
          data={itensOrdenados}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={compacto ? styles.lista : styles.tabela}
          ListHeaderComponent={
            compacto || itensOrdenados.length === 0 ? null : (
              <CabecalhoTabela ordenacao={ordenacao} onOrdenar={alternarOrdenacao} />
            )
          }
          ListEmptyComponent={<Text style={styles.vazio}>Nenhuma compra nesta competência.</Text>}
          renderItem={({ item }: { item: Compra }) =>
            compacto ? (
              <CardGasto item={item} onEditar={() => editar(item)} onExcluir={() => confirmarExcluir(item)} />
            ) : (
              <LinhaTabela
                item={item}
                selecionado={item.id === editandoId}
                onEditar={() => editar(item)}
                onExcluir={() => confirmarExcluir(item)}
              />
            )
          }
        />

        {mostrandoPainel && (
          <View style={styles.painel}>
            <View style={styles.painelCabecalho}>
              <Text style={styles.painelTitulo}>Editar compra</Text>
              <Pressable onPress={fecharPainel} style={styles.painelFechar}>
                <Text style={styles.painelFecharTexto}>✕</Text>
              </Pressable>
            </View>
            {/* key: trocar de linha remonta o editor, senão o formulário
                ficaria com o estado da compra anterior enquanto carrega. */}
            <CompraEditor
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
    </View>
  );
}

function BotaoNova() {
  const { hover, hoverProps } = useHover();

  return (
    <Pressable
      {...hoverProps}
      style={[styles.botaoNova, hover && styles.botaoNovaHover]}
      onPress={() => router.push('/(app)/gastos/novo')}
    >
      <Text style={styles.botaoNovaTexto}>+ Nova compra</Text>
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
      <CabecalhoOrdenavel
        label="Data"
        campo="data"
        estiloColuna={COL.data}
        ordenacao={ordenacao}
        onOrdenar={onOrdenar}
      />
      <CabecalhoOrdenavel
        label="Descrição"
        campo="descricao"
        estiloColuna={COL.descricao}
        ordenacao={ordenacao}
        onOrdenar={onOrdenar}
      />
      <CabecalhoOrdenavel
        label="Categoria"
        campo="categoria"
        estiloColuna={COL.categoria}
        ordenacao={ordenacao}
        onOrdenar={onOrdenar}
      />
      <CabecalhoOrdenavel
        label="Pessoa"
        campo="pessoa"
        estiloColuna={COL.pessoa}
        ordenacao={ordenacao}
        onOrdenar={onOrdenar}
      />
      <CabecalhoOrdenavel
        label="Cartão/conta"
        campo="cartao"
        estiloColuna={COL.cartao}
        ordenacao={ordenacao}
        onOrdenar={onOrdenar}
      />
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

function ordenarCompras(itens: Compra[], ordenacao: { campo: CampoOrdenacao; direcao: DirecaoOrdenacao }) {
  const fator = ordenacao.direcao === 'asc' ? 1 : -1;

  return [...itens].sort((a, b) => {
    let comparacao = 0;

    switch (ordenacao.campo) {
      case 'data':
        comparacao = compararTexto(a.data, b.data);
        break;
      case 'descricao':
        comparacao = compararTexto(a.descricao || '', b.descricao || '');
        break;
      case 'categoria':
        comparacao = compararTexto(a.categoria_nome || '', b.categoria_nome || '');
        break;
      case 'pessoa':
        comparacao = compararTexto(a.pessoa_nome || '', b.pessoa_nome || '');
        break;
      case 'cartao':
        comparacao = compararTexto(a.cartao_conta_nome || '', b.cartao_conta_nome || '');
        break;
      case 'valor':
        comparacao = compararNumero(a.valor_parcela * a.total_parcelas, b.valor_parcela * b.total_parcelas);
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

function compararNumero(a: number, b: number) {
  return a - b;
}

function LinhaTabela({
  item,
  selecionado,
  onEditar,
  onExcluir,
}: {
  item: Compra;
  selecionado: boolean;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const { hover, hoverProps } = useHover();

  return (
    <View {...hoverProps} style={[styles.tr, hover && styles.trHover, selecionado && styles.trSelecionada]}>
      <Text style={[styles.td, COL.data]}>{formatDate(item.data)}</Text>
      <Text style={[styles.td, styles.tdForte, COL.descricao]} numberOfLines={1}>
        {item.descricao || '—'}
      </Text>
      <Text style={[styles.td, COL.categoria]} numberOfLines={1}>
        {item.categoria_nome || '—'}
      </Text>
      <Text style={[styles.td, COL.pessoa]} numberOfLines={1}>
        {item.pessoa_nome || '—'}
      </Text>
      <Text style={[styles.td, COL.cartao]} numberOfLines={1}>
        {item.cartao_conta_nome || '—'}
      </Text>

      <View style={COL.valor}>
        <Text style={styles.tdValor}>{formatCurrency(item.valor_parcela * item.total_parcelas)}</Text>
        {item.total_parcelas > 1 && (
          <Text style={styles.tdParcelas}>
            {`${item.total_parcelas}x de ${formatCurrency(item.valor_parcela)}`}
          </Text>
        )}
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

function CardGasto({
  item,
  onEditar,
  onExcluir,
}: {
  item: Compra;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  return (
    <View style={styles.item}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemValor}>
          {formatCurrency(item.valor_parcela * item.total_parcelas)}
          {item.total_parcelas > 1 && (
            <Text style={styles.itemParcelas}>{`  · ${item.total_parcelas}x de ${formatCurrency(item.valor_parcela)}`}</Text>
          )}
        </Text>
        <Text style={styles.itemDetalhe}>{item.descricao || item.categoria_nome || 'Sem descrição'}</Text>
        {(item.pessoa_nome || item.cartao_conta_nome) && (
          <Text style={styles.itemMeta}>
            {[item.pessoa_nome, item.cartao_conta_nome].filter(Boolean).join(' · ')}
          </Text>
        )}
        <Text style={styles.itemData}>{formatDate(item.data)}</Text>
      </View>
      {item.pode_editar && (
        <View style={styles.acoes}>
          <AcaoTexto label="Editar" cor={cores.primaria} onPress={onEditar} />
          <AcaoTexto label="Excluir" cor={cores.negativo} onPress={onExcluir} />
        </View>
      )}
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
  categoria: { flex: 1, minWidth: 80 },
  pessoa:    { flex: 1, minWidth: 80 },
  cartao:    { flex: 1, minWidth: 80 },
  valor:     { width: 150, alignItems: 'flex-end' },
  acoes:     { width: 118 },
});

const styles = StyleSheet.create({
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:         { flex: 1 },

  cabecalho:         { paddingTop: 16, paddingHorizontal: 16 },
  cabecalhoLargo:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  competenciaBotao:  { alignItems: 'center' },
  competencia:       { fontSize: 18, fontWeight: 'bold' },
  competenciaHint:   { fontSize: 12, color: cores.textoSuave, marginTop: 2 },

  corpo:             { flex: 1, flexDirection: 'row' },
  lista:             { padding: 16, gap: 8, flexGrow: 1 },
  tabela:            { padding: 16, flexGrow: 1 },
  vazio:             { textAlign: 'center', color: cores.textoSuave, marginTop: 32 },

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
  tdValor:           { fontSize: 14, fontWeight: '600', color: cores.negativo },
  tdParcelas:        { fontSize: 11, color: cores.textoSuave, marginTop: 2 },

  // Cards (mobile)
  item:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: cores.fundoSuave, borderRadius: raio.md, padding: 14 },
  itemInfo:          { flex: 1 },
  itemValor:         { fontSize: 16, fontWeight: '600', color: cores.negativo },
  itemParcelas:      { fontSize: 13, fontWeight: '400', color: cores.textoSuave },
  itemDetalhe:       { fontSize: 13, color: cores.textoMedio, marginTop: 2 },
  itemMeta:          { fontSize: 12, color: cores.textoSuave, marginTop: 2 },
  itemData:          { fontSize: 12, color: cores.textoSuave, marginTop: 2 },

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
