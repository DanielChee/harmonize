import { Redirect } from "expo-router";

export default function Index() {
  // Temporarily redirect to test screen for component validation
  return <Redirect href="/test-components" />;

  // Original redirect (restore this after testing):
  // return <Redirect href="/match" />;
}
