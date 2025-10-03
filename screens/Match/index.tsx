import { View, Text } from "react-native";
import styles from "./styles";

export default function MatchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Match</Text>
      <Text style={styles.subtitle}>
        Shows BuddyPanels, where you can choose to like to pass profiles.
      </Text>
    </View>
  );
}
