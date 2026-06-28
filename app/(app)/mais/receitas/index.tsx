import { StyleSheet, Text, View } from 'react-native';

export default function ReceitasScreen() {
  return (
    <View style={styles.container}>
      <Text>Lista de Receitas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
