import { useEffect, useMemo } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { NovaDespesa } from '@/src/components/domain/NovaDespesa';

// "Registrar pagamento" da lista de Despesas fixas: abre o formulário único
// de despesa com a conta e a ocorrência já escolhidas. A rota fica dentro de
// Mais para que, ao salvar, a pessoa volte à lista de Despesas fixas.
export default function PagamentoDespesaFixaScreen() {
  const params = useLocalSearchParams<{
    despesaFixaId: string;
    competenciaReferencia: string;
    descricao?: string;
  }>();
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: params.descricao ? `Pagar — ${params.descricao}` : 'Registrar pagamento' });
  }, [navigation, params.descricao]);

  const preVinculo = useMemo(
    () =>
      params.despesaFixaId && params.competenciaReferencia
        ? { id: Number(params.despesaFixaId), competencia: params.competenciaReferencia }
        : null,
    [params.despesaFixaId, params.competenciaReferencia]
  );

  return <NovaDespesa preVinculo={preVinculo} aoSalvar={() => router.back()} />;
}
