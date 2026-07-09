import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MonthPicker } from '@/src/components/ui/MonthPicker';
import { DatePickerField } from '@/src/components/ui/DatePickerField';
import type { CasaDashboard, MembroCasa, OrigemReceita } from '@/src/types';

export type ReceitaFormValues = {
  casaId: number | null;
  pessoaId: number | null;
  origemId: number | null;
  observacao: string;
  valorBruto: string;
  descontos: string;
  valorLiquido: string;
  data: string;
  competencia: string;
};

type Props = {
  values: ReceitaFormValues;
  onChange: (values: ReceitaFormValues) => void;
  casas: CasaDashboard[];
  membros: MembroCasa[];
  origens: OrigemReceita[];
};

export function ReceitaForm({ values, onChange, casas, membros, origens }: Props) {
  const [seletorCompetenciaVisivel, setSeletorCompetenciaVisivel] = useState(false);

  function set<K extends keyof ReceitaFormValues>(key: K, value: ReceitaFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function alterarBrutoOuDescontos(bruto: string, descontos: string) {
    const brutoNum = Number(bruto);
    if (bruto.trim() !== '' && !Number.isNaN(brutoNum)) {
      const descontosNum = Number(descontos);
      const liquido = brutoNum - (descontos.trim() !== '' && !Number.isNaN(descontosNum) ? descontosNum : 0);
      onChange({ ...values, valorBruto: bruto, descontos, valorLiquido: String(liquido) });
    } else {
      onChange({ ...values, valorBruto: bruto, descontos });
    }
  }

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Casa</Text>
      <View style={styles.opcoesContainer}>
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

      {values.casaId != null && membros.length > 0 && (
        <>
          <Text style={styles.label}>Pessoa</Text>
          <View style={styles.opcoesContainer}>
            <Pressable
              style={[styles.opcao, values.pessoaId === null && styles.opcaoAtiva]}
              onPress={() => set('pessoaId', null)}
            >
              <Text style={[styles.opcaoTexto, values.pessoaId === null && styles.opcaoTextoAtivo]}>
                Nenhuma
              </Text>
            </Pressable>
            {membros.map((m) => (
              <Pressable
                key={m.pessoa_id}
                style={[styles.opcao, values.pessoaId === m.pessoa_id && styles.opcaoAtiva]}
                onPress={() => set('pessoaId', m.pessoa_id)}
              >
                <Text style={[styles.opcaoTexto, values.pessoaId === m.pessoa_id && styles.opcaoTextoAtivo]}>
                  {m.nome}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {origens.length > 0 && (
        <>
          <Text style={styles.label}>Origem</Text>
          <View style={styles.opcoesContainer}>
            <Pressable
              style={[styles.opcao, values.origemId === null && styles.opcaoAtiva]}
              onPress={() => set('origemId', null)}
            >
              <Text style={[styles.opcaoTexto, values.origemId === null && styles.opcaoTextoAtivo]}>
                Nenhuma
              </Text>
            </Pressable>
            {origens.map((o) => (
              <Pressable
                key={o.id}
                style={[styles.opcao, values.origemId === o.id && styles.opcaoAtiva]}
                onPress={() => set('origemId', o.id)}
              >
                <Text style={[styles.opcaoTexto, values.origemId === o.id && styles.opcaoTextoAtivo]}>
                  {o.nome}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>Valor bruto</Text>
      <TextInput
        style={styles.input}
        value={values.valorBruto}
        onChangeText={(v) => alterarBrutoOuDescontos(v, values.descontos)}
        placeholder="Ex: 5500"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Descontos</Text>
      <TextInput
        style={styles.input}
        value={values.descontos}
        onChangeText={(v) => alterarBrutoOuDescontos(values.valorBruto, v)}
        placeholder="Ex: 500"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Valor líquido</Text>
      <TextInput
        style={styles.input}
        value={values.valorLiquido}
        onChangeText={(v) => set('valorLiquido', v)}
        placeholder="Ex: 5000"
        keyboardType="decimal-pad"
      />

      <Text style={styles.label}>Data</Text>
      <DatePickerField valor={values.data} onSelecionar={(v) => set('data', v)} />

      <Text style={styles.label}>Competência</Text>
      <Pressable style={styles.input} onPress={() => setSeletorCompetenciaVisivel(true)}>
        <Text>{values.competencia}</Text>
      </Pressable>

      <Text style={styles.label}>Observação</Text>
      <TextInput
        style={styles.input}
        value={values.observacao}
        onChangeText={(v) => set('observacao', v)}
        placeholder="Opcional"
      />

      <MonthPicker
        visivel={seletorCompetenciaVisivel}
        valor={values.competencia}
        onSelecionar={(c) => set('competencia', c)}
        onFechar={() => setSeletorCompetenciaVisivel(false)}
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
