import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MonthPicker } from '@/src/components/ui/MonthPicker';
import { DatePickerField } from '@/src/components/ui/DatePickerField';
import { CurrencyInput } from '@/src/components/ui/CurrencyInput';
import { CategoriaSelector } from '@/src/components/ui/CategoriaSelector';
import { CartaoContaSelector } from '@/src/components/ui/CartaoContaSelector';
import { formatCurrency } from '@/src/utils/formatters';
import { competenciaDaData } from '@/src/utils/competencia';
import type { CartaoConta, CasaDashboard, Categoria, FormaPagamento, MembroCasa } from '@/src/types';

export type CompraFormValues = {
  casaId: number | null;
  pessoaId: number | null;
  categoriaId: number | null;
  descricao: string;
  cartaoContaId: number | null;
  formaPagamentoId: number | null;
  data: string;
  competencia: string;
  totalParcelas: string;
  valorParcela: number | null;
};

type Props = {
  values: CompraFormValues;
  onChange: (values: CompraFormValues) => void;
  casas: CasaDashboard[];
  membros: MembroCasa[];
  categorias: Categoria[];
  cartoes: CartaoConta[];
  formas: FormaPagamento[];
};

export function CompraForm({ values, onChange, casas, membros, categorias, cartoes, formas }: Props) {
  const [seletorCompetenciaVisivel, setSeletorCompetenciaVisivel] = useState(false);

  function set<K extends keyof CompraFormValues>(key: K, value: CompraFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  const totalParcelasNum = Number(values.totalParcelas);
  const totalCompra =
    values.valorParcela != null && totalParcelasNum >= 1
      ? values.valorParcela * totalParcelasNum
      : null;

  const cartaoSelecionado = cartoes.find((c) => c.id === values.cartaoContaId);
  const formaSelecionada = formas.find((f) => f.id === values.formaPagamentoId);

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

      {categorias.length > 0 && (
        <>
          <Text style={styles.label}>Categoria</Text>
          <CategoriaSelector
            categorias={categorias}
            categoriaSelecionadaId={values.categoriaId}
            onSelect={(id) => set('categoriaId', id)}
          />
        </>
      )}

      <Text style={styles.label}>Valor da parcela</Text>
      <CurrencyInput value={values.valorParcela} onChange={(v) => set('valorParcela', v)} />

      <Text style={styles.label}>Total de parcelas</Text>
      <TextInput
        style={styles.input}
        value={values.totalParcelas}
        onChangeText={(v) => set('totalParcelas', v)}
        placeholder="Ex: 3"
        keyboardType="number-pad"
      />
      {totalCompra !== null && totalParcelasNum > 1 && (
        <Text style={styles.hint}>Total da compra: {formatCurrency(totalCompra)}</Text>
      )}

      {cartoes.length > 0 && (
        <>
          <Text style={styles.label}>Cartão/conta</Text>
          <CartaoContaSelector
            contas={cartoes}
            contaSelecionadaId={values.cartaoContaId}
            onSelect={(id) => set('cartaoContaId', id)}
          />
          {cartaoSelecionado?.tipo === 'credito' && (
            <Text style={styles.hint}>As parcelas serão atribuídas às faturas do cartão.</Text>
          )}
          {formaSelecionada?.exige_conta && values.cartaoContaId === null && (
            <Text style={styles.hint}>
              A forma "{formaSelecionada.nome}" exige um cartão/conta.
            </Text>
          )}
        </>
      )}

      {formas.length > 0 && (
        <>
          <Text style={styles.label}>Forma de pagamento</Text>
          <View style={styles.opcoesContainer}>
            <Pressable
              style={[styles.opcao, values.formaPagamentoId === null && styles.opcaoAtiva]}
              onPress={() => set('formaPagamentoId', null)}
            >
              <Text style={[styles.opcaoTexto, values.formaPagamentoId === null && styles.opcaoTextoAtivo]}>
                Nenhuma
              </Text>
            </Pressable>
            {formas.map((f) => (
              <Pressable
                key={f.id}
                style={[styles.opcao, values.formaPagamentoId === f.id && styles.opcaoAtiva]}
                onPress={() => set('formaPagamentoId', f.id)}
              >
                <Text style={[styles.opcaoTexto, values.formaPagamentoId === f.id && styles.opcaoTextoAtivo]}>
                  {f.nome}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <Text style={styles.label}>Data</Text>
      <DatePickerField
        valor={values.data}
        // a competência default acompanha a data do evento (não "hoje");
        // continua editável no seletor abaixo
        onSelecionar={(v) => onChange({ ...values, data: v, competencia: competenciaDaData(v) })}
      />

      <Text style={styles.label}>Competência</Text>
      <Pressable style={styles.input} onPress={() => setSeletorCompetenciaVisivel(true)}>
        <Text>{values.competencia}</Text>
      </Pressable>

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        value={values.descricao}
        onChangeText={(v) => set('descricao', v)}
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
  hint:            { fontSize: 13, color: '#777', marginTop: 4 },

  opcoesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  opcao:           { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14 },
  opcaoAtiva:      { borderColor: '#1565c0', backgroundColor: '#e3f2fd' },
  opcaoTexto:      { fontSize: 14, color: '#555' },
  opcaoTextoAtivo: { color: '#1565c0', fontWeight: '600' },
});
