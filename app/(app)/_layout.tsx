import { Tabs } from 'expo-router';

export default function AppLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="dashboard/index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="gastos/index" options={{ title: 'Gastos' }} />
      <Tabs.Screen name="orcamento/index" options={{ title: 'Orçamento' }} />
      <Tabs.Screen name="mais/index" options={{ title: 'Mais' }} />
    </Tabs>
  );
}
