import { StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';
import { useBreakpoint } from '@/src/hooks/useBreakpoint';
import { Sidebar } from '@/src/components/ui/Sidebar';
import { CenteredColumn } from '@/src/components/ui/CenteredColumn';
import { ABAS } from '@/src/navigation/abas';

// Uma árvore de rotas só para mobile e desktop: o que muda com a largura é a
// moldura (abas embaixo × sidebar na lateral) e o limite de largura do
// conteúdo. Nenhuma rota é duplicada — a URL é a mesma nos dois casos.

export default function AppLayout() {
  const { user } = useAuth();
  const { amplo } = useBreakpoint();

  return (
    <View style={[styles.shell, amplo && styles.shellAmplo]}>
      {amplo && <Sidebar />}

      <CenteredColumn>
        <Tabs screenOptions={amplo ? { tabBarStyle: styles.tabBarOculta } : undefined}>
          {ABAS.map((aba) => (
            <Tabs.Screen
              key={aba.nome}
              name={aba.nome}
              options={{
                title:
                  aba.segmento === 'dashboard' && user ? `Dashboard - ${user.nome}` : aba.titulo,
                // Abas com Stack próprio já desenham o header delas.
                headerShown: !aba.headerProprio,
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
