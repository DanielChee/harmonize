import { View, Text } from "react-native";
import styles from "./styles";

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      <Text style={styles.subtitle}>
        DM people that you match with to discuss concert plans.
      </Text>
    </View>
  );
}
