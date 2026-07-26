import { useCallback } from 'react';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { CompraEditor } from '@/src/components/domain/CompraEditor';
import type { Compra } from '@/src/types';

// Edição em tela cheia — o caminho do celular, e do desktop abaixo da
// largura de painel duplo. Acima dela a lista abre a mesma edição num
// painel lateral, usando o mesmo CompraEditor.
export default function EditarCompraScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const id = Number(params.id);

  const aoCarregar = useCallback(
    (compra: Compra) => navigation.setOptions({ title: compra.descricao || 'Editar compra' }),
    [navigation]
  );

  return <CompraEditor id={id} onSalvo={() => router.back()} onCarregado={aoCarregar} />;
}
