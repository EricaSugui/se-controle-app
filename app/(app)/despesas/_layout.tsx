import { Stack } from 'expo-router';

// Aba "Despesas" (no código e na API, "compras"). Tela inicial da pilha: abrir
// Nova despesa direto (checklist do Dashboard, link ou recarregar a página)
// coloca a lista embaixo, e o botão de voltar aparece.
export const unstable_settings = { initialRouteName: 'index' };

export default function DespesasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Despesas' }} />
      <Stack.Screen name="novo" options={{ title: 'Nova despesa' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar despesa' }} />
    </Stack>
  );
}
