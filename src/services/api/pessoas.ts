import { api } from './client';
import type { Pessoa } from '../../types';

export function getPessoas(ativo?: boolean): Promise<Pessoa[]> {
  const query = ativo !== undefined ? `?ativo=${ativo}` : '';
  return api.get<Pessoa[]>(`/pessoas${query}`);
}

export function getPessoasRelacionadas(ativo?: boolean): Promise<Pessoa[]> {
  const query = ativo !== undefined ? `?ativo=${ativo}` : '';
  return api.get<Pessoa[]>(`/pessoas/relacionadas${query}`);
}

// PUT é replace de nome/email — enviar sempre os valores atuais junto.
export function updatePessoa(
  id: number,
  input: { nome: string; email: string | null; fuso_horario?: string }
): Promise<Pessoa> {
  return api.put<Pessoa>(`/pessoas/${id}`, input);
}
