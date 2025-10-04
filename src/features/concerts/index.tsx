import { View, Text } from "react-native";
import styles from "./styles";

export default function ConcertsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Concerts</Text>
      <Text style={styles.subtitle}>
        Explore upcoming events to buy or offer yours at a bargain!
      </Text>
    </View>
  );
}
