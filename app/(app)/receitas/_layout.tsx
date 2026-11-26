import { Stack } from 'expo-router';

// Tela inicial da pilha: abrir uma tela interna direto (link ou recarregar a
// página) coloca a lista de Receitas embaixo, e o botão de voltar aparece.
export const unstable_settings = { initialRouteName: 'index' };

export default function ReceitasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Receitas' }} />
      <Stack.Screen name="novo" options={{ title: 'Nova receita' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar receita' }} />
    </Stack>
  );
}
