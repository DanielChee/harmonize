import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="test-components" options={{ headerShown: false }} />
      <Stack.Screen name="test-supabase" options={{ headerShown: false }} />
    </Stack>
  );
}