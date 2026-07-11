import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { getDashboard } from '../services/api/dashboard';
import type { Dashboard } from '../types';

function competenciaAtual(): string {
  const now = new Date();
  const mes = now.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const ano = String(now.getFullYear()).slice(-2);
  return `${mes}-${ano}`;
}

type State =
  | { status: 'loading' }
  | { status: 'error'; error: string }
  | { status: 'success'; data: Dashboard };

export function useDashboard(competencia = competenciaAtual(), eixo: 'caixa' | 'competencia' = 'caixa') {
  const [state, setState] = useState<State>({ status: 'loading' });

  useFocusEffect(
    useCallback(() => {
      setState({ status: 'loading' });
      getDashboard(competencia, eixo)
        .then((data) => setState({ status: 'success', data }))
        .catch((err: Error) => setState({ status: 'error', error: err.message }));
    }, [competencia, eixo])
  );

  return state;
}
