import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getStatusDespesasFixas } from '@/src/services/api/despesasFixas';
import { getStatusReceitasFixas } from '@/src/services/api/receitasFixas';
import { Sheet } from '@/src/components/ui/Sheet';
import { competenciaParaData, dataParaCompetencia } from '@/src/components/ui/MonthPicker';
import { competenciaAtual } from '@/src/utils/competencia';
import { confirmar } from '@/src/utils/confirmar';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import {
  deDespesa,
  deReceita,
  filtrarEOrdenar,
  juntarAtrasadas,
  motivoSugestao,
  textoRealizado,
  type ContextoSugestao,
  rotuloSituacao,
  visivelNoContexto,
  type OcorrenciaRecorrente,
  type SituacaoOcorrencia,
  type TipoVinculo,
} from '@/src/utils/vinculoRecorrencia';
import { cores, raio } from '@/src/theme/tokens';

// Controle opcional "É pagamento de uma conta recorrente?" (e o espelho para
// receitas) do formulário único de lançamento. Desligado, o formulário fica
// como antes. Ligado, funciona como um campo de seleção: a lista (com mês de
// referência, busca e situação de cada ocorrência) abre numa janela (Sheet)
// e, na tela, fica só a recorrência escolhida, com "Trocar". Nada é vinculado
// sem o toque do usuário.

const TEXTOS: Record<TipoVinculo, { pergunta: string; ajuda: string; vazio: string; escolher: string; tituloLista: string; jaRealizadaTitulo: string; jaRealizadaMsg: (d: string, c: string) => string; justificadaTitulo: string; justificadaMsg: (d: string, c: string) => string; confirmar: string }> = {
  despesa: {
    escolher: 'Escolher a conta recorrente',
    tituloLista: 'Conta recorrente',
    pergunta: 'É pagamento de uma conta recorrente?',
    ajuda: 'Para dar baixa numa conta que já está cadastrada, como aluguel, internet ou luz.',
    vazio: 'Nenhuma conta recorrente desta casa ou pessoa nesse mês.',
    jaRealizadaTitulo: 'Conta já paga',
    jaRealizadaMsg: (d, c) => `Já existe um pagamento registrado para "${d}" em ${c}. Registrar mais um pagamento para essa conta?`,
    justificadaTitulo: 'Competência justificada',
    justificadaMsg: (d, c) => `"${d}" em ${c} foi marcada como não paga, com justificativa. Registrar o pagamento mesmo assim?`,
    confirmar: 'Vincular mesmo assim',
  },
  receita: {
    escolher: 'Escolher a receita recorrente',
    tituloLista: 'Receita recorrente',
    pergunta: 'É recebimento de uma receita recorrente?',
    ajuda: 'Para dar baixa numa receita que já está cadastrada, como salário ou aluguel recebido.',
    vazio: 'Nenhuma receita recorrente desta casa ou pessoa nesse mês.',
    jaRealizadaTitulo: 'Receita já recebida',
    jaRealizadaMsg: (d, c) => `Já existe um recebimento registrado para "${d}" em ${c}. Registrar mais um recebimento para essa receita?`,
    justificadaTitulo: 'Competência justificada',
    justificadaMsg: (d, c) => `"${d}" em ${c} foi marcada como não recebida, com justificativa. Registrar o recebimento mesmo assim?`,
    confirmar: 'Vincular mesmo assim',
  },
};

const COR_SITUACAO: Record<SituacaoOcorrencia, { cor: string; fundo: string }> = {
  realizada: { cor: cores.positivo, fundo: cores.positivoSuave },
  em_aberto: { cor: cores.textoMedio, fundo: cores.fundoSuave },
  vence_hoje: { cor: cores.alerta, fundo: cores.alertaSuave },
  atrasada: { cor: cores.negativo, fundo: cores.negativoSuave },
  justificada: { cor: cores.textoSuave, fundo: cores.fundoSuave },
};

