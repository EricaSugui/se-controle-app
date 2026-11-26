import { router } from 'expo-router';
import { NovaDespesa } from '@/src/components/domain/NovaDespesa';

export default function NovaDespesaScreen() {
  // Sempre termina na lista de Despesas, mesmo quando a tela foi aberta
  // pelo Dashboard (checklist de primeiros passos), onde router.back()
  // voltaria para o Dashboard. dismissTo volta até a lista se ela já está
  // na pilha, ou troca esta tela por ela, sem duplicar.
  return <NovaDespesa aoSalvar={() => router.dismissTo('/(app)/despesas')} />;
}
