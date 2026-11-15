import { useEffect } from 'react';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { OnboardingProvider, useOnboarding } from '@/src/context/OnboardingContext';

SplashScreen.preventAutoHideAsync();

function AppInitializer() {
  const { initializing } = useAuth();
  const { initialized } = useOnboarding();

  const ready = !initializing && initialized;

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Tenência</title>
      </Head>

      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <OnboardingProvider>
        <AppInitializer />
      </OnboardingProvider>
    </AuthProvider>
  );
}
