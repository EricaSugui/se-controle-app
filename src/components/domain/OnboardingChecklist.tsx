import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { getCartoesContas } from '@/src/services/api/cartoesContas';
import { getCategorias } from '@/src/services/api/categorias';
import { getPercentuaisCusteio } from '@/src/services/api/percentuaisCusteio';
import { cores, raio } from '@/src/theme/tokens';
import type { CasaDashboard } from '@/src/types';

type Props = {
  casa: CasaDashboard | undefined;
  casaPrincipalConfigurada: boolean;
  competencia: string;
};

export function OnboardingChecklist({ casa, casaPrincipalConfigurada, competencia }: Props) {
  const [temCategoria, setTemCategoria] = useState(false);
  const [temConta, setTemConta] = useState(false);
  const [temCusteio, setTemCusteio] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getCategorias(true).then((categorias) => setTemCategoria(categorias.length > 0)).catch(() => setTemCategoria(false));
      getCartoesContas(true).then((contas) => setTemConta(contas.length > 0)).catch(() => setTemConta(false));
      if (casa?.id == null) {
        setTemCusteio(false);
        return;
      }
      getPercentuaisCusteio(casa.id, competencia)
        .then((percentuais) => setTemCusteio(percentuais.length > 0))
        .catch(() => setTemCusteio(false));
    }, [casa?.id, competencia])
  );

  const itens = [
    { label: 'Casa principal definida', concluido: casaPrincipalConfigurada, rota: '/(app)/mais/perfil' },
    { label: 'Categorias disponíveis', concluido: temCategoria, rota: '/(app)/gastos/novo' },
    { label: 'Conta ou cartão', concluido: temConta, rota: '/(app)/mais/cartoes-contas' },
    { label: 'Primeiro gasto', concluido: (casa?.gastos_total ?? 0) > 0, rota: '/(app)/gastos/novo' },
    {
      label: 'Combinado de custeio (opcional)',
      concluido: casa?.usa_custeio === false || temCusteio,
      rota: casa ? { pathname: '/(app)/mais/casas/combinado', params: { id: casa.id, nome: casa.nome } } : '/(app)/mais/casas',
    },
  ];

  if (itens.every((item) => item.concluido)) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Primeiros passos</Text>
      {itens.map((item) => (
        <Pressable
          key={item.label}
          style={styles.item}
          disabled={item.concluido}
          onPress={() => router.push(item.rota as never)}
        >
          <Text style={[styles.marca, item.concluido && styles.marcaConcluida]}>
            {item.concluido ? '✓' : '□'}
          </Text>
          <Text style={[styles.label, item.concluido && styles.labelConcluido]}>{item.label}</Text>
          {!item.concluido && <Text style={styles.acao}>Configurar ›</Text>}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container:       { backgroundColor: cores.fundoSuave, borderRadius: raio.md, gap: 10, padding: 16 },
  titulo:          { color: cores.textoForte, fontSize: 17, fontWeight: '700', marginBottom: 2 },
  item:            { alignItems: 'center', flexDirection: 'row', gap: 8, minHeight: 28 },
  marca:           { color: cores.textoSuave, fontSize: 18, width: 22 },
  marcaConcluida:  { color: cores.positivo },
  label:           { color: cores.textoForte, flex: 1, fontSize: 14 },
  labelConcluido:  { color: cores.textoSuave },
  acao:            { color: cores.primaria, fontSize: 12 },
});
