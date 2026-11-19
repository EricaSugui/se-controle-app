import { StyleSheet, Text, View } from 'react-native';
import { cores } from '@/src/theme/tokens';
import { rotuloAmbiente } from '@/src/utils/ambiente';

// Aviso fixo no topo em qualquer ambiente que não seja produção
// (desenvolvimento, TCC, homologação) — ver src/utils/ambiente.ts.
export function EnvironmentBanner() {
  const rotulo = rotuloAmbiente(process.env.EXPO_PUBLIC_APP_ENV);
  if (rotulo === null) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.texto}>{rotulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', backgroundColor: cores.alertaSuave, padding: 6 },
  texto:    { color: cores.alerta, fontSize: 12, fontWeight: '600' },
});
