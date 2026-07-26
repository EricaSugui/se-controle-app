import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MESES_COMPETENCIA } from '@/src/utils/competencia';
import { cores, raio } from '@/src/theme/tokens';

// Meses em português — mesmo formato que o backend gera e valida (AGO-26).
const MESES = MESES_COMPETENCIA;

export function competenciaParaData(competencia: string): { mes: number; ano: number } {
  const [mesStr, anoStr] = competencia.split('-');
  const mes = MESES.indexOf(mesStr); // 0-indexed
  const ano = 2000 + Number(anoStr);
  return { mes, ano };
}

export function dataParaCompetencia(mes: number, ano: number): string {
  return `${MESES[mes]}-${String(ano).slice(-2)}`;
}

type Props = {
  visivel: boolean;
  valor: string; // formato "JUN-26"
  onSelecionar: (competencia: string) => void;
  onFechar: () => void;
};

export function MonthPicker({ visivel, valor, onSelecionar, onFechar }: Props) {
  const { mes: mesAtual, ano: anoAtual } = competenciaParaData(valor);

  const hoje = new Date();
  const mesHoje = hoje.getMonth();
  const anoHoje = hoje.getFullYear();

  function mudarAno(delta: number) {
    onSelecionar(dataParaCompetencia(mesAtual, anoAtual + delta));
  }

  function selecionarMes(mes: number) {
    onSelecionar(dataParaCompetencia(mes, anoAtual));
    onFechar();
  }

  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={styles.backdrop} onPress={onFechar} />

      <View style={styles.card}>
        {/* Navegação de ano */}
        <View style={styles.anoRow}>
          <Pressable onPress={() => mudarAno(-1)} style={styles.anoBtn}>
            <Text style={styles.anoBtnTexto}>‹</Text>
          </Pressable>
          <Text style={styles.anoTexto}>{anoAtual}</Text>
          <Pressable onPress={() => mudarAno(1)} style={styles.anoBtn}>
            <Text style={styles.anoBtnTexto}>›</Text>
          </Pressable>
        </View>

        {/* Grid de meses (3 colunas × 4 linhas) */}
        <View style={styles.grid}>
          {MESES.map((nome, i) => {
            const isSelecionado = i === mesAtual && anoAtual === anoHoje
              ? i === mesAtual
              : i === mesAtual && anoAtual === anoAtual;
            const isHoje = i === mesHoje && anoAtual === anoHoje;
            const selecionado = i === mesAtual;

            return (
              <Pressable
                key={nome}
                style={[styles.mes, selecionado && styles.mesSelecionado]}
                onPress={() => selecionarMes(i)}
              >
                <Text style={[styles.mesTexto, selecionado && styles.mesTextoSelecionado, isHoje && !selecionado && styles.mesHoje]}>
                  {nome}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop:             { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: cores.overlay },

  card: {
    position: 'absolute',
    alignSelf: 'center',
    top: '30%',
    backgroundColor: cores.fundo,
    borderRadius: raio.lg,
    padding: 20,
    width: 300,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },

  anoRow:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  anoBtn:               { padding: 8 },
  anoBtnTexto:          { fontSize: 24, color: cores.primaria, lineHeight: 28 },
  anoTexto:             { fontSize: 18, fontWeight: 'bold' },

  grid:                 { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mes: {
    width: '30%',
    paddingVertical: 10,
    borderRadius: raio.md,
    alignItems: 'center',
    backgroundColor: cores.fundoSuave,
  },
  mesSelecionado:       { backgroundColor: cores.primaria },
  mesTexto:             { fontSize: 14, fontWeight: '500', color: cores.textoForte },
  mesTextoSelecionado:  { color: cores.textoInverso, fontWeight: '700' },
  mesHoje:              { color: cores.primaria, fontWeight: '700' },
});
