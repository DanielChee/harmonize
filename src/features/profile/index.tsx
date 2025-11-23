import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "@constants";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUserStore } from "@store";
import { useEffect, useState } from "react";
import { Card } from "@components";
import { fetchAllSpotifyData, isAuthenticated } from "@services/spotify";
import type { SpotifyData } from "@types";
import { supabase } from "@services/supabase/supabase";
import { getCurrentUserProfile } from "@services/spotify";
import { Alert } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, spotifyData, setSpotifyData } = useUserStore();
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(false);
  const [displaySpotifyData, setDisplaySpotifyData] = useState<SpotifyData | null>(spotifyData || null);

  useEffect(() => {
    loadSpotifyData();
  }, []);

  const loadSpotifyData = async () => {
    try {
      setIsLoadingSpotify(true);
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const data = await fetchAllSpotifyData();
        setDisplaySpotifyData(data);
        setSpotifyData(data);
      }
    } catch (error) {
      // Handle error silently
    } finally {
      setIsLoadingSpotify(false);
    }
  };

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
          <Text style={styles.title}>Your Profile</Text>
        </View>
        <View style={styles.content}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.description}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  // Determine which data to show based on the chosen variant
  // Variant B (From Spotify): Use Spotify data if available, otherwise fall back to stored
  // Variant A (Manual Input): Always use stored user data, never use Spotify data
  const useSpotifyData = currentUser.sprint_5_variant === 'variant_b' && displaySpotifyData;

  const topGenres = useSpotifyData && displaySpotifyData?.top_genres && displaySpotifyData.top_genres.length > 0
    ? displaySpotifyData.top_genres
    : (currentUser.top_genres && Array.isArray(currentUser.top_genres) && currentUser.top_genres.length > 0)
      ? currentUser.top_genres
      : [];

  // Keep full SpotifyArtist objects if using Spotify data, otherwise use string names
  const topArtists = useSpotifyData && displaySpotifyData?.top_artists && displaySpotifyData.top_artists.length > 0
    ? displaySpotifyData.top_artists
    : (currentUser.top_artists && Array.isArray(currentUser.top_artists) && currentUser.top_artists.length > 0)
      ? currentUser.top_artists.map(name => ({ id: name, name, image_url: undefined }))
      : [];

  // Keep full SpotifyTrack objects if using Spotify data, otherwise parse song strings
  const topSongs = useSpotifyData && displaySpotifyData?.top_tracks && displaySpotifyData.top_tracks.length > 0
    ? displaySpotifyData.top_tracks
    : (currentUser.top_songs && Array.isArray(currentUser.top_songs) && currentUser.top_songs.length > 0)
      ? currentUser.top_songs.map((songStr, idx) => {
        const [name, ...artistParts] = songStr.split(' - ');
        const artist = artistParts.join(' - ') || 'Unknown Artist';
        return {
          id: `song-${idx}`,
          name,
          artist,
          image_url: undefined,
          duration_ms: 0,
          preview_url: '',
        };
      })
      : [];


  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + SPACING.md }]}>
        <Text style={styles.title}>Your Profile</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/profile-setup')}>
          <MaterialIcons name="edit" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: currentUser.profile_picture_url || 'https://i.pravatar.cc/300?img=1' }}
            style={styles.avatar}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{currentUser.display_name || currentUser.username}</Text>
            <Text style={styles.meta}>
              {currentUser.age > 0 ? `${currentUser.age} • ` : ''}{currentUser.pronouns}
            </Text>
            {currentUser.is_verified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={16} color={COLORS.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bio Section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bioText}>{currentUser.bio}</Text>
        </Card>

        {/* Profile Info Grid */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoGrid}>
            {currentUser.city && (
              <View style={styles.infoCard}>
                <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>{currentUser.city}</Text>
              </View>
            )}

            {currentUser.university && (
              <View style={styles.infoCard}>
                <MaterialIcons name="school" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>{currentUser.university}</Text>
              </View>
            )}

            {currentUser.academic_year && (
              <View style={styles.infoCard}>
                <MaterialIcons name="school" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>{currentUser.academic_year}</Text>
              </View>
            )}

            {currentUser.academic_field && (
              <View style={styles.infoCard}>
                <MaterialIcons name="work" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>{currentUser.academic_field}</Text>
              </View>
            )}

            {currentUser.mbti && (
              <View style={styles.infoCard}>
                <MaterialIcons name="psychology" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>{currentUser.mbti}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Top Genres Section */}
        {topGenres.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Top Genres</Text>
            <View style={styles.genresList}>
              {topGenres.slice(0, 5).map((genre, index) => (
                <View key={`${genre}-${index}`} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Music Taste Section */}
        {(topArtists.length > 0 || topSongs.length > 0 || topGenres.length > 0) && (
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Music Taste</Text>
              {currentUser.sprint_5_variant && (
                <View style={styles.variantBadge}>
                  <MaterialIcons
                    name={currentUser.sprint_5_variant === 'variant_b' ? 'music-note' : 'edit'}
                    size={14}
                    color={COLORS.text.secondary}
                  />
                  <Text style={styles.variantText}>
                    {currentUser.sprint_5_variant === 'variant_b' ? 'Variant B' : 'Variant A'}
                  </Text>
                </View>
              )}
            </View>

            {/* Top Artists */}
            {topArtists.length > 0 && (
              <View style={styles.musicSubsection}>
                <Text style={styles.subsectionTitle}>Top Artists</Text>
                <View style={styles.artistsList}>
                  {topArtists.slice(0, 5).map((artist, index) => (
                    <View key={artist.id || index} style={styles.artistItem}>
                      {artist.image_url ? (
                        <Image
                          source={{ uri: artist.image_url }}
                          style={styles.artistImage}
                          onError={() => {
                            console.warn('Profile: Failed to load artist image:', artist.name);
                          }}
                        />
                      ) : (
                        <View style={styles.artistPlaceholder}>
                          <MaterialIcons name="person" size={24} color={COLORS.text.secondary} />
                        </View>
                      )}
                      <Text style={styles.artistName} numberOfLines={2}>
                        {artist.name}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Top Songs */}
            {topSongs.length > 0 && (
              <View style={styles.musicSubsection}>
                <Text style={styles.subsectionTitle}>Top Songs</Text>
                <View style={styles.songsList}>
                  {topSongs.slice(0, 5).map((song, index) => (
                    <View key={song.id || index} style={styles.songItem}>
                      <Text style={styles.songNumber}>{index + 1}</Text>
                      {song.image_url ? (
                        <Image
                          source={{ uri: song.image_url }}
                          style={styles.songImage}
                          onError={() => {
                            console.warn('Profile: Failed to load song image:', song.name);
                          }}
                        />
                      ) : (
                        <View style={styles.songPlaceholder}>
                          <MaterialIcons name="music-note" size={20} color={COLORS.text.secondary} />
                        </View>
                      )}
                      <View style={styles.songInfo}>
                        <Text style={styles.songName} numberOfLines={1}>
                          {song.name}
                        </Text>
                        <Text style={styles.songArtist} numberOfLines={1}>
                          {song.artist}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Spotify Connection Status - Only show for Variant B */}
            {currentUser.sprint_5_variant === 'variant_b' && (
              <View style={styles.spotifyStatus}>
                {isLoadingSpotify ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : displaySpotifyData ? (
                  <>
                    <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
                    <Text style={styles.spotifyStatusText}>Spotify Connected</Text>
                  </>
                ) : (
                  <>
                    <MaterialIcons name="music-off" size={16} color={COLORS.text.secondary} />
                    <Text style={styles.spotifyStatusText}>Connect Spotify to sync your music taste</Text>
                  </>
                )}
              </View>
            )}
          </Card>
        )}

        {/* Concert Preferences */}
        {(currentUser.concert_budget || currentUser.concert_seating || currentUser.concert_transportation) && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Concert Preferences</Text>
            <View style={styles.preferencesGrid}>
              {currentUser.concert_budget && (
                <View style={styles.preferenceCard}>
                  <MaterialIcons name="attach-money" size={24} color={COLORS.primary} />
                  <Text style={styles.preferenceLabel} numberOfLines={2}>{currentUser.concert_budget}</Text>
                </View>
              )}
              {currentUser.concert_seating && (
                <View style={styles.preferenceCard}>
                  <MaterialIcons name="airline-seat-recline-normal" size={24} color={COLORS.primary} />
                  <Text style={styles.preferenceLabel} numberOfLines={2}>{currentUser.concert_seating}</Text>
                </View>
              )}
              {currentUser.concert_transportation && (
                <View style={styles.preferenceCard}>
                  <MaterialIcons name="directions-car" size={24} color={COLORS.primary} />
                  <Text style={styles.preferenceLabel} numberOfLines={2}>{currentUser.concert_transportation}</Text>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Edit Profile Button */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/edit-profile')}
        >
          <MaterialIcons name="edit" size={20} color={COLORS.text.inverse} />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        {/* Admin Tools Section (Only for Test Admin) */}
        {currentUser.id === '00000000-0000-0000-0000-000000000001' && (
          <Card style={[styles.section, { marginTop: SPACING.xl, borderColor: COLORS.text.secondary, borderWidth: 1 }]}>
            <Text style={styles.sectionTitle}>Admin Tools</Text>

            <View style={{ gap: SPACING.md, marginTop: SPACING.md }}>
              {/* Dashboard Link */}
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: COLORS.text.secondary, marginTop: 0 }]}
                onPress={() => router.push('/analytics')}
              >
                <MaterialIcons name="admin-panel-settings" size={20} color={COLORS.text.inverse} />
                <Text style={styles.editButtonText}>Admin Dashboard</Text>
              </TouchableOpacity>

              {/* Elements Showcase Link */}
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: COLORS.primary, marginTop: 0 }]}
                onPress={() => router.push('/elements')}
              >
                <MaterialIcons name="widgets" size={20} color={COLORS.text.inverse} />
                <Text style={styles.editButtonText}>UI Elements</Text>
              </TouchableOpacity>

              {/* Connection Tests */}
              <Text style={[styles.subsectionTitle, { marginTop: SPACING.sm }]}>Connection Tests</Text>

              <TouchableOpacity
                style={[styles.infoCard, { justifyContent: 'center' }]}
                onPress={async () => {
                  try {
                    const { count, error } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
                    if (error) throw error;
                    Alert.alert('Supabase Connected', `Connection successful. Found ${count} profiles.`);
                  } catch (e: any) {
                    Alert.alert('Supabase Error', e.message || 'Connection failed');
                  }
                }}
              >
                <MaterialIcons name="storage" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>Test Supabase Connection</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.infoCard, { justifyContent: 'center' }]}
                onPress={async () => {
                  try {
                    const profile = await getCurrentUserProfile();
                    Alert.alert('Spotify Connected', `Logged in as: ${profile.display_name}`);
                  } catch (e: any) {
                    Alert.alert('Spotify Error', 'Failed to fetch profile. Ensure you are logged in.');
                  }
                }}
              >
                <MaterialIcons name="music-note" size={20} color={COLORS.success} />
                <Text style={styles.infoText}>Test Spotify Connection</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
    paddingBottom: SPACING.md,
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  description: {
    ...TYPOGRAPHY.scale.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    ...TYPOGRAPHY.scale.h3,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  meta: {
    ...TYPOGRAPHY.scale.body,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  verifiedText: {
    ...TYPOGRAPHY.scale.caption,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.scale.h3,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  variantBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  variantText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  bioText: {
    ...TYPOGRAPHY.scale.body,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  infoGrid: {
    flexDirection: 'column',
    gap: SPACING.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    width: '100%',
  },
  infoText: {
    ...TYPOGRAPHY.scale.body,
    color: COLORS.text.primary,
    flex: 1,
  },
  musicSubsection: {
    marginBottom: SPACING.md,
  },
  subsectionTitle: {
    ...TYPOGRAPHY.scale.body,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.sm,
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  genreTag: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.pill,
  },
  genreText: {
    ...TYPOGRAPHY.scale.caption,
    color: COLORS.text.inverse,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  artistsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'flex-start',
  },
  artistItem: {
    alignItems: 'center',
    minWidth: 80,
    maxWidth: 100,
    flex: 1,
    flexBasis: '30%',
  },
  artistImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: SPACING.xs,
  },
  artistPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  artistName: {
    ...TYPOGRAPHY.scale.caption,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  songsList: {
    gap: SPACING.sm,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  songNumber: {
    ...TYPOGRAPHY.scale.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    width: 24,
    textAlign: 'center',
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.sm,
  },
  songPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  songInfo: {
    flex: 1,
  },
  songName: {
    ...TYPOGRAPHY.scale.body,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  songArtist: {
    ...TYPOGRAPHY.scale.caption,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  spotifyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  spotifyStatusText: {
    ...TYPOGRAPHY.scale.caption,
    color: COLORS.text.secondary,
  },
  preferencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  preferenceCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  preferenceLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  editButtonText: {
    ...TYPOGRAPHY.scale.button,
    color: COLORS.text.inverse,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});
