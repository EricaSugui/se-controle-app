import { StyleSheet, Text, View } from 'react-native';

export default function OrcamentoScreen() {
  return (
    <View style={styles.container}>
      <Text>Orçamento</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
