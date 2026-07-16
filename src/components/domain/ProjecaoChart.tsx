import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Line, Polyline, Text as SvgText } from 'react-native-svg';
import { formatDate } from '@/src/utils/formatters';
import type { ContaProjetada } from '@/src/types';

// Paleta fixa por posição da conta — mesma ordem da lista de cards.
export const CORES_SERIES = ['#1565c0', '#e65100', '#2e7d32', '#6a1b9a', '#c62828', '#00838f'];

type Props = {
  contas: ContaProjetada[]; // apenas contas com saldo_base
  hoje: string;
  ate: string;
};

type Ponto = { x: number; y: number };

const ALTURA = 200;
const PAD_ESQ = 44; // espaço dos rótulos do eixo Y
const PAD_DIR = 8;
const PAD_TOPO = 12;
const PAD_BASE = 22; // espaço dos rótulos de data

function diasEpoch(dataISO: string): number {
  const [ano, mes, dia] = dataISO.split('-').map(Number);
  return Date.UTC(ano, mes - 1, dia) / 86400000;
}

// Rótulo compacto para o eixo Y: R$ 1,2 mil / R$ 950
function valorCompacto(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${v < 0 ? '-' : ''}R$ ${(abs / 1_000_000).toFixed(1).replace('.', ',')} mi`;
  if (abs >= 1000) return `${v < 0 ? '-' : ''}R$ ${(abs / 1000).toFixed(1).replace('.', ',')} mil`;
  return `${v < 0 ? '-' : ''}R$ ${Math.round(abs)}`;
}

export function ProjecaoChart({ contas, hoje, ate }: Props) {
  const largura = useWindowDimensions().width - 32;

  // Série por conta: saldo_base no ponto inicial, soma progressiva dos
  // eventos (valor_indefinido entra como 0, igual ao backend) e ponto final
  // em `ate` com o saldo projetado.
  const series = contas.map((c) => {
    const pontos: Ponto[] = [{ x: diasEpoch(c.saldo_base_data!), y: c.saldo_base! }];
    let acumulado = c.saldo_base!;
    for (const evento of c.eventos) {
      acumulado += evento.valor_indefinido ? 0 : evento.valor;
      pontos.push({ x: diasEpoch(evento.data), y: acumulado });
    }
    pontos.push({ x: diasEpoch(ate), y: acumulado });
    return { nome: c.conta.nome, pontos };
  });

  if (series.length === 0) return null;

  const todosPontos = series.flatMap((s) => s.pontos);
  const xMin = Math.min(...todosPontos.map((p) => p.x));
  const xMax = Math.max(diasEpoch(ate), xMin + 1);

  let yMin = Math.min(...todosPontos.map((p) => p.y));
  let yMax = Math.max(...todosPontos.map((p) => p.y));
  if (yMin > 0) yMin = 0; // ancora no zero quando tudo é positivo
  if (yMax < 0) yMax = 0;
  const yPad = Math.max((yMax - yMin) * 0.08, 1);
  yMin -= yPad;
  yMax += yPad;

  const escalaX = (x: number) =>
    PAD_ESQ + ((x - xMin) / (xMax - xMin)) * (largura - PAD_ESQ - PAD_DIR);
  const escalaY = (y: number) =>
    PAD_TOPO + ((yMax - y) / (yMax - yMin)) * (ALTURA - PAD_TOPO - PAD_BASE);

  const gridY = [yMax - yPad, (yMax + yMin) / 2, yMin + yPad];
  const xHoje = diasEpoch(hoje);
  const hojeVisivel = xHoje >= xMin && xHoje <= xMax;

  return (
    <View style={styles.container}>
      <Svg width={largura} height={ALTURA}>
        {gridY.map((y, i) => (
          <Line
            key={`grid-${i}`}
            x1={PAD_ESQ}
            y1={escalaY(y)}
            x2={largura - PAD_DIR}
            y2={escalaY(y)}
            stroke="#e0e0e0"
            strokeWidth={1}
          />
        ))}
        {gridY.map((y, i) => (
          <SvgText key={`label-${i}`} x={2} y={escalaY(y) + 4} fontSize={10} fill="#888">
            {valorCompacto(y)}
          </SvgText>
        ))}

        {yMin < 0 && yMax > 0 && (
          <Line
            x1={PAD_ESQ}
            y1={escalaY(0)}
            x2={largura - PAD_DIR}
            y2={escalaY(0)}
            stroke="#bbb"
            strokeWidth={1}
          />
        )}

        {hojeVisivel && (
          <>
            <Line
              x1={escalaX(xHoje)}
              y1={PAD_TOPO}
              x2={escalaX(xHoje)}
              y2={ALTURA - PAD_BASE}
              stroke="#999"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <SvgText x={escalaX(xHoje) + 4} y={PAD_TOPO + 8} fontSize={10} fill="#888">
              hoje
            </SvgText>
          </>
        )}

        {series.map((s, i) => (
          <Polyline
            key={s.nome + i}
            points={s.pontos.map((p) => `${escalaX(p.x)},${escalaY(p.y)}`).join(' ')}
            fill="none"
            stroke={CORES_SERIES[i % CORES_SERIES.length]}
            strokeWidth={2}
          />
        ))}

        <SvgText x={PAD_ESQ} y={ALTURA - 6} fontSize={10} fill="#888">
          {formatDate(new Date(xMin * 86400000).toISOString())}
        </SvgText>
        <SvgText x={largura - PAD_DIR} y={ALTURA - 6} fontSize={10} fill="#888" textAnchor="end">
          {formatDate(ate)}
        </SvgText>
      </Svg>

      <View style={styles.legenda}>
        {series.map((s, i) => (
          <View key={s.nome + i} style={styles.legendaItem}>
            <View style={[styles.legendaCor, { backgroundColor: CORES_SERIES[i % CORES_SERIES.length] }]} />
            <Text style={styles.legendaTexto}>{s.nome}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee', paddingVertical: 8 },
  legenda:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 12, paddingTop: 4 },
  legendaItem:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendaCor:   { width: 10, height: 10, borderRadius: 2 },
  legendaTexto: { fontSize: 12, color: '#555' },
});
