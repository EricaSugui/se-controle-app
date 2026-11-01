import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { nomeArquivoRelatorio } from './nomeArquivoRelatorio';

type ArquivoRelatorio = {
  data: ArrayBuffer;
  filename: string | null;
};

export async function salvarArquivoRelatorio(
  arquivo: ArquivoRelatorio,
  extensao: 'pdf' | 'csv',
  mimeType: string,
): Promise<void> {
  const nome = nomeArquivoRelatorio(arquivo.filename, extensao);

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
