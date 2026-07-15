import { Stack } from 'expo-router';

export default function MaisLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Mais' }} />
      <Stack.Screen name="perfil" options={{ title: 'Perfil' }} />
      <Stack.Screen name="administracao" options={{ title: 'Administração' }} />
      <Stack.Screen name="convidar" options={{ title: 'Convidar amigos' }} />

      <Stack.Screen name="relatorios/index" options={{ title: 'Relatórios' }} />

      <Stack.Screen name="casas/index" options={{ title: 'Gerenciar casas' }} />
      <Stack.Screen name="casas/nova" options={{ title: 'Nova casa' }} />
      <Stack.Screen name="casas/[id]" options={{ title: 'Casa' }} />

      <Stack.Screen name="cartoes-contas/index" options={{ title: 'Cartões e contas' }} />
      <Stack.Screen name="cartoes-contas/novo" options={{ title: 'Novo cartão/conta' }} />
      <Stack.Screen name="cartoes-contas/[id]" options={{ title: 'Cartão/conta' }} />
      <Stack.Screen name="cartoes-contas/fatura" options={{ title: 'Fatura' }} />
      <Stack.Screen name="cartoes-contas/faturas" options={{ title: 'Faturas' }} />
      <Stack.Screen name="cartoes-contas/visibilidade" options={{ title: 'Visibilidade' }} />

      <Stack.Screen name="despesas-fixas/index" options={{ title: 'Despesas fixas' }} />
      <Stack.Screen name="despesas-fixas/novo" options={{ title: 'Nova despesa fixa' }} />
      <Stack.Screen name="despesas-fixas/[id]" options={{ title: 'Despesa fixa' }} />
      <Stack.Screen name="despesas-fixas/contratos" options={{ title: 'Contratos' }} />
      <Stack.Screen name="despesas-fixas/pagamento" options={{ title: 'Registrar pagamento' }} />
      <Stack.Screen name="despesas-fixas/justificar" options={{ title: 'Justificar competência' }} />
      <Stack.Screen name="despesas-fixas/reajuste" options={{ title: 'Reajuste' }} />

      <Stack.Screen name="receitas/index" options={{ title: 'Receitas' }} />
      <Stack.Screen name="receitas/novo" options={{ title: 'Nova receita' }} />
      <Stack.Screen name="receitas/[id]" options={{ title: 'Editar receita' }} />

      <Stack.Screen name="receitas-fixas/index" options={{ title: 'Receitas fixas' }} />
      <Stack.Screen name="receitas-fixas/novo" options={{ title: 'Nova receita fixa' }} />
      <Stack.Screen name="receitas-fixas/[id]" options={{ title: 'Receita fixa' }} />
      <Stack.Screen name="receitas-fixas/contratos" options={{ title: 'Contratos' }} />
      <Stack.Screen name="receitas-fixas/recebimento" options={{ title: 'Registrar recebimento' }} />
      <Stack.Screen name="receitas-fixas/justificar" options={{ title: 'Justificar competência' }} />
      <Stack.Screen name="receitas-fixas/reajuste" options={{ title: 'Reajuste' }} />
    </Stack>
  );
}
