import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useNavigation } from 'expo-router';
import { getFatura, updateFatura } from '@/src/services/api/faturas';
import { DatePickerField } from '@/src/components/ui/DatePickerField';
import { formatCurrency, formatDate } from '@/src/utils/formatters';
import { notificar } from '@/src/utils/confirmar';
import type { Parcela } from '@/src/types';

type FormDatas = {
  abertura: string;
  fechamento: string;
  vencimento: string;
};

export default function FaturaScreen() {
  const { faturaId } = useLocalSearchParams<{ faturaId: string }>();
  const navigation = useNavigation();
  const id = Number(faturaId);

  const [mesReferencia, setMesReferencia] = useState('');
  const [datas, setDatas] = useState<FormDatas | null>(null);
  const [parcelas, setParcelas] = useState<Parcela[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Busca por id (a tela é reaproveitada entre navegações — o fetch keyed no
  // id garante que sempre mostramos os dados da fatura certa).
  const carregar = useCallback(() => {
    if (!id) return;
    setDatas(null);
    setError(null);
    getFatura(id)
      .then((fatura) => {
        setMesReferencia(fatura.mes_referencia);
        setDatas({
          abertura: fatura.data_abertura ? fatura.data_abertura.slice(0, 10) : '',
          fechamento: fatura.data_fechamento ? fatura.data_fechamento.slice(0, 10) : '',
          vencimento: fatura.data_vencimento ? fatura.data_vencimento.slice(0, 10) : '',
        });
        setParcelas(fatura.parcelas ?? []);
        navigation.setOptions({ title: `Fatura ${fatura.mes_referencia}` });
      })
      .catch((e: Error) => setError(e.message));
  }, [id, navigation]);

  useFocusEffect(carregar);

  const total = parcelas.reduce((acc, p) => acc + Number(p.valor), 0);
  const podeSalvar = datas != null && datas.fechamento !== '' && datas.vencimento !== '' && !salvando;

  async function salvar() {
    if (datas == null || !datas.fechamento || !datas.vencimento) return;

    setSalvando(true);
    try {
      await updateFatura(id, {
        data_abertura: datas.abertura || null,
        data_fechamento: datas.fechamento,
        data_vencimento: datas.vencimento,
      });
      notificar('Fatura atualizada');
      carregar();
    } catch (e: unknown) {
      notificar('Erro', (e as Error).message);
    } finally {
      setSalvando(false);
    }
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

  if (datas == null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.mesReferencia}>Mês de referência: {mesReferencia}</Text>

      <View style={styles.labelRow}>
        <Text style={styles.label}>Data de abertura</Text>
        {datas.abertura !== '' && (
          <Pressable onPress={() => setDatas({ ...datas, abertura: '' })}>
            <Text style={styles.limpar}>Limpar</Text>
          </Pressable>
        )}
      </View>
      <DatePickerField valor={datas.abertura} onSelecionar={(v) => setDatas({ ...datas, abertura: v })} placeholder="Opcional" />

      <Text style={styles.label}>Data de fechamento</Text>
      <DatePickerField valor={datas.fechamento} onSelecionar={(v) => setDatas({ ...datas, fechamento: v })} />

      <Text style={styles.label}>Data de vencimento</Text>
      <DatePickerField valor={datas.vencimento} onSelecionar={(v) => setDatas({ ...datas, vencimento: v })} />

      {parcelas.length > 0 && (
        <>
          <Text style={styles.secaoTitulo}>Parcelas · total {formatCurrency(total)}</Text>
          {parcelas.map((p) => (
            <View key={p.id} style={styles.parcelaItem}>
              <Text style={styles.parcelaTexto}>
                {`Parcela ${p.numero_parcela} — ${formatCurrency(p.valor)} — compra #${p.compra_id}`}
              </Text>
              {p.data_caixa && <Text style={styles.parcelaData}>{formatDate(p.data_caixa)}</Text>}
            </View>
          ))}
        </>
      )}

      <Pressable
        style={[styles.botao, !podeSalvar && styles.botaoDesabilitado]}
        onPress={salvar}
        disabled={!podeSalvar}
      >
        {salvando
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.botaoTexto}>Salvar datas</Text>
        }
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center:            { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  container:         { padding: 24, gap: 6 },

  mesReferencia:     { fontSize: 13, color: '#777', fontStyle: 'italic', marginBottom: 8 },

  labelRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  label:             { fontSize: 14, color: '#555', marginTop: 10 },
  limpar:            { fontSize: 13, color: '#1565c0' },

  secaoTitulo:       { fontSize: 14, fontWeight: '600', color: '#555', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 20, marginBottom: 4 },
  parcelaItem:       { backgroundColor: '#f5f5f5', borderRadius: 8, padding: 10, marginBottom: 4 },
  parcelaTexto:      { fontSize: 13, color: '#333' },
  parcelaData:       { fontSize: 12, color: '#777', marginTop: 2 },

  botao:             { backgroundColor: '#1565c0', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 20 },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto:        { color: '#fff', fontWeight: '600', fontSize: 15 },

  erro:              { color: '#c62828', textAlign: 'center', padding: 16 },
  retry:             { padding: 10 },
  retryTexto:        { color: '#1565c0' },
});
