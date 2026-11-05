import { StyleSheet, Text, View } from 'react-native';
import { cores } from '@/src/theme/tokens';

export function EnvironmentBanner() {
  if (process.env.EXPO_PUBLIC_APP_ENV !== 'homologacao') return null;

  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Ambiente de homologação</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', backgroundColor: cores.alertaSuave, padding: 6 },
  texto:    { color: cores.alerta, fontSize: 12, fontWeight: '600' },
});
