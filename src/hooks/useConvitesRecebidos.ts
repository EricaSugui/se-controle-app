import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { aceitarConviteRecebido, getConvitesRecebidos } from '@/src/services/api/convite';
import type { ConviteRecebido } from '@/src/types';

type Estado = {
  carregando: boolean;
  convites: ConviteRecebido[];
  erro: string | null;
};

export function useConvitesRecebidos() {
  const [estado, setEstado] = useState<Estado>({ carregando: true, convites: [], erro: null });
  const [aceitandoId, setAceitandoId] = useState<number | null>(null);

  const recarregar = useCallback(async () => {
    setEstado((anterior) => ({ ...anterior, carregando: true, erro: null }));
    try {
      const convites = await getConvitesRecebidos();
      setEstado({ carregando: false, convites, erro: null });
    } catch (error) {
      const erro = error instanceof Error ? error.message : 'Não foi possível carregar os convites.';
      setEstado((anterior) => ({ ...anterior, carregando: false, erro }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void recarregar();
    }, [recarregar])
  );

  const aceitar = useCallback(async (id: number) => {
    if (aceitandoId !== null) return;

    setAceitandoId(id);
    try {
      await aceitarConviteRecebido(id);
      setEstado((anterior) => ({ ...anterior, convites: anterior.convites.filter((convite) => convite.id !== id) }));
      return 'aceito' as const;
    } finally {
      setAceitandoId(null);
    }
  }, [aceitandoId]);

  const removerERecarregar = useCallback(async (id: number) => {
    setEstado((anterior) => ({ ...anterior, convites: anterior.convites.filter((convite) => convite.id !== id) }));
    await recarregar();
  }, [recarregar]);

  return { ...estado, aceitandoId, aceitar, removerERecarregar };
}
