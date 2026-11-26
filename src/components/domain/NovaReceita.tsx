import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { createReceita } from '@/src/services/api/receitas';
import { getOrigensReceita } from '@/src/services/api/origensReceita';
import { getCartoesContas } from '@/src/services/api/cartoesContas';
import { getMembros } from '@/src/services/api/casas';
import { getDashboard } from '@/src/services/api/dashboard';
import { ReceitaForm, type ReceitaFormValues } from '@/src/components/domain/ReceitaForm';
import { VinculoRecorrencia } from '@/src/components/domain/VinculoRecorrencia';
import { useAuth } from '@/src/context/AuthContext';
import { casaInicial } from '@/src/utils/casas';
import { notificar } from '@/src/utils/confirmar';
import { competenciaAtual } from '@/src/utils/competencia';
import { ajusteDeEscopo, type OcorrenciaRecorrente } from '@/src/utils/vinculoRecorrencia';
import type { CartaoConta, CasaDashboard, MembroCasa, OrigemReceita } from '@/src/types';

// Formulário único de receita. Usado por:
// - Receitas → "+ Nova receita" (app/(app)/receitas/novo.tsx);
// - Receitas fixas → "Registrar recebimento"
//   (app/(app)/mais/receitas-fixas/recebimento.tsx), já com a receita escolhida.
// Proposta: docs/propostas/proposta-ux-vinculo-receitas-recorrentes.md
// (workspace), seções 5 (escopo casa × pessoal) e 9 (um único fluxo).

function valoresIniciais(): ReceitaFormValues {
  return {
    casaId: null,
    pessoaId: null,
    origemId: null,
    observacao: '',
    valorBruto: null,
    descontos: null,
    valorLiquido: null,
    data: '',
    competencia: competenciaAtual(),
    contaDestino: null,
  };
}

type Props = {
  // Receita recorrente já escolhida ao abrir (porta de entrada das fixas).
  preVinculo?: { id: number; competencia: string } | null;
  aoSalvar: () => void;
};

