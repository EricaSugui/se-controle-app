import { StyleSheet, Text, View } from 'react-native';

export default function GastosScreen() {
  return (
    <View style={styles.container}>
      <Text>Lista de Gastos</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
