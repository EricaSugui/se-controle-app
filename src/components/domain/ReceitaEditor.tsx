import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getReceita, updateReceita } from '@/src/services/api/receitas';
import { getOrigensReceita } from '@/src/services/api/origensReceita';
import { getCartoesContas } from '@/src/services/api/cartoesContas';
import { getMembros } from '@/src/services/api/casas';
import { getDashboard } from '@/src/services/api/dashboard';
import { ReceitaForm, type ReceitaFormValues } from '@/src/components/domain/ReceitaForm';
import { VinculoRecorrencia } from '@/src/components/domain/VinculoRecorrencia';
import { ajusteDeEscopo, type OcorrenciaRecorrente } from '@/src/utils/vinculoRecorrencia';
import { notificar } from '@/src/utils/confirmar';
import { competenciaAtual } from '@/src/utils/competencia';
import type { CartaoConta, CasaDashboard, MembroCasa, OrigemReceita, Receita } from '@/src/types';

// Edição de uma receita. Usado pela tela cheia (app/(app)/receitas/[id].tsx,
// no celular) e pelo painel lateral da lista de Receitas (desktop largo), no
// mesmo padrão do CompraEditor das despesas.

export type ReceitaEditavel = {
  id: number;
  valores: ReceitaFormValues;
  receitaFixaId: number | null;
  competenciaReferencia: string | null;
};

export function receitaEditavel(r: Receita): ReceitaEditavel {
  return {
    id: r.id,
    valores: {
      casaId: r.casa_id,
      pessoaId: r.pessoa_id ?? null,
      origemId: r.origem_id ?? null,
      observacao: r.observacao ?? '',
      valorBruto: r.valor_bruto ?? null,
      descontos: r.descontos ?? null,
      valorLiquido: r.valor_liquido,
      data: r.data ? r.data.slice(0, 10) : '',
      competencia: r.competencia || competenciaAtual(),
      contaDestino: r.conta_destino_id ?? null,
    },
    receitaFixaId: r.receita_fixa_id ?? null,
    competenciaReferencia: r.competencia_referencia ?? null,
  };
}

type Props = {
  id: number;
  onSalvo: () => void;
  /** A receita carregada — a tela cheia usa para escrever o título do header. */
  onCarregado?: (receita: Receita) => void;
};

export function ReceitaEditor({ id, onSalvo, onCarregado }: Props) {
  const [receita, setReceita] = useState<ReceitaEditavel | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setReceita(null);
    setErro(null);
    getReceita(id)
      .then((r) => {
        if (cancelado) return;
        setReceita(receitaEditavel(r));
        onCarregado?.(r);
      })
      .catch((e: unknown) => { if (!cancelado) setErro((e as Error).message); });
    return () => { cancelado = true; };
  }, [id, onCarregado]);

  if (erro) return <Text style={styles.erro}>{erro}</Text>;
  if (!receita) return <ActivityIndicator style={{ marginTop: 32 }} />;
  // key: trocar de receita remonta o formulário com os valores dela.
  return <FormularioEdicao key={receita.id} receita={receita} onSalvo={onSalvo} />;
}

