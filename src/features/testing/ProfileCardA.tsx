/**
 * Profile Card A - Amazon-Style Reviews
 * Shows test profiles with text reviews and star ratings
 */

import { Card, ConcertPreferencesGrid, LookingForSection } from '@components';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import type { TestProfile } from '@types';
import { responsiveSizes } from '@utils/responsive';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useResolvedSpotifyImage } from '../../hooks/useResolvedSpotifyImage';

interface ProfileCardAProps {
  profile: TestProfile;
}

// Mock data for high profile elements
const MOCK_MUTUAL_FRIENDS = [
  { id: '1', avatar: 'https://i.pravatar.cc/100?img=1' },
  { id: '2', avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: '3', avatar: 'https://i.pravatar.cc/100?img=3' },
];

const MOCK_SPOTIFY_DATA = {
  top_genres: ['indie pop', 'bedroom pop', 'indie folk'],
  top_artists: [
    { id: '1', name: 'Phoebe Bridgers', image_url: 'https://i.pravatar.cc/300?img=51' },
    { id: '2', name: 'Clairo', image_url: 'https://i.pravatar.cc/300?img=52' },
    { id: '3', name: 'boygenius', image_url: 'https://i.pravatar.cc/300?img=53' },
  ],
  top_tracks: [
    { id: '1', name: 'Kyoto', artist: 'Phoebe Bridgers', image_url: 'https://i.pravatar.cc/300?img=54', duration_ms: 213000 },
    { id: '2', name: 'Bags', artist: 'Clairo', image_url: 'https://i.pravatar.cc/300?img=55', duration_ms: 195000 },
    { id: '3', name: 'Not Strong Enough', artist: 'boygenius', image_url: 'https://i.pravatar.cc/300?img=56', duration_ms: 245000 },
  ],
  featured_track: { id: '1', name: 'Kyoto', artist: 'Phoebe Bridgers', image_url: 'https://i.pravatar.cc/300?img=54', duration_ms: 213000 },
};

const MOCK_CONCERT_HISTORY = [
  { id: '1', artist: 'Phoebe Bridgers', venue: 'The Tabernacle', date: 'Oct 2024', image: 'https://i.pravatar.cc/300?img=51' },
  { id: '2', artist: 'Clairo', venue: 'Terminal West', date: 'Sep 2024', image: 'https://i.pravatar.cc/300?img=52' },
  { id: '3', artist: 'boygenius', venue: 'State Farm Arena', date: 'Aug 2024', image: 'https://i.pravatar.cc/300?img=53' },
];

/**
 * Featured Song Component
 */
const FeaturedSong: React.FC<{ track: typeof MOCK_SPOTIFY_DATA.featured_track }> = ({ track }) => {
  return (
    <View style={styles.featuredSong}>
      <Image source={{ uri: track.image_url }} style={styles.featuredSongImage} />
      <View style={styles.featuredSongOverlay}>
        <MaterialIcons name="play-circle-filled" size={48} color={COLORS.text.inverse} />
      </View>
      <View style={styles.featuredSongInfo}>
        <Text style={styles.featuredSongLabel}>Featured Song</Text>
        <Text style={styles.featuredSongName} numberOfLines={1}>{track.name}</Text>
        <Text style={styles.featuredSongArtist} numberOfLines={1}>{track.artist}</Text>
      </View>
      <View style={styles.waveform}>
        {[...Array(25)].map((_, i) => (
          <View key={i} style={[styles.waveformBar, { height: Math.random() * 24 + 8 }]} />
        ))}
      </View>
    </View>
  );
};

/**
 * Concert History Item Component
 */
const ConcertHistoryItem: React.FC<{ concert: typeof MOCK_CONCERT_HISTORY[0] }> = ({ concert }) => {
  return (
    <View style={styles.concertHistoryCard}>
      <Image source={{ uri: concert.image }} style={styles.concertHistoryCardImage} />
      <View style={styles.concertHistoryCardOverlay}>
        <Text style={styles.concertHistoryCardArtist} numberOfLines={1}>{concert.artist}</Text>
        <Text style={styles.concertHistoryCardDate}>{concert.date}</Text>
      </View>
    </View>
  );
};

// Helper to validate and clean URLs
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
 * Sub-component for Artist Item to handle image resolution
 */
