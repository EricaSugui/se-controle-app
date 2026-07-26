import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { getAcerto, registrarPagamentoAcerto, excluirPagamentoAcerto } from '@/src/services/api/acerto';
import { getMembros, updateCasa } from '@/src/services/api/casas';
import { CurrencyInput } from '@/src/components/ui/CurrencyInput';
import { DatePickerField } from '@/src/components/ui/DatePickerField';
import { useAuth } from '@/src/context/AuthContext';
import { confirmar, notificar } from '@/src/utils/confirmar';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import type { AcertoContas, AvisoAcerto, EixoAcerto, MembroCasa, PagamentoAcerto, SaldoAcertoPessoa } from '@/src/types';

const EIXOS: { valor: EixoAcerto; label: string }[] = [
  { valor: 'competencia', label: 'Mês da compra' },
  { valor: 'caixa', label: 'Por parcela' },
];

// Meio centavo de tolerância — os valores chegam arredondados do backend.
const ZERO = 0.005;

function hojeISO(): string {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

export default function AcertoContasScreen() {
  const { id, nome } = useLocalSearchParams<{ id: string; nome: string }>();
  const navigation = useNavigation();
  const { user } = useAuth();
  const casaId = Number(id);

  const [acerto, setAcerto] = useState<AcertoContas | null>(null);
  const [membros, setMembros] = useState<MembroCasa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // form de pagamento/adiantamento
  const [dePessoaId, setDePessoaId] = useState<number | null>(null);
  const [paraPessoaId, setParaPessoaId] = useState<number | null>(null);
  const [valor, setValor] = useState<number | null>(null);
  const [data, setData] = useState(hojeISO());
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(() => {
    if (!casaId) return;
    setLoading(true);
    setError(null);
    Promise.all([getAcerto(casaId), getMembros(casaId)])
      .then(([acertoResp, membrosResp]) => {
        setAcerto(acertoResp);
        setMembros(membrosResp);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [casaId]);

  useFocusEffect(carregar);

  useFocusEffect(
    useCallback(() => {
      if (nome) navigation.setOptions({ title: `Acerto — ${nome}` });
    }, [nome, navigation])
  );

  // No caso comum (um devedor e um credor), pré-preenche a transferência.
  useEffect(() => {
    if (acerto == null || dePessoaId != null || paraPessoaId != null) return;
    const devedores = acerto.saldos.filter((s) => s.saldo < -ZERO);
    const credores = acerto.saldos.filter((s) => s.saldo > ZERO);
    if (devedores.length === 1 && credores.length === 1) {
      setDePessoaId(devedores[0].pessoa_id);
      setParaPessoaId(credores[0].pessoa_id);
    }
  }, [acerto, dePessoaId, paraPessoaId]);

  const souAdmin = membros.some((m) => m.pessoa_id === Number(user?.id) && m.papel === 'admin');

  async function mudarEixo(eixo: EixoAcerto) {
    if (acerto == null || eixo === acerto.acerto_eixo || !nome) return;
    try {
      await updateCasa(casaId, { nome, acerto_eixo: eixo });
      carregar();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    }
  }

  const podeRegistrar =
    dePessoaId != null && paraPessoaId != null && dePessoaId !== paraPessoaId &&
    valor != null && valor > 0 && data !== '' && !salvando;

  async function registrar() {
    if (dePessoaId == null || paraPessoaId == null || valor == null) return;
    setSalvando(true);
    try {
      await registrarPagamentoAcerto(casaId, {
        de_pessoa_id: dePessoaId,
        para_pessoa_id: paraPessoaId,
        valor,
        data,
        observacao: observacao.trim() || null,
      });
      setValor(null);
      setObservacao('');
      carregar();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExcluir(pg: PagamentoAcerto) {
    confirmar(
      {
        titulo: 'Excluir pagamento',
        mensagem: `Desfazer o pagamento de ${formatCurrency(pg.valor)} de ${pg.de_pessoa_nome} para ${pg.para_pessoa_nome}?`,
        textoConfirmar: 'Excluir',
      },
      async () => {
        try {
          await excluirPagamentoAcerto(casaId, pg.id);
          carregar();
        } catch (e: unknown) {
          notificar('Erro', (e as Error).message);
        }
      }
    );
  }

  function abrirAviso(aviso: AvisoAcerto) {
    if (aviso.tipo === 'meses_sem_combinado' || aviso.tipo === 'combinado_nao_soma_100') {
      router.push({ pathname: '/(app)/mais/casas/combinado', params: { id: casaId, nome } });
    } else if (aviso.tipo === 'compras_sem_meio') {
      router.push('/(app)/gastos');
    }
  }

  function situacao(s: SaldoAcertoPessoa): { texto: string; cor: string } {
    if (s.saldo > ZERO) return { texto: 'a receber', cor: '#2e7d32' };
    if (s.saldo < -ZERO) return { texto: 'a pagar', cor: '#c62828' };
    return { texto: 'em dia', cor: '#777' };
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || acerto == null) {
    return (
      <View style={styles.center}>
        <Text style={styles.erro}>{error ?? 'Não foi possível carregar o acerto.'}</Text>
        <Pressable onPress={carregar} style={styles.retry}>
          <Text style={styles.retryTexto}>Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  const devedores = acerto.saldos.filter((s) => s.saldo < -ZERO);
  const credores = acerto.saldos.filter((s) => s.saldo > ZERO);
  const resumo =
    devedores.length === 1 && credores.length === 1
      ? `${devedores[0].nome} deve ${formatCurrency(-devedores[0].saldo)} para ${credores[0].nome}`
      : devedores.length === 0 && credores.length === 0 && acerto.saldos.length > 0
        ? 'Contas em dia — ninguém deve nada.'
        : null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {acerto.avisos.map((aviso) => (
          <Pressable key={aviso.tipo} style={styles.aviso} onPress={() => abrirAviso(aviso)}>
            <Text style={styles.avisoTexto}>
              {aviso.mensagem}
              {aviso.tipo !== 'rateio_nao_soma_100' ? ' ›' : ''}
            </Text>
          </Pressable>
        ))}

        {resumo && <Text style={styles.resumo}>{resumo}</Text>}

        <Text style={styles.secaoTitulo}>Saldo por pessoa</Text>
        {acerto.saldos.length === 0 && (
          <Text style={styles.vazio}>Nenhuma compra nem pagamento entrou no acerto ainda.</Text>
        )}
        {acerto.saldos.map((s) => {
          const { texto, cor } = situacao(s);
          return (
            <View key={s.pessoa_id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.pessoaNome}>{s.nome}</Text>
                <Text style={[styles.pessoaSaldo, { color: cor }]}>
                  {formatCurrency(Math.abs(s.saldo))} {texto}
                </Text>
              </View>
              <Text style={styles.detalhe}>
                Devido {formatCurrency(s.devido)} · Desembolsou {formatCurrency(s.desembolsado)}
              </Text>
              {(s.pagamentos_enviados > 0 || s.pagamentos_recebidos > 0) && (
                <Text style={styles.detalhe}>
                  Enviou {formatCurrency(s.pagamentos_enviados)} · Recebeu {formatCurrency(s.pagamentos_recebidos)}
                </Text>
              )}
            </View>
          );
        })}

        <Text style={styles.secaoTitulo}>Registrar pagamento</Text>
        <Text style={styles.hint}>
          Reembolso ou adiantamento — a transferência vira crédito que os gastos vão consumindo.
        </Text>

        <Text style={styles.label}>Quem pagou</Text>
        <View style={styles.opcoesContainer}>
          {membros.map((m) => (
            <Pressable
              key={m.pessoa_id}
              style={[styles.opcao, dePessoaId === m.pessoa_id && styles.opcaoAtiva]}
              onPress={() => setDePessoaId(m.pessoa_id)}
            >
              <Text style={[styles.opcaoTexto, dePessoaId === m.pessoa_id && styles.opcaoTextoAtivo]}>
                {m.nome}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Quem recebeu</Text>
        <View style={styles.opcoesContainer}>
          {membros.map((m) => (
            <Pressable
              key={m.pessoa_id}
              style={[styles.opcao, paraPessoaId === m.pessoa_id && styles.opcaoAtiva]}
              onPress={() => setParaPessoaId(m.pessoa_id)}
            >
              <Text style={[styles.opcaoTexto, paraPessoaId === m.pessoa_id && styles.opcaoTextoAtivo]}>
                {m.nome}
              </Text>
            </Pressable>
          ))}
        </View>
        {dePessoaId != null && dePessoaId === paraPessoaId && (
          <Text style={styles.alerta}>Quem pagou e quem recebeu devem ser pessoas diferentes.</Text>
        )}

        <Text style={styles.label}>Valor</Text>
        <CurrencyInput value={valor} onChange={setValor} />

        <Text style={styles.label}>Data</Text>
        <DatePickerField valor={data} onSelecionar={setData} />

        <Text style={styles.label}>Observação</Text>
        <TextInput
          style={styles.input}
          value={observacao}
          onChangeText={setObservacao}
          placeholder="Opcional — ex: adiantamento de julho"
        />

        <Pressable
          style={[styles.botao, !podeRegistrar && styles.botaoDesabilitado]}
          onPress={registrar}
          disabled={!podeRegistrar}
        >
          {salvando
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.botaoTexto}>Registrar pagamento</Text>
          }
        </Pressable>

        {acerto.pagamentos.length > 0 && (
          <>
            <Text style={styles.secaoTitulo}>Pagamentos registrados</Text>
            {acerto.pagamentos.map((pg) => (
              <View key={pg.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.pagamentoTitulo}>
                    {pg.de_pessoa_nome} → {pg.para_pessoa_nome}
                  </Text>
                  <Text style={styles.pagamentoValor}>{formatCurrency(pg.valor)}</Text>
                </View>
                <View style={styles.cardHeader}>
                  <Text style={styles.detalhe}>
                    {formatDate(pg.data)}
                    {pg.observacao ? ` · ${pg.observacao}` : ''}
                  </Text>
                  <Pressable onPress={() => confirmarExcluir(pg)}>
                    <Text style={styles.excluir}>Excluir</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </>
        )}

        {acerto.meses.length > 0 && (
          <>
            <Text style={styles.secaoTitulo}>Extrato por mês</Text>
            {acerto.meses.map((m) => (
              <View key={m.mes} style={styles.card}>
                <Text style={styles.mesTitulo}>{m.mes}</Text>
                {m.por_pessoa.map((p) => (
                  <Text key={p.pessoa_id} style={styles.detalhe}>
                    {p.nome} — devido {formatCurrency(p.devido)} · desembolsou {formatCurrency(p.desembolsado)} ·{' '}
                    <Text style={{ color: p.acerto > ZERO ? '#2e7d32' : p.acerto < -ZERO ? '#c62828' : '#777', fontWeight: '600' }}>
                      {p.acerto >= 0 ? '+' : ''}{formatCurrency(p.acerto)}
                    </Text>
                  </Text>
                ))}
              </View>
            ))}
          </>
        )}

        <Text style={styles.secaoTitulo}>Eixo do acerto</Text>
        <Text style={styles.hint}>
          Quando as compras entram no acerto: pelo valor cheio no mês da compra, ou pingando
          conforme as parcelas vencem. Compras podem sobrepor o padrão individualmente.
        </Text>
        <View style={styles.opcoesContainer}>
          {EIXOS.map((e) => (
            <Pressable
              key={e.valor}
              style={[
                styles.opcao,
                acerto.acerto_eixo === e.valor && styles.opcaoAtiva,
                !souAdmin && styles.opcaoBloqueada,
              ]}
              onPress={() => mudarEixo(e.valor)}
              disabled={!souAdmin}
            >
              <Text style={[styles.opcaoTexto, acerto.acerto_eixo === e.valor && styles.opcaoTextoAtivo]}>
                {e.label}
              </Text>
            </Pressable>
          ))}
        </View>
        {!souAdmin && <Text style={styles.hint}>Somente admins da casa alteram o eixo.</Text>}

        <Pressable
          style={styles.linkCombinado}
          onPress={() => router.push({ pathname: '/(app)/mais/casas/combinado', params: { id: casaId, nome } })}
        >
          <Text style={styles.linkCombinadoTexto}>Percentual de custeio (combinado do mês) ›</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center:             { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:          { padding: 16, gap: 8 },

  aviso:              { backgroundColor: '#fff8e1', borderRadius: 8, padding: 12 },
  avisoTexto:         { color: '#e65100', fontWeight: '600', fontSize: 14 },

  resumo:             { fontSize: 16, fontWeight: '700', textAlign: 'center', marginVertical: 8 },

  secaoTitulo:        { fontSize: 14, fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 16, marginBottom: 2 },
  vazio:              { color: '#888', textAlign: 'center', fontStyle: 'italic', paddingVertical: 8 },

  card:               { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12, gap: 4 },
  cardHeader:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  pessoaNome:         { fontSize: 15, fontWeight: '600', flexShrink: 1 },
  pessoaSaldo:        { fontSize: 15, fontWeight: '700' },
  detalhe:            { fontSize: 13, color: '#666' },

  pagamentoTitulo:    { fontSize: 14, fontWeight: '500', flexShrink: 1 },
  pagamentoValor:     { fontSize: 14, fontWeight: '600' },
  excluir:            { color: '#c62828', fontSize: 13 },

  mesTitulo:          { fontSize: 14, fontWeight: '700' },

  hint:               { fontSize: 12, color: '#999' },
  label:              { fontSize: 14, color: '#555', marginTop: 8 },
  alerta:             { fontSize: 13, color: '#c62828', marginTop: 4 },
  input:              { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },

  opcoesContainer:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao:              { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  opcaoAtiva:         { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  opcaoBloqueada:     { opacity: 0.6 },
  opcaoTexto:         { fontSize: 14, color: '#555' },
  opcaoTextoAtivo:    { color: '#1565c0', fontWeight: '600' },

  botao:              { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 12 },
  botaoDesabilitado:  { opacity: 0.5 },
  botaoTexto:         { color: '#fff', fontWeight: '600', fontSize: 15 },

  linkCombinado:      { marginTop: 12, paddingVertical: 8 },
  linkCombinadoTexto: { color: '#1565c0', fontSize: 14, fontWeight: '600' },

  erro:               { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:              { padding: 10 },
  retryTexto:         { color: '#1565c0' },
});