type Props = {
  tipo: TipoVinculo;
  casaId: number | null;
  pessoaId: number | null;
  descricao: string; // descrição do lançamento, usada só para sugerir
  valor: number | null; // valor do lançamento, para comparar com o esperado
  origemId?: number | null; // só receitas: origem escolhida, sinal principal da sugestão
  selecionada: OcorrenciaRecorrente | null;
  onChange: (ocorrencia: OcorrenciaRecorrente | null) => void;
  // Abre já ligado e com esta ocorrência escolhida (botões "Registrar
  // pagamento/recebimento" das listas de fixas).
  preSelecao?: { id: number; competencia: string } | null;
  // Para mostrar de qual casa é cada conta quando nenhuma casa foi escolhida.
  casas?: { id: number; nome: string }[];
};

export function VinculoRecorrencia({
  tipo, casaId, pessoaId, descricao, valor, origemId = null, selecionada, onChange, preSelecao = null, casas = [],
}: Props) {
  const textos = TEXTOS[tipo];
  const [ativo, setAtivo] = useState(preSelecao != null);
  const [competencia, setCompetencia] = useState(preSelecao?.competencia ?? competenciaAtual());
  const preSelecaoAplicada = useRef(false);
  const [listaAberta, setListaAberta] = useState(false);
  const [busca, setBusca] = useState('');
  const [itens, setItens] = useState<OcorrenciaRecorrente[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!ativo) return;
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    // Duas consultas: o mês escolhido e tudo o que está em aberto (sem
    // competência), para trazer também as atrasadas de outros meses (item C).
    const buscar = (c?: string) => tipo === 'despesa'
      ? getStatusDespesasFixas(c).then((l) => l.map(deDespesa))
      : getStatusReceitasFixas(c).then((l) => l.map(deReceita));
    const requisicao = Promise.all([buscar(competencia), buscar()])
      .then(([doMes, abertas]) => juntarAtrasadas(doMes, abertas, competencia));
    requisicao
      .then((l) => { if (!cancelado) setItens(l); })
      .catch((e: unknown) => { if (!cancelado) { setItens([]); setErro((e as Error).message); } })
      .finally(() => { if (!cancelado) setCarregando(false); });
    return () => { cancelado = true; };
  }, [ativo, competencia, tipo]);

  // Abertura com a conta já escolhida: seleciona assim que a lista chega.
  useEffect(() => {
    if (!preSelecao || preSelecaoAplicada.current || carregando || itens.length === 0) return;
    const alvo = itens.find((o) => o.id === preSelecao.id && o.competencia === preSelecao.competencia);
    preSelecaoAplicada.current = true;
    if (alvo) onChange(alvo);
  }, [preSelecao, itens, carregando, onChange]);

  // Escolher outra casa desfaz o vínculo com uma conta da casa (o backend
  // recusaria). Conta pessoal não depende da casa; a pessoa é mantida pelo
  // formulário (dona do contrato).
  useEffect(() => {
    if (selecionada && selecionada.casaId !== null && casaId !== null && casaId !== selecionada.casaId) {
      onChange(null);
    }
  }, [casaId, selecionada, onChange]);

  const contexto = useMemo<ContextoSugestao>(
    () => ({ descricao, origemId, pessoaId }),
    [descricao, origemId, pessoaId]
  );

  const visiveis = useMemo(
    () => filtrarEOrdenar(itens.filter((o) => visivelNoContexto(o, casaId)), busca, contexto),
    [itens, casaId, busca, contexto]
  );

  function escopoDe(o: OcorrenciaRecorrente): string | null {
    if (o.casaId === null) return 'pessoal';
    if (casaId !== null) return null; // a casa já está escolhida no formulário
    return casas.find((c) => c.id === o.casaId)?.nome ?? null;
  }

  function alternar(valorSwitch: boolean) {
    setAtivo(valorSwitch);
    // Ligar já abre a lista: quem liga quer escolher.
    setListaAberta(valorSwitch);
    if (!valorSwitch) onChange(null);
  }

  function mudarMes(delta: number) {
    const { mes, ano } = competenciaParaData(competencia);
    const total = ano * 12 + mes + delta;
    setCompetencia(dataParaCompetencia(total % 12, Math.floor(total / 12)));
  }

  function escolher(o: OcorrenciaRecorrente) {
    if (selecionada && selecionada.id === o.id && selecionada.competencia === o.competencia) {
      setListaAberta(false);
      return;
    }
    // Já realizada ou justificada: confirmação antes de vincular. Vincular a
    // uma justificada faz a ocorrência passar a constar como paga/recebida.
    if (o.situacao === 'realizada' || o.situacao === 'justificada') {
      const realizada = o.situacao === 'realizada';
      // Fecha a lista antes: no celular, o aviso não aparece por cima da janela.
      setListaAberta(false);
      confirmar(
        {
          titulo: realizada ? textos.jaRealizadaTitulo : textos.justificadaTitulo,
          mensagem: (realizada ? textos.jaRealizadaMsg : textos.justificadaMsg)(o.descricao, o.competencia)
            + (realizada && textoRealizado(tipo, o) ? `\n\n${textoRealizado(tipo, o)}.` : ''),
          textoConfirmar: textos.confirmar,
          destrutivo: false,
        },
        () => onChange(o)
      );
      return;
    }
    onChange(o);
    setListaAberta(false);
  }

  function detalhe(o: OcorrenciaRecorrente, mostraOutroMes = true): string {
    const valorTexto = o.valorEsperado != null
      ? `${o.valorFixo ? 'Valor fixo' : 'Valor variável, cerca de'} ${formatCurrency(o.valorEsperado)}`
      : 'Valor variável';
    const data = `${tipo === 'despesa' ? 'vence' : 'previsto'} ${formatDate(o.dataEsperada)}`;
    const escopo = escopoDe(o);
    // Atrasada de outro mês (item C): deixa claro a qual mês ela se refere.
    const outroMes = mostraOutroMes && o.competencia !== competencia ? `referente a ${o.competencia}` : null;
    return [outroMes, valorTexto, data, escopo].filter(Boolean).join(' · ');
  }

  function badge(o: OcorrenciaRecorrente) {
    const c = COR_SITUACAO[o.situacao];
    return (
      <Text style={[styles.badge, { color: c.cor, backgroundColor: c.fundo }]}>
        {rotuloSituacao(tipo, o.situacao)}
      </Text>
    );
  }

  const diferencaDoEsperado =
    selecionada?.valorFixo &&
    selecionada.valorEsperado != null &&
    valor != null &&
    Math.abs(valor - selecionada.valorEsperado) >= 0.01;

  return (
    <View style={styles.bloco}>
      <View style={styles.linhaSwitch}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pergunta}>{textos.pergunta}</Text>
          <Text style={styles.ajuda}>{textos.ajuda}</Text>
        </View>
        <Switch value={ativo} onValueChange={alternar} />
      </View>

      {ativo && (
        selecionada ? (
          // Escolhida: só ela na tela, com "Trocar".
          <View style={styles.escolhida}>
            <View style={styles.itemTopo}>
              <Text style={[styles.itemNome, styles.itemNomeAtivo]} numberOfLines={1}>
                {selecionada.descricao}
              </Text>
              {badge(selecionada)}
            </View>
            <Text style={styles.itemDetalhe}>Referente a {selecionada.competencia} · {detalhe(selecionada, false)}</Text>
            {textoRealizado(tipo, selecionada) && (
              <Text style={styles.realizado}>{textoRealizado(tipo, selecionada)}</Text>
            )}
            <Pressable onPress={() => setListaAberta(true)} hitSlop={8}>
              <Text style={styles.trocar}>Trocar</Text>
            </Pressable>
          </View>
        ) : (
          // Nada escolhido: um campo de seleção que abre a lista.
          <Pressable style={styles.campo} onPress={() => setListaAberta(true)}>
            <Text style={styles.campoTexto}>{carregando ? 'Carregando...' : textos.escolher}</Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color={cores.textoSuave} />
          </Pressable>
        )
      )}

      {ativo && selecionada && !selecionada.valorFixo && (
        <Text style={styles.ajuda}>O valor muda a cada mês; vale o valor informado no lançamento.</Text>
      )}
      {ativo && diferencaDoEsperado && (
        <Text style={styles.ajuda}>
          Valor esperado: {formatCurrency(selecionada!.valorEsperado!)}. Vale o valor informado no lançamento.
        </Text>
      )}

      <Sheet visivel={listaAberta} titulo={textos.tituloLista} onFechar={() => setListaAberta(false)}>
        <View style={styles.linhaReferencia}>
          <Text style={styles.label}>Referente a</Text>
          <Pressable onPress={() => mudarMes(-1)} hitSlop={8} accessibilityLabel="Mês anterior">
            <MaterialCommunityIcons name="chevron-left" size={24} color={cores.primaria} />
          </Pressable>
          <Text style={styles.mesTexto}>{competencia}</Text>
          <Pressable onPress={() => mudarMes(1)} hitSlop={8} accessibilityLabel="Próximo mês">
            <MaterialCommunityIcons name="chevron-right" size={24} color={cores.primaria} />
          </Pressable>
        </View>

        <TextInput
          style={styles.input}
          value={busca}
          onChangeText={setBusca}
          placeholder="Pesquisar pelo nome"
        />

        <ScrollView contentContainerStyle={styles.lista} keyboardShouldPersistTaps="handled">
          {carregando && <ActivityIndicator style={{ marginVertical: 8 }} />}
          {erro && <Text style={styles.erro}>Não foi possível carregar: {erro}</Text>}
          {!carregando && !erro && visiveis.length === 0 && (
            <Text style={styles.ajuda}>{textos.vazio}</Text>
          )}

          {!carregando && visiveis.map((o) => {
            const ativa = selecionada?.id === o.id && selecionada.competencia === o.competencia;
            const sugestao = motivoSugestao(o, contexto);
            return (
              <Pressable
                key={`${o.id}-${o.competencia}`}
                style={[styles.item, ativa && styles.itemAtivo]}
                onPress={() => escolher(o)}
              >
                <View style={styles.itemTopo}>
                  <Text style={[styles.itemNome, ativa && styles.itemNomeAtivo]} numberOfLines={1}>
                    {o.descricao}
                  </Text>
                  {badge(o)}
                </View>
                <Text style={styles.itemDetalhe}>{detalhe(o)}</Text>
                {textoRealizado(tipo, o) && <Text style={styles.realizado}>{textoRealizado(tipo, o)}</Text>}
                {sugestao && !ativa && <Text style={styles.sugestao}>Sugestão: {sugestao.toLowerCase()}</Text>}
              </Pressable>
            );
          })}
        </ScrollView>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  bloco:          { borderWidth: 1, borderColor: cores.bordaSuave, borderRadius: raio.md, padding: 12, gap: 8, marginTop: 8 },
  linhaSwitch:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pergunta:       { fontSize: 15, fontWeight: '600', color: cores.textoForte },
  ajuda:          { fontSize: 13, color: cores.textoSuave },
  erro:           { fontSize: 13, color: cores.negativo },
  label:          { fontSize: 14, color: cores.textoMedio, marginRight: 4 },
  campo:          { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: cores.borda, borderRadius: raio.md, paddingVertical: 10, paddingHorizontal: 12 },
  campoTexto:     { flex: 1, fontSize: 16, color: cores.textoSuave },
  escolhida:      { borderWidth: 1, borderColor: cores.primaria, backgroundColor: cores.primariaSuave, borderRadius: raio.md, padding: 10, gap: 4 },
  trocar:         { fontSize: 14, color: cores.primaria, fontWeight: '600', marginTop: 2 },
  linhaReferencia:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  mesTexto:       { fontSize: 15, color: cores.primaria, fontWeight: '600', minWidth: 56, textAlign: 'center' },
  input:          { borderWidth: 1, borderColor: cores.borda, borderRadius: raio.md, padding: 10, fontSize: 15, marginBottom: 8 },
  lista:          { gap: 8, paddingBottom: 8 },
  item:           { borderWidth: 1, borderColor: cores.borda, borderRadius: raio.md, padding: 10, gap: 4 },
  itemAtivo:      { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  itemTopo:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemNome:       { flex: 1, fontSize: 15, color: cores.textoForte },
  itemNomeAtivo:  { color: cores.primaria, fontWeight: '600' },
  itemDetalhe:    { fontSize: 13, color: cores.textoMedio },
  badge:          { fontSize: 12, fontWeight: '600', paddingVertical: 2, paddingHorizontal: 8, borderRadius: raio.md, overflow: 'hidden' },
  sugestao:       { fontSize: 12, color: cores.primaria },
  realizado:      { fontSize: 12, color: cores.positivo },
});
