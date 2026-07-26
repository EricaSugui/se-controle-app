import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg';

// Barras de gasto total por mês (série única — sem legenda). Tocar numa
// barra seleciona o mês (filtra as listas da tela); tocar de novo limpa.

type MesTotal = { mes: string; total: number }; // mes = MMM-AA, meses sem gasto já vêm com 0

type Props = {
  dados: MesTotal[];
  mesSelecionado: string | null;
  onSelecionarMes: (mes: string | null) => void;
};

const ALTURA = 180;
const PAD_ESQ = 44;
const PAD_DIR = 8;
const PAD_TOPO = 16;
const PAD_BASE = 22;
const COR_BARRA = '#1565c0';

function valorCompacto(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `R$ ${(abs / 1_000_000).toFixed(1).replace('.', ',')} mi`;
  if (abs >= 1000) return `R$ ${(abs / 1000).toFixed(1).replace('.', ',')} mil`;
  return `R$ ${Math.round(abs)}`;
}

// Retângulo com só o topo arredondado, ancorado na linha de base.
function barPath(x: number, y: number, w: number, h: number): string {
  const r = Math.min(3, w / 2, h);
  return [
    `M ${x} ${y + h}`,
    `L ${x} ${y + r}`,
    `Q ${x} ${y} ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `Q ${x + w} ${y} ${x + w} ${y + r}`,
    `L ${x + w} ${y + h}`,
    'Z',
  ].join(' ');
}

export function GastosMensalChart({ dados, mesSelecionado, onSelecionarMes }: Props) {
  // Mede o container, não a janela: no desktop o gráfico vive numa coluna
  // limitada ao lado da sidebar, então largura de tela não vale como proxy.
  const [largura, setLargura] = useState(0);

  if (dados.length === 0) return null;

  const maxTotal = Math.max(...dados.map((d) => d.total), 1);
  const areaLargura = largura - PAD_ESQ - PAD_DIR;
  const areaAltura = ALTURA - PAD_TOPO - PAD_BASE;
  const passo = areaLargura / dados.length;
  const barraLargura = Math.max(passo * 0.66, 2);

  const escalaY = (v: number) => PAD_TOPO + (1 - v / maxTotal) * areaAltura;
  const gridY = [maxTotal, maxTotal / 2];

  // Evita colisão de rótulos quando o período é longo.
  const saltoRotulo = Math.ceil(dados.length / 8);

  return (
    <View style={styles.container} onLayout={(e) => setLargura(e.nativeEvent.layout.width)}>
      {largura > 0 && (
      <Svg width={largura} height={ALTURA}>
        {gridY.map((v, i) => (
          <Line
            key={`grid-${i}`}
            x1={PAD_ESQ}
            y1={escalaY(v)}
            x2={largura - PAD_DIR}
            y2={escalaY(v)}
            stroke="#e0e0e0"
            strokeWidth={1}
          />
        ))}
        {gridY.map((v, i) => (
          <SvgText key={`glabel-${i}`} x={2} y={escalaY(v) + 4} fontSize={10} fill="#888">
            {valorCompacto(v)}
          </SvgText>
        ))}

        <Line
          x1={PAD_ESQ}
          y1={ALTURA - PAD_BASE}
          x2={largura - PAD_DIR}
          y2={ALTURA - PAD_BASE}
          stroke="#bbb"
          strokeWidth={1}
        />

        {dados.map((d, i) => {
          const x = PAD_ESQ + i * passo + (passo - barraLargura) / 2;
          const y = escalaY(d.total);
          const h = ALTURA - PAD_BASE - y;
          const selecionado = d.mes === mesSelecionado;
          const apagado = mesSelecionado != null && !selecionado;
          return (
            <Path
              key={d.mes}
              d={h > 0 ? barPath(x, y, barraLargura, h) : `M ${x} ${ALTURA - PAD_BASE} h ${barraLargura}`}
              fill={COR_BARRA}
              fillOpacity={apagado ? 0.3 : 1}
              onPress={() => onSelecionarMes(selecionado ? null : d.mes)}
            />
          );
        })}

        {dados.map((d, i) =>
          i % saltoRotulo === 0 ? (
            <SvgText
              key={`mes-${d.mes}`}
              x={PAD_ESQ + i * passo + passo / 2}
              y={ALTURA - 6}
              fontSize={10}
              fill={d.mes === mesSelecionado ? COR_BARRA : '#888'}
              fontWeight={d.mes === mesSelecionado ? '700' : '400'}
              textAnchor="middle"
            >
              {d.mes.slice(0, 3)}
            </SvgText>
          ) : null
        )}

        {/* rótulo direto apenas na barra selecionada */}
        {dados.map((d) =>
          d.mes === mesSelecionado ? (
            <SvgText
              key={`valor-${d.mes}`}
              x={PAD_ESQ + dados.indexOf(d) * passo + passo / 2}
              y={Math.max(escalaY(d.total) - 5, 10)}
              fontSize={10}
              fill="#333"
              fontWeight="700"
              textAnchor="middle"
            >
              {valorCompacto(d.total)}
            </SvgText>
          ) : null
        )}
      </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee', paddingVertical: 8 },
});
