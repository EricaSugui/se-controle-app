import { describe, expect, it } from '@jest/globals';
import { nomeArquivoRelatorio } from './nomeArquivoRelatorio';

describe('nomeArquivoRelatorio', () => {
  it('preserva nomes seguros retornados pela API', () => {
    expect(nomeArquivoRelatorio('casa-2026-10-31.pdf', 'pdf')).toBe('casa-2026-10-31.pdf');
  });

  it('usa nome padrão para evitar caminhos ou caracteres inválidos', () => {
    expect(nomeArquivoRelatorio('../segredo.pdf', 'pdf')).toBe('relatorio-acerto.pdf');
    expect(nomeArquivoRelatorio(null, 'csv')).toBe('relatorio-acerto.csv');
  });
});
