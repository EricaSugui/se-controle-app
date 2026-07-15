import { Stack } from 'expo-router';

export default function MetasLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Metas' }} />
      <Stack.Screen name="novo" options={{ title: 'Nova meta' }} />
      <Stack.Screen name="[id]" options={{ title: 'Editar meta' }} />
    </Stack>
  );
}
