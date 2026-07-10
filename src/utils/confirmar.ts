import { Alert, Platform } from 'react-native';

type Opcoes = {
  titulo: string;
  mensagem: string;
  textoConfirmar?: string;
  destrutivo?: boolean;
};

// Alert.alert é um no-op no React Native Web (react-native-web/src/exports/Alert
// é literalmente `static alert() {}`) — nenhum diálogo aparece, com ou sem
// botões. No web usamos window.confirm/window.alert como alternativa.
export function confirmar(opcoes: Opcoes, onConfirmar: () => void) {
  const { titulo, mensagem, textoConfirmar = 'Confirmar', destrutivo = true } = opcoes;

  if (Platform.OS === 'web') {
    if (window.confirm(`${titulo}\n\n${mensagem}`)) onConfirmar();
    return;
  }

  Alert.alert(titulo, mensagem, [
    { text: 'Cancelar', style: 'cancel' },
    { text: textoConfirmar, style: destrutivo ? 'destructive' : 'default', onPress: onConfirmar },
  ]);
}

export function notificar(titulo: string, mensagem?: string) {
  if (Platform.OS === 'web') {
    window.alert(mensagem ? `${titulo}\n\n${mensagem}` : titulo);
    return;
  }

  Alert.alert(titulo, mensagem);
}
