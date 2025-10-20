import { Stack } from "expo-router";
import { ErrorBoundary } from "@components/common/ErrorBoundary";

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="test-components" options={{ headerShown: false }} />
        <Stack.Screen name="test-supabase" options={{ headerShown: false }} />
      </Stack>
    </ErrorBoundary>
  );
}