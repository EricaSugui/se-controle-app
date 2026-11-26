import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { getStatusDespesasFixas } from '@/src/services/api/despesasFixas';
import { getStatusReceitasFixas } from '@/src/services/api/receitasFixas';
import { MonthPicker } from '@/src/components/ui/MonthPicker';
import { competenciaAtual } from '@/src/utils/competencia';
import { confirmar } from '@/src/utils/confirmar';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import {
  deDespesa,
  deReceita,
  ehSugestao,
  filtrarEOrdenar,
  noEscopo,
  rotuloSituacao,
  type OcorrenciaRecorrente,
  type SituacaoOcorrencia,
  type TipoVinculo,
} from '@/src/utils/vinculoRecorrencia';
import { cores, raio } from '@/src/theme/tokens';

// Controle opcional "É pagamento de uma conta recorrente?" (e o espelho para
// receitas) do formulário único de lançamento. Desligado, o formulário fica
// como antes. Ligado, lista as recorrências da casa/pessoa do lançamento na
// competência de referência, com a situação de cada uma; nada é vinculado
// sem o toque do usuário.

const TEXTOS: Record<TipoVinculo, { pergunta: string; ajuda: string; vazio: string; jaRealizadaTitulo: string; jaRealizadaMsg: (d: string, c: string) => string; confirmar: string }> = {
  despesa: {
    pergunta: 'É pagamento de uma conta recorrente?',
    ajuda: 'Para dar baixa numa conta que já está cadastrada, como aluguel, internet ou luz.',
    vazio: 'Nenhuma conta recorrente desta casa ou pessoa nesse mês.',
    jaRealizadaTitulo: 'Conta já paga',
    jaRealizadaMsg: (d, c) => `Já existe um pagamento registrado para "${d}" em ${c}. Registrar mais um pagamento para essa conta?`,
    confirmar: 'Vincular mesmo assim',
  },
  receita: {
    pergunta: 'É recebimento de uma receita recorrente?',
    ajuda: 'Para dar baixa numa receita que já está cadastrada, como salário ou aluguel recebido.',
    vazio: 'Nenhuma receita recorrente desta casa ou pessoa nesse mês.',
    jaRealizadaTitulo: 'Receita já recebida',
    jaRealizadaMsg: (d, c) => `Já existe um recebimento registrado para "${d}" em ${c}. Registrar mais um recebimento para essa receita?`,
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
  selecionada: OcorrenciaRecorrente | null;
  onChange: (ocorrencia: OcorrenciaRecorrente | null) => void;
};

export function VinculoRecorrencia({ tipo, casaId, pessoaId, descricao, valor, selecionada, onChange }: Props) {
  const textos = TEXTOS[tipo];
  const [ativo, setAtivo] = useState(false);
  const [competencia, setCompetencia] = useState(competenciaAtual());
  const [seletorVisivel, setSeletorVisivel] = useState(false);
  const [busca, setBusca] = useState('');
  const [itens, setItens] = useState<OcorrenciaRecorrente[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!ativo) return;
    let cancelado = false;
    setCarregando(true);
    setErro(null);
    const requisicao = tipo === 'despesa'
      ? getStatusDespesasFixas(competencia).then((l) => l.map(deDespesa))
      : getStatusReceitasFixas(competencia).then((l) => l.map(deReceita));
    requisicao
      .then((l) => { if (!cancelado) setItens(l); })
      .catch((e: unknown) => { if (!cancelado) { setItens([]); setErro((e as Error).message); } })
      .finally(() => { if (!cancelado) setCarregando(false); });
    return () => { cancelado = true; };
  }, [ativo, competencia, tipo]);

  // Trocar casa ou pessoa pode tirar a recorrência escolhida do escopo; o
  // backend recusaria o vínculo, então ele é desfeito aqui.
  useEffect(() => {
    if (selecionada && !noEscopo(selecionada, casaId, pessoaId)) onChange(null);
  }, [casaId, pessoaId, selecionada, onChange]);

  const visiveis = useMemo(
    () => filtrarEOrdenar(itens.filter((o) => noEscopo(o, casaId, pessoaId)), busca, descricao),
    [itens, casaId, pessoaId, busca, descricao]
  );

  function alternar(valorSwitch: boolean) {
    setAtivo(valorSwitch);
    if (!valorSwitch) onChange(null);
  }

  function escolher(o: OcorrenciaRecorrente) {
    if (selecionada && selecionada.id === o.id && selecionada.competencia === o.competencia) {
      onChange(null);
      return;
    }
    if (o.situacao === 'realizada') {
      confirmar(
        {
          titulo: textos.jaRealizadaTitulo,
          mensagem: textos.jaRealizadaMsg(o.descricao, o.competencia),
          textoConfirmar: textos.confirmar,
          destrutivo: false,
        },
        () => onChange(o)
      );
      return;
    }
    onChange(o);
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
        <>
          {casaId == null ? (
            <Text style={styles.ajuda}>Escolha a casa no formulário abaixo para ver a lista.</Text>
          ) : (
            <>
              <View style={styles.linhaReferencia}>
                <Text style={styles.label}>Referente a</Text>
                <Pressable style={styles.chipMes} onPress={() => setSeletorVisivel(true)}>
                  <Text style={styles.chipMesTexto}>{competencia}</Text>
                </Pressable>
              </View>

              <TextInput
                style={styles.input}
                value={busca}
                onChangeText={setBusca}
                placeholder="Pesquisar pelo nome"
              />

              {carregando && <ActivityIndicator style={{ marginVertical: 8 }} />}
              {erro && <Text style={styles.erro}>Não foi possível carregar: {erro}</Text>}
              {!carregando && !erro && visiveis.length === 0 && (
                <Text style={styles.ajuda}>{textos.vazio}</Text>
              )}

              {!carregando && visiveis.map((o) => {
                const ativa = selecionada?.id === o.id && selecionada.competencia === o.competencia;
                const sugestao = ehSugestao(o, descricao);
                const corSituacao = COR_SITUACAO[o.situacao];
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
                      <Text style={[styles.badge, { color: corSituacao.cor, backgroundColor: corSituacao.fundo }]}>
                        {rotuloSituacao(tipo, o.situacao)}
                      </Text>
                    </View>
                    <Text style={styles.itemDetalhe}>
                      {o.valorEsperado != null
                        ? `${o.valorFixo ? 'Valor fixo' : 'Valor variável, cerca de'} ${formatCurrency(o.valorEsperado)}`
                        : 'Valor variável'}
                      {' · '}
                      {tipo === 'despesa' ? 'vence' : 'previsto'} {formatDate(o.dataEsperada)}
                    </Text>
                    {sugestao && !ativa && <Text style={styles.sugestao}>Parece corresponder à descrição</Text>}
                  </Pressable>
                );
              })}

              {selecionada && !selecionada.valorFixo && (
                <Text style={styles.ajuda}>O valor muda a cada mês; vale o valor informado no lançamento.</Text>
              )}
              {diferencaDoEsperado && (
                <Text style={styles.ajuda}>
                  Valor esperado: {formatCurrency(selecionada!.valorEsperado!)}. Vale o valor informado no lançamento.
                </Text>
              )}
            </>
          )}

          <MonthPicker
            visivel={seletorVisivel}
            valor={competencia}
            onSelecionar={(c) => { setCompetencia(c); onChange(null); }}
            onFechar={() => setSeletorVisivel(false)}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bloco:          { borderWidth: 1, borderColor: cores.bordaSuave, borderRadius: raio.md, padding: 12, gap: 8, marginTop: 8 },
  linhaSwitch:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pergunta:       { fontSize: 15, fontWeight: '600', color: cores.textoForte },
  ajuda:          { fontSize: 13, color: cores.textoSuave },
  erro:           { fontSize: 13, color: cores.negativo },
  label:          { fontSize: 14, color: cores.textoMedio },
  linhaReferencia:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  chipMes:        { borderWidth: 1, borderColor: cores.borda, borderRadius: raio.md, paddingVertical: 6, paddingHorizontal: 12 },
  chipMesTexto:   { fontSize: 14, color: cores.primaria, fontWeight: '600' },
  input:          { borderWidth: 1, borderColor: cores.borda, borderRadius: raio.md, padding: 10, fontSize: 15 },
  item:           { borderWidth: 1, borderColor: cores.borda, borderRadius: raio.md, padding: 10, gap: 4 },
  itemAtivo:      { borderColor: cores.primaria, backgroundColor: cores.primariaSuave },
  itemTopo:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemNome:       { flex: 1, fontSize: 15, color: cores.textoForte },
  itemNomeAtivo:  { color: cores.primaria, fontWeight: '600' },
  itemDetalhe:    { fontSize: 13, color: cores.textoMedio },
  badge:          { fontSize: 12, fontWeight: '600', paddingVertical: 2, paddingHorizontal: 8, borderRadius: raio.md, overflow: 'hidden' },
  sugestao:       { fontSize: 12, color: cores.primaria },
});
