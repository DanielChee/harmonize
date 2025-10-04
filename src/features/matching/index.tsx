import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router";
import styles from "./styles";

export default function MatchScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match</Text>
      <Text style={styles.subtitle}>
        Shows BuddyPanels, where you can choose to like to pass profiles.
      </Text>

      {/* New button for Supabase test */}
      <Button
        title="Go to Supabase Test"
        onPress={() => router.push("/test-supabase")}
      />
    </View>
  );
}
