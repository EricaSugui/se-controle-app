import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { MonthPicker } from '@/src/components/ui/MonthPicker';
import { CompraEditor } from '@/src/components/domain/CompraEditor';
import { useBreakpoint } from '@/src/hooks/useBreakpoint';
import { useHover } from '@/src/hooks/useHover';
import { deleteCompra, getCompras } from '@/src/services/api/compras';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import { competenciaAtual } from '@/src/utils/competencia';
import { confirmar, notificar } from '@/src/utils/confirmar';
import { cores, raio } from '@/src/theme/tokens';
import type { Compra } from '@/src/types';

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
  const { compacto, painelDuplo } = useBreakpoint();
  const mostrandoPainel = painelDuplo && editandoId != null;

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
          data={itens}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={compacto ? styles.lista : styles.tabela}
          ListHeaderComponent={compacto || itens.length === 0 ? null : <CabecalhoTabela />}
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

function CabecalhoTabela() {
  return (
    <View style={styles.thead}>
      <Text style={[styles.th, COL.data]}>Data</Text>
      <Text style={[styles.th, COL.descricao]}>Descrição</Text>
      <Text style={[styles.th, COL.categoria]}>Categoria</Text>
      <Text style={[styles.th, COL.pessoa]}>Pessoa</Text>
      <Text style={[styles.th, COL.cartao]}>Cartão/conta</Text>
      <Text style={[styles.th, COL.valor, styles.thDireita]}>Valor</Text>
      <View style={COL.acoes} />
    </View>
  );
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
