import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { createCompra } from '@/src/services/api/compras';
import { getCartoesContas } from '@/src/services/api/cartoesContas';
import { getFormasPagamento } from '@/src/services/api/formasPagamento';
import { getMembros } from '@/src/services/api/casas';
import { getDashboard } from '@/src/services/api/dashboard';
import { CurrencyInput } from '@/src/components/ui/CurrencyInput';
import { DatePickerField } from '@/src/components/ui/DatePickerField';
import { useAuth } from '@/src/context/AuthContext';
import { competenciaAtual } from '@/src/utils/competencia';
import { notificar } from '@/src/utils/confirmar';
import { formatCurrency } from '@/src/utils/formatters';
import type { CartaoConta, CasaDashboard, FormaPagamento, MembroCasa } from '@/src/types';

function hojeISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export default function PagamentoDespesaFixaScreen() {
  const params = useLocalSearchParams<{
    despesaFixaId: string;
    competenciaReferencia: string;
    descricao: string;
    valorReferencia: string;
    categoriaId: string;
    casaId: string; // '' = contrato pessoal
    pessoaId: string; // '' = contrato de casa
  }>();
  const navigation = useNavigation();
  const { user } = useAuth();

  const contratoDeCasa = params.casaId !== '';

  const [valor, setValor] = useState<number | null>(null);
  const [data, setData] = useState(hojeISO());
  const [descricaoCompra, setDescricaoCompra] = useState('');
  const [cartaoContaId, setCartaoContaId] = useState<number | null>(null);
  const [formaPagamentoId, setFormaPagamentoId] = useState<number | null>(null);
  // contrato de casa: casa fixa, escolhe-se a pessoa; pessoal: pessoa fixa, escolhe-se a casa
  const [pessoaSelId, setPessoaSelId] = useState<number | null>(null);
  const [casaSelId, setCasaSelId] = useState<number | null>(null);

  const [membros, setMembros] = useState<MembroCasa[]>([]);
  const [casas, setCasas] = useState<CasaDashboard[]>([]);
  const [cartoes, setCartoes] = useState<CartaoConta[]>([]);
  const [formas, setFormas] = useState<FormaPagamento[]>([]);
  const [salvando, setSalvando] = useState(false);

  // A tela fica montada entre navegações — reseta ao trocar de conta.
  useEffect(() => {
    setValor(params.valorReferencia ? Number(params.valorReferencia) : null);
    setData(hojeISO());
    setDescricaoCompra(params.descricao ?? '');
    setCartaoContaId(null);
    setFormaPagamentoId(null);
    setPessoaSelId(null);
    setCasaSelId(null);
    navigation.setOptions({ title: params.descricao ? `Pagar — ${params.descricao}` : 'Registrar pagamento' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.despesaFixaId, params.competenciaReferencia]);

  useFocusEffect(
    useCallback(() => {
      getCartoesContas(true).then(setCartoes).catch(() => {});
      getFormasPagamento(true).then(setFormas).catch(() => {});
      if (contratoDeCasa) {
        getMembros(Number(params.casaId)).then(setMembros).catch(() => setMembros([]));
      } else {
        getDashboard(competenciaAtual()).then((d) => setCasas(d.casas)).catch(() => {});
      }
    }, [contratoDeCasa, params.casaId])
  );

  // Defaults: no contrato de casa, pré-seleciona o usuário logado se for membro;
  // no pessoal, pré-seleciona a casa quando só existe uma (compra exige casa).
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
  const pessoaIdFinal = contratoDeCasa ? pessoaSelId : Number(params.pessoaId);

  const cartaoSelecionado = cartoes.find((c) => c.id === cartaoContaId);

  const podeSalvar =
    valor != null && data !== '' && casaIdFinal != null && pessoaIdFinal != null && !salvando;

  async function salvar() {
    if (valor == null || casaIdFinal == null || pessoaIdFinal == null) return;

    setSalvando(true);
    try {
      await createCompra({
        casa_id: casaIdFinal,
        pessoa_id: pessoaIdFinal,
        categoria_id: Number(params.categoriaId),
        descricao: descricaoCompra.trim() || null,
        cartao_conta_id: cartaoContaId,
        forma_pagamento_id: formaPagamentoId,
        data,
        competencia: competenciaAtual(),
        total_parcelas: 1,
        valor_parcela: valor,
        despesa_fixa_id: Number(params.despesaFixaId),
        competencia_referencia: params.competenciaReferencia,
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
            Valor de referência: {formatCurrency(Number(params.valorReferencia))}
          </Text>
        </View>

        <Text style={styles.label}>Valor pago</Text>
        <CurrencyInput value={valor} onChange={setValor} />

        <Text style={styles.label}>Data do pagamento</Text>
        <DatePickerField valor={data} onSelecionar={setData} />

        {contratoDeCasa && membros.length > 0 && (
          <>
            <Text style={styles.label}>Pessoa</Text>
            <View style={styles.opcoesContainer}>
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

        {cartoes.length > 0 && (
          <>
            <Text style={styles.label}>Cartão/conta</Text>
            <View style={styles.opcoesContainer}>
              <Pressable
                style={[styles.opcao, cartaoContaId === null && styles.opcaoAtiva]}
                onPress={() => setCartaoContaId(null)}
              >
                <Text style={[styles.opcaoTexto, cartaoContaId === null && styles.opcaoTextoAtivo]}>
                  Nenhum
                </Text>
              </Pressable>
              {cartoes.map((c) => (
                <Pressable
                  key={c.id}
                  style={[styles.opcao, cartaoContaId === c.id && styles.opcaoAtiva]}
                  onPress={() => setCartaoContaId(c.id)}
                >
                  <Text style={[styles.opcaoTexto, cartaoContaId === c.id && styles.opcaoTextoAtivo]}>
                    {c.nome}
                  </Text>
                </Pressable>
              ))}
            </View>
            {cartaoSelecionado?.tipo === 'credito' && (
              <Text style={styles.hint}>As parcelas serão atribuídas às faturas do cartão.</Text>
            )}
          </>
        )}

        {formas.length > 0 && (
          <>
            <Text style={styles.label}>Forma de pagamento</Text>
            <View style={styles.opcoesContainer}>
              <Pressable
                style={[styles.opcao, formaPagamentoId === null && styles.opcaoAtiva]}
                onPress={() => setFormaPagamentoId(null)}
              >
                <Text style={[styles.opcaoTexto, formaPagamentoId === null && styles.opcaoTextoAtivo]}>
                  Nenhuma
                </Text>
              </Pressable>
              {formas.map((f) => (
                <Pressable
                  key={f.id}
                  style={[styles.opcao, formaPagamentoId === f.id && styles.opcaoAtiva]}
                  onPress={() => setFormaPagamentoId(f.id)}
                >
                  <Text style={[styles.opcaoTexto, formaPagamentoId === f.id && styles.opcaoTextoAtivo]}>
                    {f.nome}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <Text style={styles.label}>Descrição</Text>
        <TextInput
          style={styles.input}
          value={descricaoCompra}
          onChangeText={setDescricaoCompra}
          placeholder="Opcional"
        />

        <Pressable
          style={[styles.botao, !podeSalvar && styles.botaoDesabilitado]}
          onPress={salvar}
          disabled={!podeSalvar}
        >
          {salvando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.botaoTexto}>Registrar pagamento</Text>
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
  hint:              { fontSize: 13, color: '#777', marginTop: 4 },

  opcoesContainer:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao:             { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  opcaoAtiva:        { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  opcaoTexto:        { fontSize: 14, color: '#555' },
  opcaoTextoAtivo:   { color: '#1565c0', fontWeight: '600' },

  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 16 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },
});
