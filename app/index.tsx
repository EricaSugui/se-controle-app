import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '@/src/context/AuthContext';

function parseHash(hash: string): Record<string, string> {
  return Object.fromEntries(
    hash.replace(/^#/, '').split('&').filter(Boolean).map((p) => {
      const [k, ...v] = p.split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );
}

export default function Index() {
  const { user } = useAuth();
  const router = useRouter();
  const [hashChecado, setHashChecado] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') { setHashChecado(true); return; }

    const hash = window.location.hash;
    console.log('[index] href:', window.location.href);
    console.log('[index] hash bruto:', hash);

    if (!hash) { setHashChecado(true); return; }

    const params = parseHash(hash);
    console.log('[index] hash parseado:', params);

    if (params.access_token && params.type === 'invite') {
      console.log('[index] redirecionando para /convidado');
      router.replace({ pathname: '/(auth)/convidado', params: { token: params.access_token } });
      return;
    } else if (params.access_token && params.type === 'signup') {
      console.log('[index] redirecionando para /confirmacao');
      router.replace({ pathname: '/(auth)/confirmacao', params: { token: params.access_token } });
      return;
    }

    setHashChecado(true);
  }, []);

  if (!hashChecado) return null;

  return <Redirect href={user ? '/(app)/dashboard' : '/(auth)/login'} />;
}
