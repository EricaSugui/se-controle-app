import { Stack } from 'expo-router';

// Tela inicial da pilha: abrir uma tela interna direto (link ou recarregar a
// página) coloca a lista de Metas embaixo, e o botão de voltar aparece.
export const unstable_settings = { initialRouteName: 'index' };

export default function MetasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Metas' }} />
      <Stack.Screen name="novo" options={{ title: 'Nova meta' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar meta' }} />
    </Stack>
  );
}