function FormularioEdicao({ receita, onSalvo }: { receita: ReceitaEditavel; onSalvo: () => void }) {
  const { id } = receita;
  const [values, setValues] = useState<ReceitaFormValues>(receita.valores);
  // Vínculo com receita fixa (Fase 1, item G: trocar ou remover). Começa com
  // o salvo e só muda quando a pessoa escolhe outra receita ou desliga a
  // pergunta; se a ocorrência salva não aparecer na lista, nada se perde.
  const [vinculo, setVinculo] = useState({
    receitaFixaId: receita.receitaFixaId,
    competenciaReferencia: receita.competenciaReferencia,
  });
  const vinculoRef = useRef(vinculo);
  const [ocorrencia, setOcorrencia] = useState<OcorrenciaRecorrente | null>(null);
  const preVinculo = useMemo(
    () => receita.receitaFixaId != null && receita.competenciaReferencia
      ? { id: receita.receitaFixaId, competencia: receita.competenciaReferencia }
      : null,
    [receita.receitaFixaId, receita.competenciaReferencia]
  );
  const { receitaFixaId, competenciaReferencia } = vinculo;

  const aoVincular = useCallback((o: OcorrenciaRecorrente | null) => {
    setOcorrencia(o);
    // Reencontrou o vínculo salvo ao abrir: só marca, sem mexer no formulário.
    const atual = vinculoRef.current;
    if (o && atual.receitaFixaId === o.id && atual.competenciaReferencia === o.competencia) return;
    const novo = { receitaFixaId: o ? o.id : null, competenciaReferencia: o ? o.competencia : null };
    vinculoRef.current = novo;
    setVinculo(novo);
    setValues((v) => {
      if (!o) return v.contaDestino === 'herdar' ? { ...v, contaDestino: null } : v;
      return {
        ...v,
        ...ajusteDeEscopo(o, v),
        origemId: o.categoriaOuOrigemId,
        observacao: v.observacao.trim() ? v.observacao : o.descricao,
        valorLiquido: v.valorLiquido ?? o.valorEsperado,
        contaDestino: v.contaDestino === null ? 'herdar' : v.contaDestino,
      };
    });
  }, []);

  // Receita pessoal: a pessoa é sempre a dona do contrato.
  useEffect(() => {
    if (ocorrencia && ocorrencia.casaId === null && ocorrencia.pessoaId !== null && values.pessoaId !== ocorrencia.pessoaId) {
      setValues((v) => ({ ...v, pessoaId: ocorrencia.pessoaId }));
    }
  }, [ocorrencia, values.pessoaId]);
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [membros, setMembros] = useState<MembroCasa[]>([]);
  const [origens, setOrigens] = useState<OrigemReceita[]>([]);
  const [contas, setContas] = useState<CartaoConta[]>([]);
  const [salvando, setSalvando] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getDashboard(competenciaAtual()).then((d) => setCasas(d.casas)).catch(() => {});
      getOrigensReceita(true).then(setOrigens).catch(() => {});
      getCartoesContas(true).then(setContas).catch(() => {});
    }, [])
  );

  useEffect(() => {
    if (values.casaId == null) {
      setMembros([]);
      return;
    }
    getMembros(values.casaId).then(setMembros).catch(() => setMembros([]));
  }, [values.casaId]);

  async function salvar() {
    if (values.casaId == null || values.valorLiquido == null) return;

    setSalvando(true);
    try {
      await updateReceita(id, {
        casa_id: values.casaId,
        pessoa_id: values.pessoaId,
        origem_id: values.origemId,
        observacao: values.observacao.trim() || null,
        valor_bruto: values.valorBruto,
        descontos: values.descontos,
        valor_liquido: values.valorLiquido,
        data: values.data.trim() || null,
        competencia: values.competencia || null,
        // Vínculo com receita fixa: o PUT remove o vínculo se os campos forem
        // omitidos, então precisam ser repassados.
        receita_fixa_id: receitaFixaId,
        competencia_referencia: competenciaReferencia,
        // chave omitida = herdar do contrato; null explícito = sem conta
        ...(values.contaDestino !== 'herdar' ? { conta_destino_id: values.contaDestino } : {}),
      });
      onSalvo();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  const podeSalvar = values.casaId != null && values.valorLiquido != null && !salvando;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <VinculoRecorrencia
          tipo="receita"
          casaId={values.casaId}
          pessoaId={values.pessoaId}
          descricao={values.observacao}
          valor={values.valorLiquido}
          origemId={values.origemId}
          selecionada={ocorrencia}
          onChange={aoVincular}
          preSelecao={preVinculo}
          casas={casas}
        />
        {/* Vínculo salvo que o seletor não encontrou na lista: continua
            valendo até a pessoa escolher outra receita ou desligar. */}
        {receitaFixaId != null && ocorrencia == null && (
          <Text style={styles.aviso}>
            Recebimento vinculado a uma receita recorrente
            {competenciaReferencia ? ` (competência ${competenciaReferencia})` : ''}.
          </Text>
        )}

        <ReceitaForm
          values={values}
          onChange={setValues}
          casas={casas}
          membros={membros}
          origens={origens}
          contas={contas}
          vinculadaAFixa={receitaFixaId != null}
        />

        <Pressable
          style={[styles.botao, !podeSalvar && styles.botaoDesabilitado]}
          onPress={salvar}
          disabled={!podeSalvar}
        >
          {salvando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.botaoTexto}>Salvar</Text>
          }
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:         { padding: 24, gap: 12 },
  erro:              { color: '#c62828', textAlign: 'center', padding: 16 },
  aviso:             { fontSize: 13, color: '#777', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12 },
  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },
});
