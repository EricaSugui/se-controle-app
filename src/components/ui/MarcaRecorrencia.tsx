import { StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { cores } from '@/src/theme/tokens';

// Identifica, nas listas, o lançamento vinculado a uma conta ou receita
// recorrente (despesa_fixa_id / receita_fixa_id). O mês de referência só
// aparece quando difere do mês do lançamento (ex.: conta de outubro paga em
// novembro), para não repetir o óbvio.

type Props = {
  tipo: 'despesa' | 'receita';
  referencia?: string | null; // competencia_referencia (MMM-AA)
  competencia?: string | null; // competência do próprio lançamento
};

export function MarcaRecorrencia({ tipo, referencia, competencia }: Props) {
  const rotulo = tipo === 'despesa' ? 'Conta recorrente' : 'Receita recorrente';
  const mostraReferencia = referencia && referencia !== competencia;
  return (
    <Text style={styles.marca}>
      <MaterialCommunityIcons name="repeat" size={13} color={cores.primaria} />
      {` ${rotulo}${mostraReferencia ? ` · referente a ${referencia}` : ''}`}
    </Text>
  );
}

// Só o ícone, para caber antes da descrição numa célula de tabela.
export function IconeRecorrencia() {
  return (
    <Text accessibilityLabel="Recorrente">
      <MaterialCommunityIcons name="repeat" size={14} color={cores.primaria} />{' '}
    </Text>
  );
}

const styles = StyleSheet.create({
  marca: { fontSize: 12, color: cores.primaria, marginTop: 2 },
});
