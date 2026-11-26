import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MonthPicker } from '@/src/components/ui/MonthPicker';
import { DatePickerField } from '@/src/components/ui/DatePickerField';
import { CurrencyInput } from '@/src/components/ui/CurrencyInput';
import { competenciaDaData } from '@/src/utils/competencia';
import { nomeCasa, ordenarCasas, soEspacoPessoal } from '@/src/utils/casas';
import type { CartaoConta, CasaDashboard, MembroCasa, OrigemReceita } from '@/src/types';

// 'herdar' = não enviar conta_destino_id no payload (o backend herda o default
// do contrato vinculado); null = enviar null explícito ("sem conta").
export type ContaDestinoSelecao = number | null | 'herdar';

export type ReceitaFormValues = {
  casaId: number | null;
  pessoaId: number | null;
  origemId: number | null;
  observacao: string;
  valorBruto: number | null;
  descontos: number | null;
  valorLiquido: number | null;
  data: string;
  competencia: string;
  contaDestino: ContaDestinoSelecao;
};

type Props = {
  values: ReceitaFormValues;
  onChange: (values: ReceitaFormValues) => void;
  casas: CasaDashboard[];
  membros: MembroCasa[];
  origens: OrigemReceita[];
  contas: CartaoConta[]; // candidatas a conta de destino (debito/aplicacao)
  vinculadaAFixa?: boolean; // exibe a opção "Padrão do contrato"
};

export function ReceitaForm({ values, onChange, casas, membros, origens, contas, vinculadaAFixa = false }: Props) {
  const [seletorCompetenciaVisivel, setSeletorCompetenciaVisivel] = useState(false);
  const noEspacoPessoal = casas.find((c) => c.id === values.casaId)?.pessoal === true;

  // No espaço pessoal quem recebeu é sempre a dona (o único membro): preenche
  // sozinho, já que o campo "Quem recebeu" não aparece.
  useEffect(() => {
    if (noEspacoPessoal && membros.length === 1 && values.pessoaId !== membros[0].pessoa_id) {
      onChange({ ...values, pessoaId: membros[0].pessoa_id });
    }
  }, [noEspacoPessoal, membros, values, onChange]);

  function set<K extends keyof ReceitaFormValues>(key: K, value: ReceitaFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function alterarBrutoOuDescontos(bruto: number | null, descontos: number | null) {
    if (bruto != null) {
      const liquido = bruto - (descontos ?? 0);
      onChange({ ...values, valorBruto: bruto, descontos, valorLiquido: liquido });
    } else {
      onChange({ ...values, valorBruto: bruto, descontos });
    }
  }

  return (
    <View style={styles.form}>
      {/* "Lançar em": o espaço pessoal ("Pessoal") não deve ser lido como casa. */}
      {/* Quem só tem o espaço pessoal não vê a escolha (já vem selecionado). */}
      {!soEspacoPessoal(casas) && (
        <>
          <Text style={styles.label}>Lançar em</Text>
          <View style={styles.opcoesContainer}>
            {ordenarCasas(casas).map((casa) => (
              <Pressable
                key={casa.id}
                style={[styles.opcao, values.casaId === casa.id && styles.opcaoAtiva]}
                onPress={() => onChange({ ...values, casaId: casa.id, pessoaId: null })}
              >
                <Text style={[styles.opcaoTexto, values.casaId === casa.id && styles.opcaoTextoAtivo]}>
                  {nomeCasa(casa)}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {values.casaId != null && !noEspacoPessoal && membros.length > 0 && (
        <>
          <Text style={styles.label}>Quem recebeu</Text>
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

      {/* "Descrição" na tela, como no gasto (simetria entre receitas e
          despesas); na API e no banco o campo continua `observacao`. */}
      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        value={values.observacao}
        onChangeText={(v) => set('observacao', v)}
        placeholder="Opcional"
      />

      <Text style={styles.label}>Valor bruto</Text>
      <CurrencyInput
        value={values.valorBruto}
        onChange={(v) => alterarBrutoOuDescontos(v, values.descontos)}
      />

      <Text style={styles.label}>Descontos</Text>
      <CurrencyInput
        value={values.descontos}
        onChange={(v) => alterarBrutoOuDescontos(values.valorBruto, v)}
      />

      <Text style={styles.label}>Valor líquido</Text>
      <CurrencyInput value={values.valorLiquido} onChange={(v) => set('valorLiquido', v)} />

      <Text style={styles.label}>Conta de destino</Text>
      <View style={styles.opcoesContainer}>
        {vinculadaAFixa && (
          <Pressable
            style={[styles.opcao, values.contaDestino === 'herdar' && styles.opcaoAtiva]}
            onPress={() => set('contaDestino', 'herdar')}
          >
            <Text style={[styles.opcaoTexto, values.contaDestino === 'herdar' && styles.opcaoTextoAtivo]}>
              Padrão do contrato
            </Text>
          </Pressable>
        )}
        <Pressable
          style={[styles.opcao, values.contaDestino === null && styles.opcaoAtiva]}
          onPress={() => set('contaDestino', null)}
        >
          <Text style={[styles.opcaoTexto, values.contaDestino === null && styles.opcaoTextoAtivo]}>
            Nenhuma
          </Text>
        </Pressable>
        {contas
          .filter((c) => c.tipo !== 'credito' && c.ativo)
          .map((c) => (
            <Pressable
              key={c.id}
              style={[styles.opcao, values.contaDestino === c.id && styles.opcaoAtiva]}
              onPress={() => set('contaDestino', c.id)}
            >
              <Text style={[styles.opcaoTexto, values.contaDestino === c.id && styles.opcaoTextoAtivo]}>
                {c.nome}
              </Text>
            </Pressable>
          ))}
      </View>

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
