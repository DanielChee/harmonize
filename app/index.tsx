import { Redirect } from "expo-router";

export default function Index() {
  // Production: Open on Match tab (profile cycling)
  return <Redirect href="/(tabs)/match" />;

  // Development screens available at:
  // - app/(dev)/test-components - Component gallery
  // - app/(dev)/test-supabase - Database/API testing
}
