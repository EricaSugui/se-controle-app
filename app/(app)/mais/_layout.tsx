import { Stack } from 'expo-router';

// Tela inicial da pilha. Quando uma tela interna é aberta direto (atalho do
// Dashboard, da Projeção ou do Onboarding, link ou recarregar a página), a
// tela principal de Mais entra embaixo dela, e o botão de voltar aparece.
// Receitas é aba própria (app/(app)/receitas); Metas fica aqui em Mais.
export const unstable_settings = { initialRouteName: 'index' };

export default function MaisLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Mais' }} />
      <Stack.Screen name="perfil" options={{ title: 'Perfil' }} />
      <Stack.Screen name="administracao" options={{ title: 'Administração' }} />
      <Stack.Screen name="convidar" options={{ title: 'Convidar amigos' }} />

      <Stack.Screen name="relatorios/index" options={{ title: 'Relatórios' }} />
      <Stack.Screen name="relatorios/despesas" options={{ title: 'Relatório de despesas' }} />

      <Stack.Screen name="casas/index" options={{ title: 'Gerenciar casas' }} />
      <Stack.Screen name="casas/nova" options={{ title: 'Nova casa' }} />
      <Stack.Screen name="casas/[id]" options={{ title: 'Casa' }} />
      <Stack.Screen name="casas/acerto" options={{ title: 'Acerto de contas' }} />
      <Stack.Screen name="casas/acertos" options={{ title: 'Histórico de acertos' }} />
      <Stack.Screen name="casas/acerto-detalhe" options={{ title: 'Relatório de acerto' }} />
      <Stack.Screen name="casas/combinado" options={{ title: 'Combinado do mês' }} />

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

      <Stack.Screen name="metas/index" options={{ title: 'Metas' }} />
      <Stack.Screen name="metas/novo" options={{ title: 'Nova meta' }} />
      <Stack.Screen name="metas/[id]" options={{ title: 'Editar meta' }} />

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
