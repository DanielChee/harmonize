import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useUserStore } from "@store";
import { Card } from "@components";
import { fetchAllSpotifyData, isAuthenticated, getCurrentUserProfile, logoutFromSpotify } from "@services/spotify";
import { SpotifyButton } from "@components/SpotifyButton";
import type { SpotifyData } from "@types";
import { supabase } from "@services/supabase/supabase";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, IS_DEV } from "@constants";
import { useResolvedSpotifyImage } from '../../hooks/useResolvedSpotifyImage';

// Helper to validate and clean URLs (Shared with ProfileCardA/B)
const sanitizeUrl = (url: string | undefined | null): string | null => {
  if (!url || typeof url !== 'string') return null;
  let cleaned = url.trim();
  // Remove surrounding quotes if present (fixes double-serialization issue)
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.length > 0 && (cleaned.startsWith('http') || cleaned.startsWith('file://'))) {
    return cleaned;
  }
  return null;
};

/**
 * Sub-component for Artist Item in ProfileScreen
 */
const ProfileArtistItem = ({ artist }: { artist: { id: string, name: string, image_url?: string | null } }) => {
  const { imageUrl } = useResolvedSpotifyImage(artist.name, artist.image_url, 'artist');
  
  return (
    <View style={styles.artistItem}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.artistImage}
          onError={() => console.warn('Profile: Failed to load artist image:', artist.name)}
        />
      ) : (
        <View style={styles.artistPlaceholder}>
          <MaterialIcons name="person" size={24} color={COLORS.text.secondary} />
        </View>
      )}
      <Text style={styles.artistName} numberOfLines={2}>{artist.name}</Text>
    </View>
  );
};

/**
 * Sub-component for Song Item in ProfileScreen
 */
