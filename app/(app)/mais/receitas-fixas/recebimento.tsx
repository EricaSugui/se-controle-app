import { useEffect, useMemo } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { NovaReceita } from '@/src/components/domain/NovaReceita';

// "Registrar recebimento" da lista de Receitas fixas: abre o formulário único
// de receita com a receita e a ocorrência já escolhidas. A rota fica dentro
// de Mais para que, ao salvar, a pessoa volte à lista de Receitas fixas.
export default function RecebimentoReceitaFixaScreen() {
  const params = useLocalSearchParams<{
    receitaFixaId: string;
    competenciaReferencia: string;
    descricao?: string;
  }>();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: params.descricao ? `Receber — ${params.descricao}` : 'Registrar recebimento' });
  }, [navigation, params.descricao]);

  const preVinculo = useMemo(
    () =>
      params.receitaFixaId && params.competenciaReferencia
        ? { id: Number(params.receitaFixaId), competencia: params.competenciaReferencia }
        : null,
    [params.receitaFixaId, params.competenciaReferencia]
  );

  return <NovaReceita preVinculo={preVinculo} aoSalvar={() => router.back()} />;
}
