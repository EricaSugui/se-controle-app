import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type ArquivoRelatorio = {
  data: ArrayBuffer;
  filename: string | null;
};

const nomesSeguros = /^[a-zA-Z0-9._-]+$/;

function nomeArquivoSeguro(nome: string | null, extensao: string): string {
  if (nome && nomesSeguros.test(nome)) return nome;
  return `relatorio-acerto.${extensao}`;
}

export async function salvarArquivoRelatorio(
  arquivo: ArquivoRelatorio,
  extensao: 'pdf' | 'csv',
  mimeType: string,
): Promise<void> {
  const nome = nomeArquivoSeguro(arquivo.filename, extensao);

  if (Platform.OS === 'web') {
    const blob = new Blob([arquivo.data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nome;
    link.click();
    URL.revokeObjectURL(url);
    return;
  }

  const file = new File(Paths.cache, nome);
  file.write(new Uint8Array(arquivo.data), { append: false });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType, UTI: mimeType });
  }
}
