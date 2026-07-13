import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { DatePickerField } from '@/src/components/ui/DatePickerField';
import { CurrencyInput } from '@/src/components/ui/CurrencyInput';
import type {
  CasaDashboard,
  Categoria,
  DespesaFixa,
  DespesaFixaInput,
  PeriodicidadeDespesaFixa,
  TipoValorDespesaFixa,
} from '@/src/types';

export type DespesaFixaFormValues = {
  escopo: 'casa' | 'pessoal';
  casaId: number | null; // usado quando escopo === 'casa'
  categoriaId: number | null;
  descricao: string;
  tipoValor: TipoValorDespesaFixa;
  valorReferencia: number | null;
  periodicidade: PeriodicidadeDespesaFixa;
  diaEsperado: string;
  vigenteDesde: string;
  vigenteAte: string; // '' = sem data de fim
};

type Props = {
  values: DespesaFixaFormValues;
  onChange: (values: DespesaFixaFormValues) => void;
  casas: CasaDashboard[];
  categorias: Categoria[];
  // editar/reajuste: escopo é imutável no backend — exibe texto fixo no lugar dos chips
  escopoBloqueado?: boolean;
};

export function despesaFixaParaInput(
  v: DespesaFixaFormValues,
  userId: number,
  anteriorId?: number
): DespesaFixaInput {
  return {
    casa_id: v.escopo === 'casa' ? v.casaId : null,
    pessoa_id: v.escopo === 'pessoal' ? userId : null,
    categoria_id: v.categoriaId!,
    descricao: v.descricao.trim(),
    tipo_valor: v.tipoValor,
    valor_referencia: v.valorReferencia!,
    periodicidade: v.periodicidade,
    dia_esperado: Number(v.diaEsperado),
    vigente_desde: v.vigenteDesde,
    vigente_ate: v.vigenteAte || null,
    ...(anteriorId != null ? { despesa_fixa_anterior_id: anteriorId } : {}),
  };
}

export function despesaFixaParaFormValues(d: DespesaFixa): DespesaFixaFormValues {
  return {
    escopo: d.casa_id != null ? 'casa' : 'pessoal',
    casaId: d.casa_id,
    categoriaId: d.categoria_id,
    descricao: d.descricao,
    tipoValor: d.tipo_valor,
    valorReferencia: d.valor_referencia,
    periodicidade: d.periodicidade,
    diaEsperado: String(d.dia_esperado),
    vigenteDesde: d.vigente_desde.slice(0, 10),
    vigenteAte: d.vigente_ate ? d.vigente_ate.slice(0, 10) : '',
  };
}

const TIPOS_VALOR: { valor: TipoValorDespesaFixa; label: string }[] = [
  { valor: 'fixo', label: 'Fixo' },
  { valor: 'variavel_estimado', label: 'Variável (estimado)' },
];

const PERIODICIDADES: { valor: PeriodicidadeDespesaFixa; label: string }[] = [
  { valor: 'mensal', label: 'Mensal' },
  { valor: 'anual', label: 'Anual' },
];

