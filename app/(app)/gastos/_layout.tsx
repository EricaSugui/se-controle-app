import { Stack } from 'expo-router';

export default function GastosLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Gastos' }} />
      <Stack.Screen name="novo" options={{ title: 'Nova compra' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar compra' }} />
    </Stack>
  );
}
