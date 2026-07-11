import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { CasaDashboard } from '@/src/types';

export type MetaFormValues = {
  // exatamente um entre pessoaId e casaId (escopo imutável após a criação)
  pessoaId: number | null;
  casaId: number | null;
  objetivo: string;
  valorAtual: string;
  meta: string;
  falta: string;
};

type Props = {
  values: MetaFormValues;
  onChange: (values: MetaFormValues) => void;
  casas: CasaDashboard[];
  usuarioPessoaId: number;
  mostrarEscopo: boolean;
};

export function MetaForm({ values, onChange, casas, usuarioPessoaId, mostrarEscopo }: Props) {
  function set<K extends keyof MetaFormValues>(key: K, value: MetaFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function alterarValores(valorAtual: string, meta: string) {
    const metaNum = Number(meta);
    if (meta.trim() !== '' && !Number.isNaN(metaNum)) {
      const atualNum = Number(valorAtual);
      const falta = metaNum - (valorAtual.trim() !== '' && !Number.isNaN(atualNum) ? atualNum : 0);
      onChange({ ...values, valorAtual, meta, falta: String(falta) });
    } else {
      onChange({ ...values, valorAtual, meta });
    }
  }

  const escopoPessoal = values.pessoaId != null;

  return (
    <View style={styles.form}>
      {mostrarEscopo && (
        <>
          <Text style={styles.label}>Meta de quem?</Text>
          <View style={styles.opcoesContainer}>
            <Pressable
              style={[styles.opcao, escopoPessoal && styles.opcaoAtiva]}
              onPress={() => onChange({ ...values, pessoaId: usuarioPessoaId, casaId: null })}
            >
              <Text style={[styles.opcaoTexto, escopoPessoal && styles.opcaoTextoAtivo]}>Pessoal</Text>
            </Pressable>
            {casas.map((casa) => (
              <Pressable
                key={casa.id}
                style={[styles.opcao, values.casaId === casa.id && styles.opcaoAtiva]}
                onPress={() => onChange({ ...values, casaId: casa.id, pessoaId: null })}
              >
                <Text style={[styles.opcaoTexto, values.casaId === casa.id && styles.opcaoTextoAtivo]}>
                  {casa.nome}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>Objetivo</Text>
      <TextInput
        style={styles.input}
        value={values.objetivo}
        onChangeText={(v) => set('objetivo', v)}
        placeholder="Ex: Entrada Apartamento"
      />

      <Text style={styles.label}>Valor atual</Text>
      <TextInput
        style={styles.input}
        value={values.valorAtual}
        onChangeText={(v) => alterarValores(v, values.meta)}
        placeholder="Ex: 0"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Meta</Text>
      <TextInput
        style={styles.input}
        value={values.meta}
        onChangeText={(v) => alterarValores(values.valorAtual, v)}
        placeholder="Ex: 50000"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Falta</Text>
      <TextInput
        style={styles.input}
        value={values.falta}
        onChangeText={(v) => set('falta', v)}
        placeholder="Calculado automaticamente"
        keyboardType="decimal-pad"
      />
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
