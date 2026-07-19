import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { createReceita } from '@/src/services/api/receitas';
import { getCartoesContas } from '@/src/services/api/cartoesContas';
import { getMembros } from '@/src/services/api/casas';
import { getDashboard } from '@/src/services/api/dashboard';
import { CurrencyInput } from '@/src/components/ui/CurrencyInput';
import { DatePickerField } from '@/src/components/ui/DatePickerField';
import { useAuth } from '@/src/context/AuthContext';
import { competenciaAtual, competenciaDaData } from '@/src/utils/competencia';
import { notificar } from '@/src/utils/confirmar';
import { formatCurrency } from '@/src/utils/formatters';
import type { CartaoConta, CasaDashboard, MembroCasa } from '@/src/types';

// 'herdar' = omitir conta_destino_id no payload (backend usa o default do
// contrato); null = enviar null explícito ("sem conta").
type ContaDestinoSelecao = number | null | 'herdar';

function hojeISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export default function RecebimentoReceitaFixaScreen() {
  const params = useLocalSearchParams<{
    receitaFixaId: string;
    competenciaReferencia: string;
    descricao: string;
    valorEsperado: string; // '' = sem estimativa
    origemId: string;
    casaId: string; // '' = contrato pessoal
    pessoaId: string; // '' = contrato de casa
  }>();
  const navigation = useNavigation();
  const { user } = useAuth();

  const contratoDeCasa = params.casaId !== '';

  const [valor, setValor] = useState<number | null>(null);
  const [data, setData] = useState(hojeISO());
  const [observacao, setObservacao] = useState('');
  // contrato de casa: casa fixa, escolhe-se a pessoa (opcional); pessoal:
  // pessoa fixa (obrigatória no vínculo), escolhe-se a casa
  const [pessoaSelId, setPessoaSelId] = useState<number | null>(null);
  const [casaSelId, setCasaSelId] = useState<number | null>(null);
  const [contaDestino, setContaDestino] = useState<ContaDestinoSelecao>('herdar');

  const [membros, setMembros] = useState<MembroCasa[]>([]);
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [contas, setContas] = useState<CartaoConta[]>([]);
  const [salvando, setSalvando] = useState(false);

  // A tela fica montada entre navegações — reseta ao trocar de recebimento.
  useEffect(() => {
    setValor(params.valorEsperado ? Number(params.valorEsperado) : null);
    setData(hojeISO());
    setObservacao(params.descricao ?? '');
    setPessoaSelId(null);
    setCasaSelId(null);
    setContaDestino('herdar');
    navigation.setOptions({
      title: params.descricao ? `Receber — ${params.descricao}` : 'Registrar recebimento',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.receitaFixaId, params.competenciaReferencia]);

  useFocusEffect(
    useCallback(() => {
      if (contratoDeCasa) {
        getMembros(Number(params.casaId)).then(setMembros).catch(() => setMembros([]));
      } else {
        getDashboard(competenciaAtual()).then((d) => setCasas(d.casas)).catch(() => {});
      }
      getCartoesContas(true).then(setContas).catch(() => {});
    }, [contratoDeCasa, params.casaId])
  );

  // Defaults: no contrato de casa, pré-seleciona o usuário logado se for
  // membro; no pessoal, pré-seleciona a casa quando só existe uma (receita
  // exige casa_id).
  useEffect(() => {
    if (contratoDeCasa && pessoaSelId === null && membros.length > 0) {
      const eu = membros.find((m) => m.pessoa_id === Number(user?.id));
      if (eu) setPessoaSelId(eu.pessoa_id);
    }
  }, [contratoDeCasa, membros, pessoaSelId, user?.id]);

  useEffect(() => {
    if (!contratoDeCasa && casaSelId === null && casas.length === 1) {
      setCasaSelId(casas[0].id);
    }
  }, [contratoDeCasa, casas, casaSelId]);

  const casaIdFinal = contratoDeCasa ? Number(params.casaId) : casaSelId;
  // Vínculo com receita fixa pessoal exige pessoa_id preenchido (400 sem ele).
  const pessoaIdFinal = contratoDeCasa ? pessoaSelId : Number(params.pessoaId);

  const podeSalvar = valor != null && data !== '' && casaIdFinal != null && !salvando;

  async function salvar() {
    if (valor == null || casaIdFinal == null) return;

    setSalvando(true);
    try {
      await createReceita({
        casa_id: casaIdFinal,
        pessoa_id: pessoaIdFinal,
        origem_id: Number(params.origemId),
        observacao: observacao.trim() || null,
        valor_bruto: null,
        descontos: null,
        valor_liquido: valor,
        data,
        // competência do lançamento segue a data do recebimento, não "hoje"
        competencia: competenciaDaData(data),
        receita_fixa_id: Number(params.receitaFixaId),
        competencia_referencia: params.competenciaReferencia,
        // chave omitida = herdar do contrato; null explícito = sem conta
        ...(contaDestino !== 'herdar' ? { conta_destino_id: contaDestino } : {}),
      });
      router.back();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.info}>
          <Text style={styles.infoNome}>{params.descricao}</Text>
          <Text style={styles.infoLinha}>Competência {params.competenciaReferencia}</Text>
          <Text style={styles.infoLinha}>
            {params.valorEsperado
              ? `Valor esperado: ${formatCurrency(Number(params.valorEsperado))}`
              : 'Valor variável — informe o valor recebido.'}
          </Text>
        </View>

        <Text style={styles.label}>Valor recebido</Text>
        <CurrencyInput value={valor} onChange={setValor} />

        <Text style={styles.label}>Data do recebimento</Text>
        <DatePickerField valor={data} onSelecionar={setData} />

        {contratoDeCasa && membros.length > 0 && (
          <>
            <Text style={styles.label}>Pessoa</Text>
            <View style={styles.opcoesContainer}>
              <Pressable
                style={[styles.opcao, pessoaSelId === null && styles.opcaoAtiva]}
                onPress={() => setPessoaSelId(null)}
              >
                <Text style={[styles.opcaoTexto, pessoaSelId === null && styles.opcaoTextoAtivo]}>
                  Nenhuma
                </Text>
              </Pressable>
              {membros.map((m) => (
                <Pressable
                  key={m.pessoa_id}
                  style={[styles.opcao, pessoaSelId === m.pessoa_id && styles.opcaoAtiva]}
                  onPress={() => setPessoaSelId(m.pessoa_id)}
                >
                  <Text style={[styles.opcaoTexto, pessoaSelId === m.pessoa_id && styles.opcaoTextoAtivo]}>
                    {m.nome}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {!contratoDeCasa && casas.length > 0 && (
          <>
            <Text style={styles.label}>Casa</Text>
            <View style={styles.opcoesContainer}>
              {casas.map((casa) => (
                <Pressable
                  key={casa.id}
                  style={[styles.opcao, casaSelId === casa.id && styles.opcaoAtiva]}
                  onPress={() => setCasaSelId(casa.id)}
                >
                  <Text style={[styles.opcaoTexto, casaSelId === casa.id && styles.opcaoTextoAtivo]}>
                    {casa.nome}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <Text style={styles.label}>Conta de destino</Text>
        <View style={styles.opcoesContainer}>
          <Pressable
            style={[styles.opcao, contaDestino === 'herdar' && styles.opcaoAtiva]}
            onPress={() => setContaDestino('herdar')}
          >
            <Text style={[styles.opcaoTexto, contaDestino === 'herdar' && styles.opcaoTextoAtivo]}>
              Padrão do contrato
            </Text>
          </Pressable>
          <Pressable
            style={[styles.opcao, contaDestino === null && styles.opcaoAtiva]}
            onPress={() => setContaDestino(null)}
          >
            <Text style={[styles.opcaoTexto, contaDestino === null && styles.opcaoTextoAtivo]}>
              Nenhuma
            </Text>
          </Pressable>
          {contas
            .filter((c) => c.tipo !== 'credito' && c.ativo)
            .map((c) => (
              <Pressable
                key={c.id}
                style={[styles.opcao, contaDestino === c.id && styles.opcaoAtiva]}
                onPress={() => setContaDestino(c.id)}
              >
                <Text style={[styles.opcaoTexto, contaDestino === c.id && styles.opcaoTextoAtivo]}>
                  {c.nome}
                </Text>
              </Pressable>
            ))}
        </View>

        <Text style={styles.label}>Observação</Text>
        <TextInput
          style={styles.input}
          value={observacao}
          onChangeText={setObservacao}
          placeholder="Opcional"
        />

        <Pressable
          style={[styles.botao, !podeSalvar && styles.botaoDesabilitado]}
          onPress={salvar}
          disabled={!podeSalvar}
        >
          {salvando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.botaoTexto}>Registrar recebimento</Text>
          }
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:         { padding: 24, gap: 6 },

  info:              { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 16, gap: 4, marginBottom: 8 },
  infoNome:          { fontSize: 16, fontWeight: '600' },
  infoLinha:         { fontSize: 14, color: '#555' },

  label:             { fontSize: 14, color: '#555', marginTop: 10 },
  input:             { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },

  opcoesContainer:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao:             { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  opcaoAtiva:        { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  opcaoTexto:        { fontSize: 14, color: '#555' },
  opcaoTextoAtivo:   { color: '#1565c0', fontWeight: '600' },

  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },
});
