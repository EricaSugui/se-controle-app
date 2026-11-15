import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { router, useSegments } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/src/context/AuthContext';
import { useBreakpoint } from '@/src/hooks/useBreakpoint';
import { Sidebar } from '@/src/components/ui/Sidebar';
import { CenteredColumn } from '@/src/components/ui/CenteredColumn';
import { ABAS } from '@/src/navigation/abas';
import { EnvironmentBanner } from '@/src/components/ui/EnvironmentBanner';
import { useOnboarding } from '@/src/context/OnboardingContext';
import { NotificationBell } from '@/src/components/ui/NotificationBell';

// Uma árvore de rotas só para mobile e desktop: o que muda com a largura é a
// moldura (abas embaixo × sidebar na lateral) e o limite de largura do
// conteúdo. Nenhuma rota é duplicada — a URL é a mesma nos dois casos.

export default function AppLayout() {
  const { user, initializing } = useAuth();
  const { onboarding, loading } = useOnboarding();
  const segments = useSegments() as string[];
  const { amplo } = useBreakpoint();

  useEffect(() => {
    if (!user || loading || onboarding?.status !== 'not_started') return;
    if (segments.includes('onboarding')) return;
    router.replace('/(app)/onboarding' as never);
  }, [user, loading, onboarding?.status, segments]);
  if (initializing) return null;

  return (
    <View style={[styles.shell, amplo && styles.shellAmplo]}>
      {amplo && <Sidebar />}

      <CenteredColumn>
        <EnvironmentBanner />
        <Tabs screenOptions={amplo ? { tabBarStyle: styles.tabBarOculta } : undefined}>
          {ABAS
          .filter((aba) => {
            if (aba.segmento !== 'onboarding') return true;

            return (
              onboarding?.status === 'not_started' ||
              onboarding?.status === 'in_progress'
            );
          })
          .map((aba) => (
            <Tabs.Screen
              key={aba.nome}
              name={aba.nome}
              options={{
                title:
                  aba.segmento === 'dashboard' && user ? `Dashboard - ${user.nome}` : aba.titulo,
                // Abas com Stack próprio já desenham o header delas.
                headerShown: !aba.headerProprio,
                headerRight: () => <NotificationBell />,
                tabBarIcon: ({ color, size }) => (
                  <Ionicons
                    name={aba.icone}
                    size={size}
                    color={color}
                  />
                ),
              }}
            />
          ))}
        </Tabs>
      </CenteredColumn>
    </View>
  );
}

const styles = StyleSheet.create({
  shell:        { flex: 1 },
  shellAmplo:   { flexDirection: 'row' },

  tabBarOculta: { display: 'none' },
});
