import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Sheet } from '@/src/components/ui/Sheet';
import { cores, raio } from '@/src/theme/tokens';
import { formatCurrency } from '@/src/utils/formatters';

// Lista do celular no padrão dos apps de banco (Despesas e Receitas):
// cabeçalho por dia com o total, linha compacta de 2 linhas com a seta ›
// (toque abre os detalhes) e uma janela de detalhes com Editar e Excluir.

export function CabecalhoDia({ titulo, total, cor }: { titulo: string; total: number; cor: string }) {
  return (
    <View style={styles.dia}>
      <Text style={styles.diaTitulo}>{titulo.toUpperCase()}</Text>
      <Text style={[styles.diaTotal, { color: cor }]}>{formatCurrency(total)}</Text>
    </View>
  );
}

type LinhaProps = {
  titulo: string;
  subtitulo: string;
  valor: number;
  cor: string;
  recorrente?: boolean;
  complemento?: string; // ex.: "3x" (parcelas)
  onPress: () => void;
};

export function LinhaLancamento({ titulo, subtitulo, valor, cor, recorrente, complemento, onPress }: LinhaProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.linha, pressed && styles.linhaPressionada]}
      accessibilityRole="button"
      accessibilityHint="Abre os detalhes"
    >
      <View style={styles.linhaTexto}>
        <View style={styles.linhaTopo}>
          <Text style={styles.titulo} numberOfLines={1}>
            {recorrente && (
              <Text accessibilityLabel="Recorrente">
                <MaterialCommunityIcons name="repeat" size={14} color={cores.primaria} />{' '}
              </Text>
            )}
            {titulo}
          </Text>
          <Text style={[styles.valor, { color: cor }]}>{formatCurrency(valor)}</Text>
        </View>
        <View style={styles.linhaTopo}>
          <Text style={styles.subtitulo} numberOfLines={1}>{subtitulo}</Text>
          {complemento ? <Text style={styles.complemento}>{complemento}</Text> : null}
        </View>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={cores.textoSuave} />
    </Pressable>
  );
}

export type LinhaDetalhe = { rotulo: string; valor: string };

type DetalhesProps = {
  visivel: boolean;
  titulo: string;
  valor: number;
  cor: string;
  linhas: LinhaDetalhe[];
  marca?: ReactNode; // ex.: MarcaRecorrencia
  podeEditar: boolean;
  onEditar: () => void;
  onExcluir: () => void;
  onFechar: () => void;
};

export function DetalhesLancamento({
  visivel, titulo, valor, cor, linhas, marca, podeEditar, onEditar, onExcluir, onFechar,
}: DetalhesProps) {
  return (
    <Sheet visivel={visivel} titulo={titulo} onFechar={onFechar}>
      <Text style={[styles.detalheValor, { color: cor }]}>{formatCurrency(valor)}</Text>
      {marca}
      <View style={styles.detalheLinhas}>
        {linhas.map((l) => (
          <View key={l.rotulo} style={styles.detalheLinha}>
            <Text style={styles.detalheRotulo}>{l.rotulo}</Text>
            <Text style={styles.detalheTexto}>{l.valor}</Text>
          </View>
        ))}
      </View>
      {podeEditar ? (
        <View style={styles.detalheAcoes}>
          <Pressable style={[styles.botao, styles.botaoSecundario]} onPress={onExcluir}>
            <Text style={[styles.botaoTexto, { color: cores.negativo }]}>Excluir</Text>
          </Pressable>
          <Pressable style={[styles.botao, styles.botaoPrimario]} onPress={onEditar}>
            <Text style={[styles.botaoTexto, { color: cores.textoInverso }]}>Editar</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.semPermissao}>Só quem lançou ou um administrador da casa pode editar.</Text>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  dia:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 16, paddingBottom: 6, paddingHorizontal: 4 },
  diaTitulo:       { fontSize: 12, fontWeight: '700', color: cores.textoSuave, letterSpacing: 0.4 },
  diaTotal:        { fontSize: 12, fontWeight: '600' },

  linha:           { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: cores.bordaSuave },
  linhaPressionada:{ backgroundColor: cores.fundoHover },
  linhaTexto:      { flex: 1, gap: 2 },
  linhaTopo:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo:          { flex: 1, fontSize: 15, color: cores.textoForte },
  valor:           { fontSize: 15, fontWeight: '600' },
  subtitulo:       { flex: 1, fontSize: 12, color: cores.textoSuave },
  complemento:     { fontSize: 12, color: cores.textoSuave },

  detalheValor:    { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  detalheLinhas:   { marginTop: 12, gap: 10 },
  detalheLinha:    { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  detalheRotulo:   { fontSize: 14, color: cores.textoSuave },
  detalheTexto:    { flex: 1, fontSize: 14, color: cores.textoForte, textAlign: 'right' },
  detalheAcoes:    { flexDirection: 'row', gap: 12, marginTop: 20 },
  botao:           { flex: 1, borderRadius: raio.md, paddingVertical: 12, alignItems: 'center' },
  botaoPrimario:   { backgroundColor: cores.primaria },
  botaoSecundario: { borderWidth: 1, borderColor: cores.negativo },
  botaoTexto:      { fontSize: 15, fontWeight: '600' },
  semPermissao:    { marginTop: 20, fontSize: 13, color: cores.textoSuave, textAlign: 'center' },
});