const ProfileSongItem = ({ song, index }: { song: { id: string, name: string, artist: string, image_url?: string | null }, index: number }) => {
  const { imageUrl } = useResolvedSpotifyImage(song.name, song.image_url, 'track');

  return (
    <View style={styles.songItem}>
      <Text style={styles.songNumber}>{index + 1}</Text>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.songImage}
          onError={() => console.warn('Profile: Failed to load song image:', song.name)}
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
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, spotifyData, setSpotifyData } = useUserStore();
  const [displaySpotifyData, setDisplaySpotifyData] = useState<SpotifyData | null>(spotifyData || null);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);


  const loadSpotifyData = useCallback(async () => {
    try {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const data = await fetchAllSpotifyData();
        setDisplaySpotifyData(data);
        setSpotifyData(data);
      }
    } catch (error) {
      console.error("Error loading Spotify data:", error);
      // Handle error silently
    } finally {
    }
  }, [setSpotifyData, setDisplaySpotifyData]); // Added setDisplaySpotifyData

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await isAuthenticated();
      setIsSpotifyConnected(connected);
      if (connected) {
        loadSpotifyData();
      }
    };
    checkConnection();
  }, [loadSpotifyData]);

  const handleSpotifyDisconnect = async () => {
    await logoutFromSpotify();
    setIsSpotifyConnected(false);
    setDisplaySpotifyData(null);
    setSpotifyData(null);
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

  // Keep full SpotifyArtist objects if using Spotify data, otherwise use string names and stored images
  const topArtists = useSpotifyData && displaySpotifyData?.top_artists && displaySpotifyData.top_artists.length > 0
    ? displaySpotifyData.top_artists
    : (currentUser.top_artists && Array.isArray(currentUser.top_artists) && currentUser.top_artists.length > 0)
      ? currentUser.top_artists.map((name, index) => ({
          id: name,
          name,
          // Retrieve image from stored array by index, sanitize, or undefined to trigger placeholder
          image_url: (currentUser.artist_images && currentUser.artist_images[index])
            ? sanitizeUrl(currentUser.artist_images[index]) || undefined
            : undefined
        }))
      : [];

  // Keep full SpotifyTrack objects if using Spotify data, otherwise parse song strings and stored images
  const topSongs = useSpotifyData && displaySpotifyData?.top_tracks && displaySpotifyData.top_tracks.length > 0
    ? displaySpotifyData.top_tracks
    : (currentUser.top_songs && Array.isArray(currentUser.top_songs) && currentUser.top_songs.length > 0)
      ? currentUser.top_songs.map((songStr, idx) => {
        const [name, ...artistParts] = songStr.split(' - ');
        const artist = artistParts.join(' - ') || 'Unknown Artist';

        // Retrieve image from stored array by index, sanitize, or undefined to trigger placeholder
        const imageUrl = (currentUser.song_images && currentUser.song_images[idx])
          ? sanitizeUrl(currentUser.song_images[idx]) || undefined
          : undefined;

        return {
          id: `song-${idx}`,
          name,
          artist,
          image_url: imageUrl,
          duration_ms: 0,
          preview_url: '',
        };
      })
      : [];


  const resolvedProfileImage = sanitizeUrl(currentUser.profile_picture_url) || 'https://i.pravatar.cc/300?img=1';
  console.log(`[ProfileScreen] Rendering profile for user: ${currentUser.display_name}`);
  console.log(`[ProfileScreen] Resolved Profile Image: ${resolvedProfileImage}`);

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
            source={{ uri: resolvedProfileImage }}
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
            {currentUser.sprint_5_variant === 'variant_b' && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="music-note" size={16} color="#1DB954" />
                <Text style={[styles.verifiedText, { color: "#1DB954" }]}>Spotify Connected</Text>
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

            {currentUser.phone && (
              <View style={styles.infoCard}>
                <MaterialIcons name="phone" size={20} color={COLORS.primary} />
                <Text style={styles.infoText}>{currentUser.phone}</Text>
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
                    <ProfileArtistItem key={artist.id || index} artist={artist} />
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
                    <ProfileSongItem key={song.id || index} song={song} index={index} />
                  ))}
                </View>
              </View>
            )}

            {/* Spotify Connection Status */}
            <View style={styles.spotifyStatus}>
              {isSpotifyConnected ? (
                <>
                  <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
                  <Text style={styles.spotifyStatusText}>Spotify Connected</Text>
                  <TouchableOpacity onPress={handleSpotifyDisconnect} style={styles.disconnectButton}>
                    <Text style={styles.disconnectButtonText}>Disconnect</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <SpotifyButton
                  onSuccess={(data) => {
                    setIsSpotifyConnected(true);
                    setDisplaySpotifyData(data);
                    setSpotifyData(data);
                  }}
                  onError={(err) => console.error(err)}
                />
              )}
            </View>
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

        {/* Admin Tools Section (Only for Admin Users) */}
        {(currentUser.id === '00000000-0000-0000-0000-000000000001' ||
          currentUser.email === 'admin@harmonize.com' ||
          currentUser.email === 'anonfox76@gmail.com' ||
          currentUser.role === 'admin') && (
            IS_DEV ? (
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
                      } catch (error: any) {
                        console.error("Supabase connection test failed:", error);
                        Alert.alert('Supabase Error', error.message || 'Connection failed');
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
                      } catch {
                        Alert.alert('Spotify Error', 'Failed to fetch profile. Ensure you are logged in.');
                      }
                    }}
                  >
                    <MaterialIcons name="music-note" size={20} color={COLORS.success} />
                    <Text style={styles.infoText}>Test Spotify Connection</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ) : (
              <Card style={[styles.section, { marginTop: SPACING.xl, backgroundColor: '#fff3cd', borderColor: '#ffeeba', borderWidth: 1 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.sm }}>
                  <MaterialIcons name="info-outline" size={24} color="#856404" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#856404' }}>Client Build</Text>
                    <Text style={{ fontSize: 14, color: '#856404' }}>
                      Admin tools are disabled in the production client build. Switch to a development build to access the dashboard.
                    </Text>
                  </View>
                </View>
              </Card>
            )
          )}



        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: COLORS.error, marginTop: SPACING.xl }]}
          onPress={() => {
            Alert.alert(
              'Sign Out',
              'Are you sure you want to sign out?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign Out',
                  style: 'destructive',
                  onPress: async () => {
                    const { signOut } = await import('@services/supabase/auth');
                    await signOut();
                    router.replace('/login');
                  }
                }
              ]
            );
          }}
        >
          <MaterialIcons name="logout" size={20} color={COLORS.text.inverse} />
          <Text style={styles.editButtonText}>Sign Out</Text>
        </TouchableOpacity>

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
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    flex: 1,
  },
  disconnectButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  disconnectButtonText: {
    ...TYPOGRAPHY.scale.caption,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weights.medium,
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