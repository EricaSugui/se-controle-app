import { Stack } from 'expo-router';

// Tela inicial da pilha: abrir Novo gasto direto (checklist do Dashboard,
// link ou recarregar a página) coloca a lista de Gastos embaixo, e o botão
// de voltar aparece.
export const unstable_settings = { initialRouteName: 'index' };

export default function GastosLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Gastos' }} />
      <Stack.Screen name="novo" options={{ title: 'Nova compra' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar compra' }} />
    </Stack>
  );
}
