import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { updateReceita } from '@/src/services/api/receitas';
import { getOrigensReceita } from '@/src/services/api/origensReceita';
import { getMembros } from '@/src/services/api/casas';
import { getDashboard } from '@/src/services/api/dashboard';
import { ReceitaForm, type ReceitaFormValues } from '@/src/components/domain/ReceitaForm';
import { notificar } from '@/src/utils/confirmar';
import { competenciaAtual } from '@/src/utils/competencia';
import type { CasaDashboard, MembroCasa, OrigemReceita } from '@/src/types';

export default function EditarReceitaScreen() {
  const params = useLocalSearchParams<{
    id: string;
    casaId: string;
    pessoaId?: string;
    origemId?: string;
    observacao?: string;
    valorBruto?: string;
    descontos?: string;
    valorLiquido: string;
    data?: string;
    competencia?: string;
    receitaFixaId?: string;
    competenciaReferencia?: string;
  }>();

  const id = Number(params.id);
  // Vínculo com receita fixa: o PUT remove o vínculo se os campos forem
  // omitidos, então precisam ser repassados no salvar.
  const receitaFixaId = params.receitaFixaId ? Number(params.receitaFixaId) : null;
  const competenciaReferencia = params.competenciaReferencia || null;

  const [values, setValues] = useState<ReceitaFormValues>({
    casaId: Number(params.casaId),
    pessoaId: params.pessoaId ? Number(params.pessoaId) : null,
    origemId: params.origemId ? Number(params.origemId) : null,
    observacao: params.observacao ?? '',
    valorBruto: params.valorBruto ? Number(params.valorBruto) : null,
    descontos: params.descontos ? Number(params.descontos) : null,
    valorLiquido: params.valorLiquido ? Number(params.valorLiquido) : null,
    data: params.data ?? '',
    competencia: params.competencia || competenciaAtual(),
  });
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [membros, setMembros] = useState<MembroCasa[]>([]);
  const [origens, setOrigens] = useState<OrigemReceita[]>([]);
  const [salvando, setSalvando] = useState(false);

  // A tela é reaproveitada ao navegar de uma receita para outra (mesma
  // rota [id]), então o estado precisa ser resincronizado quando o id muda.
  useEffect(() => {
    setValues({
      casaId: Number(params.casaId),
      pessoaId: params.pessoaId ? Number(params.pessoaId) : null,
      origemId: params.origemId ? Number(params.origemId) : null,
      observacao: params.observacao ?? '',
      valorBruto: params.valorBruto ? Number(params.valorBruto) : null,
      descontos: params.descontos ? Number(params.descontos) : null,
      valorLiquido: params.valorLiquido ? Number(params.valorLiquido) : null,
      data: params.data ?? '',
      competencia: params.competencia || competenciaAtual(),
    });
  }, [params.id]);

  useFocusEffect(
    useCallback(() => {
      getDashboard(competenciaAtual()).then((d) => setCasas(d.casas)).catch(() => {});
      getOrigensReceita(true).then(setOrigens).catch(() => {});
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
        receita_fixa_id: receitaFixaId,
        competencia_referencia: competenciaReferencia,
      });
      router.back();
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
        {receitaFixaId != null && (
          <Text style={styles.aviso}>
            Recebimento vinculado a receita fixa
            {competenciaReferencia ? ` (competência ${competenciaReferencia})` : ''}.
          </Text>
        )}

        <ReceitaForm values={values} onChange={setValues} casas={casas} membros={membros} origens={origens} />

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
  aviso:             { fontSize: 13, color: '#777', backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12 },
  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },
});