export function NovaReceita({ preVinculo = null, aoSalvar }: Props) {
  const { user } = useAuth();
  const [values, setValues] = useState<ReceitaFormValues>(valoresIniciais);
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [membros, setMembros] = useState<MembroCasa[]>([]);
  const [origens, setOrigens] = useState<OrigemReceita[]>([]);
  const [contas, setContas] = useState<CartaoConta[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [vinculo, setVinculo] = useState<OcorrenciaRecorrente | null>(null);
  // Muda a cada foco para remontar o VinculoRecorrencia (estado inicial).
  const [chaveFormulario, setChaveFormulario] = useState(0);
  // Vínculo para o qual a pessoa já foi pré-selecionada (uma vez só: na
  // receita a pessoa é opcional e "Nenhuma" precisa ser respeitada).
  const pessoaPreSelecionadaPara = useRef<OcorrenciaRecorrente | null>(null);

  // A tela fica montada entre navegações — sem o reset, reabrir o formulário
  // mostraria o que foi digitado na última vez.
  useFocusEffect(
    useCallback(() => {
      setValues(valoresIniciais());
      setVinculo(null);
      setChaveFormulario((k) => k + 1);
    }, [])
  );

  // Ao escolher a receita recorrente: casa e pessoa se ajustam ao contrato
  // (da casa: fixa a casa; pessoal: fixa a pessoa dona), a origem passa a ser
  // a dela, descrição e valor são completados se estiverem vazios e a conta
  // de destino vai para o padrão do contrato (se nenhuma foi escolhida).
  // Desvincular volta a conta para "Nenhuma".
  const aoVincular = useCallback((o: OcorrenciaRecorrente | null) => {
    setVinculo(o);
    setValues((v) => {
      if (!o) return v.contaDestino === 'herdar' ? { ...v, contaDestino: null } : v;
      return {
        ...v,
        ...ajusteDeEscopo(o, v),
        origemId: o.categoriaOuOrigemId,
        // herda a descrição da receita fixa, sem sobrescrever o que já foi digitado
        observacao: v.observacao.trim() ? v.observacao : o.descricao,
        valorLiquido: v.valorLiquido ?? o.valorEsperado,
        contaDestino: v.contaDestino === null ? 'herdar' : v.contaDestino,
      };
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      getDashboard(competenciaAtual()).then((d) => setCasas(d.casas)).catch(() => {});
      getOrigensReceita(true).then(setOrigens).catch(() => {});
      getCartoesContas(true).then(setContas).catch(() => {});
    }, [])
  );

  useEffect(() => {
    // já vem escolhida a única opção ou a casa principal do Perfil
    if (values.casaId !== null) return;
    const inicial = casaInicial(casas, user?.casa_principal_id);
    if (inicial !== null) setValues((v) => ({ ...v, casaId: inicial }));
  }, [casas, values.casaId, user?.casa_principal_id]);

  useEffect(() => {
    if (values.casaId == null) {
      setMembros([]);
      return;
    }
    getMembros(values.casaId).then(setMembros).catch(() => setMembros([]));
  }, [values.casaId]);

  // Receita da casa: pré-seleciona quem está usando, se for membro e a pessoa
  // estiver vazia. Só uma vez por vínculo.
  useEffect(() => {
    if (!vinculo || vinculo.casaId === null || membros.length === 0) return;
    if (pessoaPreSelecionadaPara.current === vinculo) return;
    pessoaPreSelecionadaPara.current = vinculo;
    if (values.pessoaId !== null) return;
    const eu = membros.find((m) => m.pessoa_id === Number(user?.id));
    if (eu) setValues((v) => ({ ...v, pessoaId: eu.pessoa_id }));
  }, [vinculo, values.pessoaId, membros, user?.id]);

  // Receita pessoal: a pessoa é sempre a dona do contrato (o formulário zera
  // a pessoa ao trocar de casa; aqui ela volta). O backend exige essa pessoa.
  useEffect(() => {
    if (vinculo && vinculo.casaId === null && vinculo.pessoaId !== null && values.pessoaId !== vinculo.pessoaId) {
      setValues((v) => ({ ...v, pessoaId: vinculo.pessoaId }));
    }
  }, [vinculo, values.pessoaId]);

  async function salvar() {
    if (values.casaId == null || values.valorLiquido == null) return;

    setSalvando(true);
    try {
      await createReceita({
        casa_id: values.casaId,
        pessoa_id: values.pessoaId,
        origem_id: values.origemId,
        observacao: values.observacao.trim() || null,
        valor_bruto: values.valorBruto,
        descontos: values.descontos,
        valor_liquido: values.valorLiquido,
        data: values.data.trim() || null,
        competencia: values.competencia || null,
        ...(vinculo
          ? {
              receita_fixa_id: vinculo.id,
              competencia_referencia: vinculo.competencia,
              // chave omitida = herdar a conta do contrato; null explícito = sem conta
              ...(values.contaDestino !== 'herdar' ? { conta_destino_id: values.contaDestino } : {}),
            }
          : {
              // receita avulsa não tem contrato para herdar — valor sempre explícito
              conta_destino_id: values.contaDestino === 'herdar' ? null : values.contaDestino,
            }),
      });
      aoSalvar();
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
        {/* A pergunta vem antes: escolher a receita já preenche casa, pessoa,
            origem, descrição, valor e conta de destino do formulário abaixo. */}
        <VinculoRecorrencia
          key={chaveFormulario}
          tipo="receita"
          casaId={values.casaId}
          pessoaId={values.pessoaId}
          descricao={values.observacao}
          valor={values.valorLiquido}
          origemId={values.origemId}
          selecionada={vinculo}
          onChange={aoVincular}
          preSelecao={preVinculo}
          casas={casas}
        />

        <ReceitaForm
          values={values}
          onChange={setValues}
          casas={casas}
          membros={membros}
          origens={origens}
          contas={contas}
          vinculadaAFixa={vinculo != null}
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
  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },
});
