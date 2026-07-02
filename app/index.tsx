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
    if (!hash) { setHashChecado(true); return; }

    const params = parseHash(hash);

    if (params.access_token && params.type === 'invite') {
      // Só chega aqui se o link de convite cair na Site URL em vez de
      // /convidado (redirect_to não configurado/aceito no Supabase). Sem o
      // token do convite não dá pra aceitar — manda sem params pra tela
      // mostrar "link inválido" em vez de um 404 confuso no backend.
      router.replace('/(auth)/convidado');
      return;
    } else if (params.access_token && params.type === 'signup') {
      router.replace({ pathname: '/(auth)/confirmacao', params: { token: params.access_token } });
      return;
    }

    setHashChecado(true);
  }, []);

  if (!hashChecado) return null;

  return <Redirect href={user ? '/(app)/dashboard' : '/(auth)/login'} />;
}
