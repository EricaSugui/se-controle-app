import { Redirect } from 'expo-router';

export default function Index() {
  const isAuthenticated = false; // substituir por AuthContext

  return <Redirect href={isAuthenticated ? '/(app)/dashboard' : '/(auth)/login'} />;
}
