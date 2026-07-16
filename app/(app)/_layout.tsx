import { Tabs } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();

  return (
    <Tabs>
      <Tabs.Screen
        name="dashboard/index"
        options={{ title: user ? `Dashboard - ${user.nome}` : 'Dashboard' }}
      />
      <Tabs.Screen name="gastos" options={{ title: 'Gastos', headerShown: false }} />
      <Tabs.Screen name="projecao/index" options={{ title: 'Projeção' }} />
      <Tabs.Screen name="metas" options={{ title: 'Metas', headerShown: false }} />
      <Tabs.Screen name="mais" options={{ title: 'Mais', headerShown: false }} />
    </Tabs>
  );
}