export function DespesaFixaForm({ values, onChange, casas, categorias, escopoBloqueado = false }: Props) {
  function set<K extends keyof DespesaFixaFormValues>(key: K, value: DespesaFixaFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  const nomeCasa = casas.find((c) => c.id === values.casaId)?.nome;

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Escopo</Text>
      {escopoBloqueado ? (
        <Text style={styles.escopoFixo}>
          {values.escopo === 'casa' ? `Casa${nomeCasa ? `: ${nomeCasa}` : ''}` : 'Pessoal'}
        </Text>
      ) : (
        <>
          <View style={styles.opcoesContainer}>
            <Pressable
              style={[styles.opcao, values.escopo === 'casa' && styles.opcaoAtiva]}
              onPress={() => set('escopo', 'casa')}
            >
              <Text style={[styles.opcaoTexto, values.escopo === 'casa' && styles.opcaoTextoAtivo]}>
                Casa
              </Text>
            </Pressable>
            <Pressable
              style={[styles.opcao, values.escopo === 'pessoal' && styles.opcaoAtiva]}
              onPress={() => onChange({ ...values, escopo: 'pessoal', casaId: null })}
            >
              <Text style={[styles.opcaoTexto, values.escopo === 'pessoal' && styles.opcaoTextoAtivo]}>
                Pessoal
              </Text>
            </Pressable>
          </View>

          {values.escopo === 'casa' && (
            <>
              <Text style={styles.label}>Casa</Text>
              <View style={styles.opcoesContainer}>
                {casas.map((casa) => (
                  <Pressable
                    key={casa.id}
                    style={[styles.opcao, values.casaId === casa.id && styles.opcaoAtiva]}
                    onPress={() => set('casaId', casa.id)}
                  >
                    <Text style={[styles.opcaoTexto, values.casaId === casa.id && styles.opcaoTextoAtivo]}>
                      {casa.nome}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </>
      )}

      {categorias.length > 0 && (
        <>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.opcoesContainer}>
            {categorias.map((cat) => (
              <Pressable
                key={cat.id}
                style={[styles.opcao, values.categoriaId === cat.id && styles.opcaoAtiva]}
                onPress={() => set('categoriaId', cat.id)}
              >
                <Text style={[styles.opcaoTexto, values.categoriaId === cat.id && styles.opcaoTextoAtivo]}>
                  {cat.nome}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        value={values.descricao}
        onChangeText={(v) => set('descricao', v)}
        placeholder="Ex: Aluguel - apto Campinas"
      />

      <Text style={styles.label}>Tipo de valor</Text>
      <View style={styles.opcoesContainer}>
        {TIPOS_VALOR.map((t) => (
          <Pressable
            key={t.valor}
            style={[styles.opcao, values.tipoValor === t.valor && styles.opcaoAtiva]}
            onPress={() => set('tipoValor', t.valor)}
          >
            <Text style={[styles.opcaoTexto, values.tipoValor === t.valor && styles.opcaoTextoAtivo]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Valor de referência</Text>
      <CurrencyInput value={values.valorReferencia} onChange={(v) => set('valorReferencia', v)} />

      <Text style={styles.label}>Periodicidade</Text>
      <View style={styles.opcoesContainer}>
        {PERIODICIDADES.map((p) => (
          <Pressable
            key={p.valor}
            style={[styles.opcao, values.periodicidade === p.valor && styles.opcaoAtiva]}
            onPress={() => set('periodicidade', p.valor)}
          >
            <Text style={[styles.opcaoTexto, values.periodicidade === p.valor && styles.opcaoTextoAtivo]}>
              {p.label}
            </Text>
          </Pressable>
        ))}
      </View>
      {values.periodicidade === 'anual' && (
        <Text style={styles.hint}>Anual: o pagamento é esperado no mês de início da vigência.</Text>
      )}

      <Text style={styles.label}>Dia esperado (1 a 31)</Text>
      <TextInput
        style={styles.input}
        value={values.diaEsperado}
        onChangeText={(v) => set('diaEsperado', v)}
        placeholder="Ex: 5"
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Vigente desde</Text>
      <DatePickerField valor={values.vigenteDesde} onSelecionar={(v) => set('vigenteDesde', v)} />

      <Text style={styles.label}>Vigente até (opcional)</Text>
      <View style={styles.vigenteAteRow}>
        <View style={{ flex: 1 }}>
          <DatePickerField
            valor={values.vigenteAte}
            onSelecionar={(v) => set('vigenteAte', v)}
            placeholder="Sem data de fim"
          />
        </View>
        {values.vigenteAte !== '' && (
          <Pressable onPress={() => set('vigenteAte', '')}>
            <Text style={styles.remover}>Remover</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form:            { gap: 6 },
  label:           { fontSize: 14, color: '#555', marginTop: 10 },
  input:           { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16 },
  hint:            { fontSize: 13, color: '#777', marginTop: 4 },
  escopoFixo:      { fontSize: 15, fontWeight: '500' },

  vigenteAteRow:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  remover:         { color: '#c62828', fontSize: 14 },

  opcoesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao:           { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  opcaoAtiva:      { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  opcaoTexto:      { fontSize: 14, color: '#555' },
  opcaoTextoAtivo: { color: '#1565c0', fontWeight: '600' },
});
