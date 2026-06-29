import type { Usuario } from '../../types';
import { api } from './client';

export function getMe(): Promise<Usuario> {
  return api.get<Usuario>('/auth/me');
}