const SpotifyArtistItem = ({ artist }: { artist: { id: string, name: string, image_url?: string | null } }) => {
  const { imageUrl } = useResolvedSpotifyImage(artist.name, artist.image_url, 'artist');
  
  return (
    <View style={styles.artistItem}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.artistImage} />
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
 * Sub-component for Track Item to handle image resolution
 */
const SpotifyTrackItem = ({ track, index }: { track: any, index: number }) => {
  const { imageUrl } = useResolvedSpotifyImage(track.name, track.image_url, 'track');

  return (
    <View style={styles.trackItem}>
      <Text style={styles.trackNumber}>{index + 1}</Text>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.trackImage} />
      ) : (
        <View style={styles.songPlaceholder}>
          <MaterialIcons name="music-note" size={20} color={COLORS.text.secondary} />
        </View>
      )}
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
        <Text style={styles.trackArtist} numberOfLines={1}>{track.artist}</Text>
      </View>
      <View style={styles.trackDuration}>
        <Text style={styles.trackDurationText}>
          {Math.floor(track.duration_ms / 60000)}:
          {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
        </Text>
      </View>
    </View>
  );
};

export function ProfileCardA({ profile }: ProfileCardAProps) {
  const isTestProfile = profile.id.startsWith('test-');

  // Use real data for real users, fallback to MOCK only for test profiles
  const spotifyGenres = isTestProfile 
    ? MOCK_SPOTIFY_DATA.top_genres
    : (profile.top_genres || []);
  
  const spotifyArtists = isTestProfile
    ? MOCK_SPOTIFY_DATA.top_artists
    : (profile.top_artists || []).map((name, index) => ({
        id: String(index + 1),
        name,
        image_url: (profile.artist_images && sanitizeUrl(profile.artist_images[index])) 
          ? sanitizeUrl(profile.artist_images[index])
          : undefined 
      }));

  const spotifyTracks = isTestProfile
    ? MOCK_SPOTIFY_DATA.top_tracks
    : (profile.top_songs || []).map((songString, index) => {
        const [name, ...artistParts] = songString.split(' - ');
        const artist = artistParts.join(' - ') || 'Unknown Artist';
        return {
          id: String(index + 1),
          name: name || songString,
          artist,
          image_url: (profile.song_images && sanitizeUrl(profile.song_images[index]))
            ? sanitizeUrl(profile.song_images[index])
            : undefined,
          duration_ms: 0, 
        };
      });

  const featuredTrack = isTestProfile 
    ? MOCK_SPOTIFY_DATA.featured_track
    : (spotifyTracks[0] ? { ...spotifyTracks[0], image_url: spotifyTracks[0].image_url || 'https://via.placeholder.com/300' } : null);

  const resolvedProfileImage = sanitizeUrl(profile.image);

  // VERIFICATION LOG: ProfileCardA Images
  console.log(`[ProfileCardA] Rendering profile: ${profile.name}`);
  console.log(`[ProfileCardA] Resolved Profile Image: ${resolvedProfileImage}`);
  spotifyArtists.forEach((a, i) => console.log(`[ProfileCardA] Artist ${i+1}: ${a.name} -> ${a.image_url}`));
  spotifyTracks.forEach((t, i) => console.log(`[ProfileCardA] Track ${i+1}: ${t.name} -> ${t.image_url}`));

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Mutual Friends */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          {resolvedProfileImage ? (
            <Image source={{ uri: resolvedProfileImage }} style={{ width: '100%', height: '100%', borderRadius: 999 }} />
          ) : (
            <Text style={styles.avatarText}>{profile.name[0]}</Text>
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.meta}>
            {profile.age} • {profile.pronouns}
          </Text>
          {profile.universityVerified && (
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={16} color={COLORS.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
          {/* Mutual Friends */}
          {MOCK_MUTUAL_FRIENDS.length > 0 && (
            <View style={styles.mutualFriends}>
              <View style={styles.mutualFriendsAvatars}>
                {MOCK_MUTUAL_FRIENDS.slice(0, 3).map((friend, index) => (
                  <Image
                    key={friend.id}
                    source={{ uri: friend.avatar }}
                    style={[styles.mutualFriendAvatar, index > 0 && { marginLeft: -8 }]}
                  />
                ))}
              </View>
              <Text style={styles.mutualFriendsText}>
                {MOCK_MUTUAL_FRIENDS.length} mutual {MOCK_MUTUAL_FRIENDS.length === 1 ? 'friend' : 'friends'}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Looking For Section */}
      <LookingForSection
        concert={{
          id: '1',
          artist: 'Taylor Swift',
          venue: 'Mercedes-Benz Stadium',
          date: 'Dec 15, 2025',
        }}
        lookingForBuddy={true}
      />

      {/* Bio */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bio}>{profile.bio}</Text>
      </Card>

      {/* Info Cards */}
      <Card style={styles.section}>
        <View style={styles.infoGrid}>
          <Card
            icon={<MaterialIcons name="school" size={20} color="rgba(0,0,0,0.8)" />}
            badge={profile.universityVerified ? <MaterialIcons name="verified" size={16} color={COLORS.success} /> : undefined}
          >
            <Text style={styles.infoText}>{profile.university}</Text>
          </Card>
          <Card icon={<MaterialIcons name="confirmation-number" size={20} color="rgba(0,0,0,0.8)" />}>
            <Text style={styles.infoText}>{profile.concertsAttended} concerts</Text>
          </Card>
        </View>
      </Card>

      {/* Featured Song */}
      {featuredTrack && (
        <Card style={styles.section}>
          <FeaturedSong track={featuredTrack} />
        </Card>
      )}

      {/* Music Stats */}
      {spotifyGenres.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>My Music Stats</Text>
          <View style={styles.genresSection}>
            <Text style={styles.subsectionTitle}>Top Genres</Text>
            <View style={styles.genresList}>
              {spotifyGenres.map((genre, index) => (
                <View key={`${genre}-${index}`} style={styles.genreBorderedTag}>
                  <Text style={styles.genreTagText}>{genre}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>
      )}

      {/* Top Artists */}
      {spotifyArtists.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Top Artists</Text>
          <View style={styles.artistsList}>
            {spotifyArtists.map((artist) => (
              <SpotifyArtistItem key={artist.id} artist={artist} />
            ))}
          </View>
        </Card>
      )}

      {/* Top Tracks */}
      {spotifyTracks.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Top Tracks</Text>
          {spotifyTracks.map((track, index) => (
            <SpotifyTrackItem key={track.id} track={track} index={index} />
          ))}
        </Card>
      )}

      {/* Concert History - Test Profiles Only */}
      {isTestProfile && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Concert History</Text>
          <Text style={styles.subsectionTitle}>Recently Attended Shows</Text>
          <View style={styles.concertHistoryGrid}>
            {MOCK_CONCERT_HISTORY.map((concert) => (
              <ConcertHistoryItem key={concert.id} concert={concert} />
            ))}
          </View>
        </Card>
      )}

      {/* Credentials */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Credentials</Text>
        <View style={styles.vouchesGrid}>
          <View style={styles.vouchItem}>
            <View style={styles.vouchIcon}>
              <MaterialIcons name="confirmation-number" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.vouchCount}>{profile.concertsAttended}</Text>
            <Text style={styles.vouchLabel}>Concerts</Text>
          </View>
          <View style={styles.vouchItem}>
            <View style={styles.vouchIcon}>
              <MaterialIcons name="verified-user" size={32} color={COLORS.success} />
            </View>
            <Text style={styles.vouchCount}>✓</Text>
            <Text style={styles.vouchLabel}>Verified</Text>
          </View>
          <View style={styles.vouchItem}>
            <View style={styles.vouchIcon}>
              <MaterialIcons name="star" size={32} color={COLORS.warning} />
            </View>
            <Text style={styles.vouchCount}>{profile.averageRatingTypeA.toFixed(1)}</Text>
            <Text style={styles.vouchLabel}>Rating</Text>
          </View>
        </View>
      </Card>

      {/* Reviews Section */}
      <Card style={styles.section}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <View style={styles.ratingDisplay}>
            <Text style={styles.ratingNumber}>{profile.averageRatingTypeA.toFixed(1)}</Text>
            <Text style={styles.star}>★</Text>
          </View>
        </View>

        {(!profile.reviewsTypeA ||
          !Array.isArray(profile.reviewsTypeA) ||
          profile.reviewsTypeA.length === 0) ? (
          <Text style={{ color: COLORS.text.secondary, fontSize: TYPOGRAPHY.sizes.sm, textAlign: 'center' }}>
            No reviews yet!
          </Text>
        ) : (
          profile.reviewsTypeA.map((review, index) => (
            <View key={index} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.reviewerName}</Text>
                <View style={styles.reviewStars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Text key={i} style={i < review.stars ? styles.starFilled : styles.starEmpty}>
                      ★
                    </Text>
                  ))}
                </View>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
              <Text style={styles.reviewDate}>{review.daysAgo} days ago</Text>
            </View>
          ))
        )}
      </Card>


      {/* Concert Preferences */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Concert Preferences</Text>
        <ConcertPreferencesGrid
          budget="budget-friendly"
          seating="seated"
          transport="can-drive"
          matching="flexible"
        />
      </Card>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: '5%',
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  avatar: {
    width: responsiveSizes.avatar.large,
    height: responsiveSizes.avatar.large,
    borderRadius: responsiveSizes.avatar.large / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  meta: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.xs,
  },
  verifiedText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  mutualFriends: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  mutualFriendsAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mutualFriendAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  mutualFriendsText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  section: {
    marginHorizontal: '5%',
    marginBottom: SPACING.md,
    alignSelf: 'center',
    maxWidth: '100%',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  subsectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
    marginBottom: SPACING.sm,
    marginTop: -SPACING.sm,
  },
  bio: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  infoGrid: {
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
  },
  // Featured Song Styles
  featuredSong: {
    position: 'relative',
  },
  featuredSongImage: {
    width: '100%',
    height: responsiveSizes.featuredSongHeight,
    borderRadius: BORDER_RADIUS.md,
  },
  featuredSongOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredSongInfo: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
  },
  featuredSongLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.inverse,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xs,
  },
  featuredSongName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.inverse,
  },
  featuredSongArtist: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.inverse,
    opacity: 0.9,
    marginTop: 2,
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: responsiveSizes.waveformBarHeight,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  waveformBar: {
    width: responsiveSizes.waveformBarWidth,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    opacity: 0.7,
  },
  // Music Stats
  spotifyHours: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  spotifyHoursText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },
  genresSection: {
    marginBottom: SPACING.md,
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  genreBorderedTag: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.text.secondary,
  },
  genreTagText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
  },
  // Top Artists
  artistsList: {
    flexDirection: 'row',
    gap: SPACING.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
  },
  artistItem: {
    alignItems: 'center',
    minWidth: 80,
    maxWidth: 100,
    flex: 1,
    flexBasis: '30%',
  },
  artistImage: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: responsiveSizes.artistImage.large,
    borderRadius: responsiveSizes.artistImage.large / 2,
    marginBottom: SPACING.xs,
  },
  artistName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  artistPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: responsiveSizes.artistImage.large,
    borderRadius: responsiveSizes.artistImage.large / 2,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // Top Tracks
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  trackNumber: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.secondary,
    width: responsiveSizes.icon.medium,
  },
  trackImage: {
    width: responsiveSizes.artistImage.tiny,
    height: responsiveSizes.artistImage.tiny,
    borderRadius: BORDER_RADIUS.sm,
  },
  songPlaceholder: {
    width: responsiveSizes.artistImage.tiny,
    height: responsiveSizes.artistImage.tiny,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },
  trackArtist: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  trackDuration: {
    paddingHorizontal: SPACING.sm,
  },
  trackDurationText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.tertiary,
  },
  // Concert History
  concertHistoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  concertHistoryCard: {
    flex: 1,
    minWidth: '30%',
    maxWidth: '32%',
    aspectRatio: 0.75,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    position: 'relative',
  },
  concertHistoryCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  concertHistoryCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  concertHistoryCardArtist: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.inverse,
    marginBottom: 2,
  },
  concertHistoryCardDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.inverse,
    opacity: 0.9,
  },
  // Credentials/Vouches
  vouchesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  vouchItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  vouchIcon: {
    width: responsiveSizes.vouchIcon,
    height: responsiveSizes.vouchIcon,
    borderRadius: responsiveSizes.vouchIcon / 2,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vouchCount: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  vouchLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  // Reviews
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  star: {
    fontSize: 20,
    color: '#FFD700',
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: SPACING.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  reviewerName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 1,
  },
  starFilled: {
    fontSize: 14,
    color: '#FFD700',
  },
  starEmpty: {
    fontSize: 14,
    color: COLORS.text.tertiary,
  },
  reviewComment: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.primary,
    lineHeight: 16,
  },
  reviewDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  // Bottom spacing
  bottomSpacing: {
    height: SPACING.xl,
  },
});