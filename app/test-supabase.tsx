import { SpotifyButton } from "@components/SpotifyButton";
import { TestTabSwitcher } from "@components/TestTabSwitcher";
import { COLORS, SPACING, TYPOGRAPHY } from "@constants";
import { supabase } from "@services/supabase";
import { logoutFromSpotify } from "@services/spotify";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid";
import type { SpotifyData } from "../src/types";
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


// TEST PAGE: Supabase + Spotify Integration

export default function TestSupabase() {
  const router = useRouter();
  const [supabaseMessage, setSupabaseMessage] = useState("Testing Supabase...");
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null);
  const [spotifyError, setSpotifyError] = useState<string | null>(null);

  useEffect(() => {
    // Only run test if we haven't already
    if (supabaseMessage === "Testing Supabase...") {
      testSupabase();
    }
  }, []);

  const testSupabase = async () => {
    try {
      // generate a random user id
      const userId = uuidv4();

      // insert a test row
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          username: "test_user",
          bio: "Hello from Expo!",
          pronouns: "they/them",
          city: "Atlanta",
          top_genres: ["indie", "pop"],
          top_artists: ["Phoebe Bridgers", "Taylor Swift"],
        });

      if (insertError) {
        setSupabaseMessage("Insert error: " + insertError.message);
        return;
      }

      // query the row back
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId);

      if (fetchError) {
        setSupabaseMessage("Fetch error: " + fetchError.message);
      } else {
        setSupabaseMessage("✅ Supabase working! User created: " + data?.[0]?.username);
      }
    } catch (err) {
      setSupabaseMessage("Unexpected error: " + err);
    }
  };

  const handleSpotifySuccess = (data: SpotifyData) => {
    setSpotifyData(data);
    setSpotifyError(null);
  };

  const handleSpotifyError = (error: Error) => {
    setSpotifyError(error.message);
    setSpotifyData(null);
  };

  const handleSpotifyLogout = async () => {
    const success = await logoutFromSpotify();
    if (success) {
      setSpotifyData(null);
      setSpotifyError(null);
    } else {
      setSpotifyError("Failed to logout from Spotify");
    }
  };

  return (
    <View style={styles.wrapper}>
      <TestTabSwitcher />

      {/* Navigation Button to Main App */}
      <TouchableOpacity
        style={styles.backToAppButton}
        onPress={() => router.push('/(tabs)/profile')}
        activeOpacity={0.7}
      >
        <MaterialIcons name="arrow-back" size={20} color={COLORS.text.inverse} />
        <Text style={styles.backToAppText}>Back to Main App</Text>
      </TouchableOpacity>

      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.title}>Test Page</Text>

        {/* Supabase Test */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Supabase Test</Text>
          <Text style={styles.message}>{supabaseMessage}</Text>
        </View>

        {/* Spotify Test */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Spotify Integration Test</Text>
          <SpotifyButton
            onSuccess={handleSpotifySuccess}
            onError={handleSpotifyError}
            style={styles.spotifyButton}
          />

          {spotifyError && (
            <Text style={styles.errorText}>❌ {spotifyError}</Text>
          )}

          {spotifyData && (
            <View style={styles.spotifyResults}>
              <Text style={styles.resultsTitle}>✅ Spotify Connected!</Text>

              <View style={styles.resultItem}>
                <Text style={styles.label}>User ID:</Text>
                <Text style={styles.value}>{spotifyData.spotify_user_id}</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.label}>Username:</Text>
                <Text style={styles.value}>{spotifyData.spotify_username}</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.label}>Top Genres:</Text>
                <Text style={styles.value}>{spotifyData.top_genres.join(", ")}</Text>
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.label}>Top Artists:</Text>
                {spotifyData.top_artists.map((artist, index) => (
                  <Text key={artist.id} style={styles.value}>
                    {index + 1}. {artist.name}
                  </Text>
                ))}
              </View>

              <View style={styles.resultItem}>
                <Text style={styles.label}>Top Tracks:</Text>
                {spotifyData.top_tracks.map((track, index) => (
                  <Text key={track.id} style={styles.value}>
                    {index + 1}. {track.name} - {track.artist}
                  </Text>
                ))}
              </View>

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleSpotifyLogout}
                activeOpacity={0.7}
              >
                <MaterialIcons name="logout" size={20} color={COLORS.error} />
                <Text style={styles.logoutText}>Logout from Spotify</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  section: {
    padding: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.scale.h1,
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.scale.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  message: {
    ...TYPOGRAPHY.scale.body,
    color: COLORS.text.secondary,
  },
  spotifyButton: {
    marginVertical: SPACING.md,
  },
  errorText: {
    ...TYPOGRAPHY.scale.caption,
    color: COLORS.error,
    marginTop: SPACING.sm,
  },
  spotifyResults: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  resultsTitle: {
    ...TYPOGRAPHY.scale.h3,
    color: COLORS.success,
    marginBottom: SPACING.md,
  },
  resultItem: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.scale.bodyBold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  value: {
    ...TYPOGRAPHY.scale.body,
    color: COLORS.text.secondary,
    paddingLeft: SPACING.sm,
  },
  backToAppButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  backToAppText: {
    ...TYPOGRAPHY.scale.button,
    color: COLORS.text.inverse,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.error,
    marginTop: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
  },
  logoutText: {
    ...TYPOGRAPHY.scale.button,
    color: COLORS.error,
    fontWeight: '600',
  },
});
