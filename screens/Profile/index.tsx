import { View, Text } from "react-native";
import styles from "./styles";

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>
        Your profile, Spotify stats, and preferences.
      </Text>
    </View>
  );
}
