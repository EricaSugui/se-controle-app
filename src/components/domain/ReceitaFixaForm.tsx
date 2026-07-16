import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { DatePickerField } from '@/src/components/ui/DatePickerField';
import { CurrencyInput } from '@/src/components/ui/CurrencyInput';
import type {
  CartaoConta,
  CasaDashboard,
  OrigemReceita,
  PeriodicidadeDespesaFixa,
  ReceitaFixa,
  ReceitaFixaInput,
  TipoConfiabilidadeReceitaFixa,
} from '@/src/types';

export type ReceitaFixaFormValues = {
  escopo: 'casa' | 'pessoal';
  casaId: number | null; // usado quando escopo === 'casa'
  origemId: number | null;
  descricao: string;
  tipoConfiabilidade: TipoConfiabilidadeReceitaFixa;
  valorEsperado: number | null; // opcional — null = variável sem estimativa
  periodicidade: PeriodicidadeDespesaFixa;
  diaEsperado: string;
  vigenteDesde: string;
  vigenteAte: string; // '' = sem data de fim
  contaDestinoId: number | null;
};

type Props = {
  values: ReceitaFixaFormValues;
  onChange: (values: ReceitaFixaFormValues) => void;
  casas: CasaDashboard[];
  origens: OrigemReceita[];
  contas: CartaoConta[]; // candidatas a conta de destino (debito/aplicacao)
  // editar/reajuste: escopo é imutável no backend — exibe texto fixo no lugar dos chips
  escopoBloqueado?: boolean;
};

export function receitaFixaParaInput(
  v: ReceitaFixaFormValues,
  userId: number,
  anteriorId?: number
): ReceitaFixaInput {
  return {
    casa_id: v.escopo === 'casa' ? v.casaId : null,
    pessoa_id: v.escopo === 'pessoal' ? userId : null,
    origem_id: v.origemId!,
    descricao: v.descricao.trim(),
    tipo_confiabilidade: v.tipoConfiabilidade,
    valor_esperado: v.valorEsperado,
    periodicidade: v.periodicidade,
    dia_esperado_recebimento: Number(v.diaEsperado),
    vigente_desde: v.vigenteDesde,
    vigente_ate: v.vigenteAte || null,
    conta_destino_id: v.contaDestinoId,
    ...(anteriorId != null ? { receita_fixa_anterior_id: anteriorId } : {}),
  };
}

export function receitaFixaParaFormValues(r: ReceitaFixa): ReceitaFixaFormValues {
  return {
    escopo: r.casa_id != null ? 'casa' : 'pessoal',
    casaId: r.casa_id,
    origemId: r.origem_id,
    descricao: r.descricao,
    tipoConfiabilidade: r.tipo_confiabilidade,
    valorEsperado: r.valor_esperado,
    periodicidade: r.periodicidade,
    diaEsperado: String(r.dia_esperado_recebimento),
    vigenteDesde: r.vigente_desde.slice(0, 10),
    vigenteAte: r.vigente_ate ? r.vigente_ate.slice(0, 10) : '',
    contaDestinoId: r.conta_destino_id ?? null,
  };
}

const TIPOS_CONFIABILIDADE: { valor: TipoConfiabilidadeReceitaFixa; label: string }[] = [
  { valor: 'fixa', label: 'Fixa' },
  { valor: 'variavel', label: 'Variável' },
];

const PERIODICIDADES: { valor: PeriodicidadeDespesaFixa; label: string }[] = [
  { valor: 'mensal', label: 'Mensal' },
  { valor: 'anual', label: 'Anual' },
];

export function ReceitaFixaForm({ values, onChange, casas, origens, contas, escopoBloqueado = false }: Props) {
  function set<K extends keyof ReceitaFixaFormValues>(key: K, value: ReceitaFixaFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  const nomeCasa = casas.find((c) => c.id === values.casaId)?.nome;
  const contasDestino = contas.filter((c) => c.tipo !== 'credito' && c.ativo);

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

      {origens.length > 0 && (
        <>
          <Text style={styles.label}>Origem</Text>
          <View style={styles.opcoesContainer}>
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

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        value={values.descricao}
        onChangeText={(v) => set('descricao', v)}
        placeholder="Ex: Salário CLT - Empresa X"
      />

      <Text style={styles.label}>Confiabilidade</Text>
      <View style={styles.opcoesContainer}>
        {TIPOS_CONFIABILIDADE.map((t) => (
          <Pressable
            key={t.valor}
            style={[styles.opcao, values.tipoConfiabilidade === t.valor && styles.opcaoAtiva]}
            onPress={() => set('tipoConfiabilidade', t.valor)}
          >
            <Text style={[styles.opcaoTexto, values.tipoConfiabilidade === t.valor && styles.opcaoTextoAtivo]}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Valor esperado (opcional)</Text>
      <CurrencyInput value={values.valorEsperado} onChange={(v) => set('valorEsperado', v)} />
      {values.valorEsperado == null && (
        <Text style={styles.hint}>Sem valor: tratada como receita de valor variável, sem estimativa.</Text>
      )}

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
        <Text style={styles.hint}>
          Anual: o recebimento é esperado no mês de início da vigência (ex.: 13º com vigência começando em dezembro).
        </Text>
      )}

      <Text style={styles.label}>Dia esperado do recebimento (1 a 31)</Text>
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

      <Text style={styles.label}>Conta de destino (opcional)</Text>
      <View style={styles.opcoesContainer}>
        <Pressable
          style={[styles.opcao, values.contaDestinoId === null && styles.opcaoAtiva]}
          onPress={() => set('contaDestinoId', null)}
        >
          <Text style={[styles.opcaoTexto, values.contaDestinoId === null && styles.opcaoTextoAtivo]}>
            Nenhuma
          </Text>
        </Pressable>
        {contasDestino.map((c) => (
          <Pressable
            key={c.id}
            style={[styles.opcao, values.contaDestinoId === c.id && styles.opcaoAtiva]}
            onPress={() => set('contaDestinoId', c.id)}
          >
            <Text style={[styles.opcaoTexto, values.contaDestinoId === c.id && styles.opcaoTextoAtivo]}>
              {c.nome}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.hint}>
        Usada como padrão nos recebimentos e na projeção de saldo. Sem conta, o contrato fica fora
        da projeção.
      </Text>
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
