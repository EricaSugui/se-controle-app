import { api } from './client';
import type { Meta, MetaInput } from '../../types';

export function getMetas(): Promise<Meta[]> {
  return api.get<Meta[]>('/metas');
}

export function getMeta(id: number): Promise<Meta> {
  return api.get<Meta>(`/metas/${id}`);
}

export function createMeta(input: MetaInput): Promise<Meta> {
  return api.post<Meta>('/metas', input);
}

export function updateMeta(id: number, input: MetaInput): Promise<Meta> {
  return api.put<Meta>(`/metas/${id}`, input);
}

export function deleteMeta(id: number): Promise<void> {
  return api.delete<void>(`/metas/${id}`);
}
