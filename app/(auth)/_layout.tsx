import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />
      <Stack.Screen name="convidado" options={{ headerShown: false }} />
      <Stack.Screen name="confirmacao" options={{ headerShown: false }} />
      <Stack.Screen name="recuperar-senha" options={{ title: 'Recuperar senha' }} />
      <Stack.Screen name="redefinir-senha" options={{ title: 'Definir nova senha' }} />
    </Stack>
  );
}
