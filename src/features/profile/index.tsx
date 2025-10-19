import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY } from "@constants";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <MaterialIcons name="settings" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <MaterialIcons name="person" size={100} color={COLORS.text.tertiary} />
        <Text style={styles.subtitle}>Profile Settings Coming Soon</Text>
        <Text style={styles.description}>
          View and edit your own profile, manage Spotify connection, and update preferences.
        </Text>

        <TouchableOpacity
          style={styles.testButton}
          onPress={() => router.push('/test-supabase')}
        >
          <MaterialIcons name="science" size={20} color={COLORS.text.inverse} />
          <Text style={styles.testButtonText}>Test Spotify Connection</Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Tip: Go to the Match tab to view and cycle through test profiles!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    ...TYPOGRAPHY.scale.h2,
    color: COLORS.text.primary,
  },
  settingsButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  subtitle: {
    ...TYPOGRAPHY.scale.h3,
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  description: {
    ...TYPOGRAPHY.scale.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  testButtonText: {
    ...TYPOGRAPHY.scale.button,
    color: COLORS.text.inverse,
  },
  note: {
    ...TYPOGRAPHY.scale.caption,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
