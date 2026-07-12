import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CurrencyInput } from '@/src/components/ui/CurrencyInput';
import type { Pessoa } from '@/src/types';

export type CartaoContaFormValues = {
  nome: string;
  tipo: 'credito' | 'debito';
  titularId: number | null;
  limite: number | null;
  diaFechamento: string;
  diaVencimento: string;
};

type Props = {
  values: CartaoContaFormValues;
  onChange: (values: CartaoContaFormValues) => void;
  pessoas: Pessoa[];
};

export function CartaoContaForm({ values, onChange, pessoas }: Props) {
  function set<K extends keyof CartaoContaFormValues>(key: K, value: CartaoContaFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

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
        {(['credito', 'debito'] as const).map((tipo) => (
          <Pressable
            key={tipo}
            style={[styles.opcao, values.tipo === tipo && styles.opcaoAtiva]}
            onPress={() => set('tipo', tipo)}
          >
            <Text style={[styles.opcaoTexto, values.tipo === tipo && styles.opcaoTextoAtivo]}>
              {tipo === 'credito' ? 'Crédito' : 'Débito'}
            </Text>
          </Pressable>
        ))}
      </View>

      {pessoas.length > 0 && (
        <>
          <Text style={styles.label}>Titular</Text>
          <View style={styles.opcoesContainer}>
            <Pressable
              style={[styles.opcao, values.titularId === null && styles.opcaoAtiva]}
              onPress={() => set('titularId', null)}
            >
              <Text style={[styles.opcaoTexto, values.titularId === null && styles.opcaoTextoAtivo]}>
                Nenhum
              </Text>
            </Pressable>
            {pessoas.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.opcao, values.titularId === p.id && styles.opcaoAtiva]}
                onPress={() => set('titularId', p.id)}
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
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  form:            { gap: 6 },
  label:           { fontSize: 14, color: '#555', marginTop: 10 },
  input:           { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },

  opcoesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao:           { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  opcaoAtiva:      { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  opcaoTexto:      { fontSize: 14, color: '#555' },
  opcaoTextoAtivo: { color: '#1565c0', fontWeight: '600' },
});
