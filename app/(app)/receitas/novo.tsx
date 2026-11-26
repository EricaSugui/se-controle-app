import { router } from 'expo-router';
import { NovaReceita } from '@/src/components/domain/NovaReceita';

export default function NovaReceitaScreen() {
  // Sempre termina na lista de Receitas, como a nova despesa termina na de
  // Despesas. dismissTo volta até a lista se ela já está na pilha, ou troca
  // esta tela por ela, sem duplicar.
  return <NovaReceita aoSalvar={() => router.dismissTo('/(app)/receitas')} />;
}
