import { useCallback } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { ReceitaEditor } from '@/src/components/domain/ReceitaEditor';
import type { Receita } from '@/src/types';

// Edição em tela cheia — o caminho do celular, e do desktop abaixo da
// largura de painel duplo. Acima dela a lista abre a mesma edição num
// painel lateral, usando o mesmo ReceitaEditor (como em Despesas).
export default function EditarReceitaScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const id = Number(params.id);

  const aoCarregar = useCallback(
    (receita: Receita) => navigation.setOptions({ title: receita.observacao || receita.origem_nome || 'Editar receita' }),
    [navigation]
  );

  return <ReceitaEditor id={id} onSalvo={() => router.back()} onCarregado={aoCarregar} />;
}
