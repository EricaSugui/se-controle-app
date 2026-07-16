import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CurrencyInput } from '@/src/components/ui/CurrencyInput';
import { DatePickerField } from '@/src/components/ui/DatePickerField';
import type { CartaoConta, CartaoContaInput, Pessoa, TipoCartaoConta } from '@/src/types';

export type CartaoContaFormValues = {
  nome: string;
  tipo: TipoCartaoConta;
  titularId: number | null;
  limite: number | null;
  diaFechamento: string;
  diaVencimento: string;
  contaDebitoId: number | null;
  saldoBase: number | null;
  saldoBaseData: string; // AAAA-MM-DD ou ''
};

const LABEL_TIPO: Record<TipoCartaoConta, string> = {
  credito: 'Crédito',
  debito: 'Débito',
  aplicacao: 'Aplicação',
};

// saldo_base e saldo_base_data são um par: o backend rejeita um sem o outro.
export function parSaldoCompleto(values: CartaoContaFormValues): boolean {
  return (values.saldoBase == null) === (values.saldoBaseData === '');
}

// Campos de um tipo enviados no outro são rejeitados com 400 — o payload
// zera o que não pertence ao tipo atual (o form pode ter estado residual
// de quando outro tipo estava selecionado).
export function cartaoContaParaInput(values: CartaoContaFormValues): CartaoContaInput {
  const ehCredito = values.tipo === 'credito';
  return {
    nome: values.nome.trim(),
    tipo: values.tipo,
    titular_id: values.titularId!,
    limite: ehCredito ? values.limite : null,
    dia_fechamento: ehCredito && values.diaFechamento ? Number(values.diaFechamento) : null,
    dia_vencimento: ehCredito && values.diaVencimento ? Number(values.diaVencimento) : null,
    conta_debito_id: ehCredito ? values.contaDebitoId : null,
    saldo_base: ehCredito ? null : values.saldoBase,
    saldo_base_data: !ehCredito && values.saldoBaseData ? values.saldoBaseData : null,
  };
}

type Props = {
  values: CartaoContaFormValues;
  onChange: (values: CartaoContaFormValues) => void;
  pessoas: Pessoa[];
  contas: CartaoConta[]; // candidatas a conta de débito da fatura
};

export function CartaoContaForm({ values, onChange, pessoas, contas }: Props) {
  function set<K extends keyof CartaoContaFormValues>(key: K, value: CartaoContaFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  const contasDebito = contas.filter(
    (c) => c.tipo !== 'credito' && c.ativo && c.titular_id === values.titularId
  );

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={values.nome}
        onChangeText={(v) => set('nome', v)}
        placeholder="Ex: Nubank"
      />

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.opcoesContainer}>
        {(['credito', 'debito', 'aplicacao'] as const).map((tipo) => (
          <Pressable
            key={tipo}
            style={[styles.opcao, values.tipo === tipo && styles.opcaoAtiva]}
            onPress={() => set('tipo', tipo)}
          >
            <Text style={[styles.opcaoTexto, values.tipo === tipo && styles.opcaoTextoAtivo]}>
              {LABEL_TIPO[tipo]}
            </Text>
          </Pressable>
        ))}
      </View>

      {pessoas.length > 0 && (
        <>
          <Text style={styles.label}>Titular</Text>
          <View style={styles.opcoesContainer}>
            {pessoas.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.opcao, values.titularId === p.id && styles.opcaoAtiva]}
                // A conta de débito deve ser do mesmo titular — trocar o
                // titular invalida a seleção anterior.
                onPress={() => onChange({ ...values, titularId: p.id, contaDebitoId: null })}
              >
                <Text style={[styles.opcaoTexto, values.titularId === p.id && styles.opcaoTextoAtivo]}>
                  {p.nome}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {values.tipo === 'credito' && (
        <>
          <Text style={styles.label}>Limite</Text>
          <CurrencyInput value={values.limite} onChange={(v) => set('limite', v)} />

          <Text style={styles.label}>Dia de fechamento</Text>
          <TextInput
            style={styles.input}
            value={values.diaFechamento}
            onChangeText={(v) => set('diaFechamento', v)}
            placeholder="Ex: 19"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Dia de vencimento</Text>
          <TextInput
            style={styles.input}
            value={values.diaVencimento}
            onChangeText={(v) => set('diaVencimento', v)}
            placeholder="Ex: 25"
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Conta que paga a fatura</Text>
          <View style={styles.opcoesContainer}>
            <Pressable
              style={[styles.opcao, values.contaDebitoId === null && styles.opcaoAtiva]}
              onPress={() => set('contaDebitoId', null)}
            >
              <Text style={[styles.opcaoTexto, values.contaDebitoId === null && styles.opcaoTextoAtivo]}>
                Nenhuma
              </Text>
            </Pressable>
            {contasDebito.map((c) => (
              <Pressable
                key={c.id}
                style={[styles.opcao, values.contaDebitoId === c.id && styles.opcaoAtiva]}
                onPress={() => set('contaDebitoId', c.id)}
              >
                <Text style={[styles.opcaoTexto, values.contaDebitoId === c.id && styles.opcaoTextoAtivo]}>
                  {c.nome}
                </Text>
              </Pressable>
            ))}
          </View>
          {values.contaDebitoId === null && (
            <Text style={styles.hint}>
              Sem conta de débito, o cartão fica fora da projeção de saldo.
            </Text>
          )}
        </>
      )}

      {values.tipo !== 'credito' && (
        <>
          <Text style={styles.label}>Saldo atual (opcional)</Text>
          <CurrencyInput value={values.saldoBase} onChange={(v) => set('saldoBase', v)} />

          <Text style={styles.label}>Data do saldo</Text>
          <View style={styles.dataRow}>
            <View style={{ flex: 1 }}>
              <DatePickerField
                valor={values.saldoBaseData}
                onSelecionar={(v) => set('saldoBaseData', v)}
                placeholder="Data do saldo informado"
              />
            </View>
            {values.saldoBaseData !== '' && (
              <Pressable onPress={() => set('saldoBaseData', '')}>
                <Text style={styles.remover}>Remover</Text>
              </Pressable>
            )}
          </View>
          {!parSaldoCompleto(values) && (
            <Text style={styles.hint}>Informe saldo e data juntos, ou nenhum dos dois.</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form:            { gap: 6 },
  label:           { fontSize: 14, color: '#555', marginTop: 10 },
  input:           { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  hint:            { fontSize: 12, color: '#e65100', marginTop: 2 },

  dataRow:         { flexDirection: 'row', alignItems: 'center', gap: 12 },
  remover:         { color: '#c62828', fontSize: 14 },

  opcoesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao:           { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  opcaoAtiva:      { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  opcaoTexto:      { fontSize: 14, color: '#555' },
  opcaoTextoAtivo: { color: '#1565c0', fontWeight: '600' },
});
