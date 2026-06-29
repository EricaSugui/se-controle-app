import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';

function parseHash(hash: string): Record<string, string> {
  return Object.fromEntries(
    hash.replace(/^#/, '').split('&').map((p) => {
      const [k, ...v] = p.split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
}

export default function Index() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const hash = window.location.hash;
    if (!hash) return;

    const params = parseHash(hash);

    if (params.access_token && params.type === 'invite') {
      router.replace({ pathname: '/(auth)/convidado', params: { token: params.access_token } });
    } else if (params.access_token && params.type === 'signup') {
      router.replace({ pathname: '/(auth)/confirmacao', params: { token: params.access_token } });
    }
  }, []);

  return <Redirect href={user ? '/(app)/dashboard' : '/(auth)/login'} />;
}
