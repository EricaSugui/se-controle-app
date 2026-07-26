import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/src/context/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Título padrão da aba. O expo-router roda com
          `documentTitle: { enabled: false }`, então o `title` das telas serve
          só ao header nativo e nunca chega ao browser — quem escreve a aba é
          este <Head>. Telas podem sobrescrever com o próprio <Head>. */}
      <Head>
        <title>Se Controle</title>
      </Head>

      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}
