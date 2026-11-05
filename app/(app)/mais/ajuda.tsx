import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { cores, raio } from '@/src/theme/tokens';

const SECOES = [
  {
    titulo: 'Primeiros passos',
    texto: 'Comece criando ou entrando em uma casa. Depois, registre um gasto para visualizar os primeiros resultados no dashboard.',
  },
  {
    titulo: 'Como registrar um gasto',
    texto: 'Informe quem realizou o gasto, a categoria, o valor, a data e, quando aplicável, o cartão ou conta usado. O parcelamento distribui o valor nas parcelas correspondentes.',
  },
  {
    titulo: 'Caixa e competência',
    texto: 'Caixa mostra quando o dinheiro realmente sai da conta ou da fatura. Competência mostra o mês ao qual a compra pertence, mesmo que o pagamento aconteça depois.',
  },
  {
    titulo: 'Combinado de custeio',
    texto: 'Define quanto cada pessoa deve participar das despesas da casa. É opcional para quem usa o sistema individualmente.',
  },
  {
    titulo: 'Acerto de contas',
    texto: 'Compara quanto cada pessoa deveria pagar com quanto realmente desembolsou, mostrando o saldo entre as pessoas da casa.',
  },
  {
    titulo: 'Relatórios',
    texto: 'Use os relatórios para acompanhar gastos por período, categoria e pessoa, além de consultar os fechamentos disponíveis.',
  },
  {
    titulo: 'Convites',
    texto: 'Convide alguém pela área de casas. A pessoa poderá criar ou vincular sua conta e confirmar a entrada antes de participar.',
  },
] as const;

export default function AjudaScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Ajuda e como usar</Text>
      <Text style={styles.introducao}>
        Consulte os conceitos principais do Se Controle e reveja os primeiros passos quando precisar.
      </Text>

      {SECOES.map((secao) => (
        <View key={secao.titulo} style={styles.card}>
          <Text style={styles.cardTitulo}>{secao.titulo}</Text>
          <Text style={styles.cardTexto}>{secao.texto}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { padding: 24, gap: 12 },
  titulo:       { color: cores.textoForte, fontSize: 24, fontWeight: '700' },
  introducao:   { color: cores.textoMedio, fontSize: 15, lineHeight: 22, marginBottom: 4 },
  card:         { backgroundColor: cores.fundoSuave, borderRadius: raio.md, gap: 6, padding: 16 },
  cardTitulo:   { color: cores.textoForte, fontSize: 16, fontWeight: '600' },
  cardTexto:    { color: cores.textoMedio, fontSize: 14, lineHeight: 21 },
});
