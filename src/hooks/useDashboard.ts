import { useEffect, useState } from 'react';
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

export function useDashboard(competencia = competenciaAtual()) {
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    setState({ status: 'loading' });

    getDashboard(competencia)
      .then((data) => setState({ status: 'success', data }))
      .catch((err: Error) => setState({ status: 'error', error: err.message }));
  }, [competencia]);

  return state;
}
