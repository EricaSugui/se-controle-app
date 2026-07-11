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
      <Tabs.Screen name="gastos/index" options={{ title: 'Gastos' }} />
      <Tabs.Screen name="metas/index" options={{ title: 'Metas' }} />
      <Tabs.Screen name="mais/index" options={{ title: 'Mais' }} />
    </Tabs>
  );
}
