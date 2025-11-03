/**
 * Profile Card B - Badge System
 * Shows test profiles with visual badges instead of text reviews
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Card, LookingForSection, ConcertPreferencesGrid } from '@components';
import { MaterialIcons } from '@expo/vector-icons';
import type { TestProfile } from '@types';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@constants';
import { responsiveSizes } from '@utils/responsive';

interface ProfileCardBProps {
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

const MOCK_SPOTIFY_HOURS = 45234;

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

export function ProfileCardB({ profile }: ProfileCardBProps) {
  const { badgesTypeB } = profile;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header with Mutual Friends */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profile.name[0]}</Text>
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
      <Card style={styles.section}>
        <FeaturedSong track={MOCK_SPOTIFY_DATA.featured_track} />
      </Card>

      {/* Music Stats */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>My Music Stats</Text>
        <View style={styles.spotifyHours}>
          <MaterialIcons name="music-note" size={20} color={COLORS.text.primary} />
          <Text style={styles.spotifyHoursText}>
            Spotify Hours: {MOCK_SPOTIFY_HOURS.toLocaleString()}
          </Text>
        </View>
        <View style={styles.genresSection}>
          <Text style={styles.subsectionTitle}>Top Genres</Text>
          <View style={styles.genresList}>
            {MOCK_SPOTIFY_DATA.top_genres.map((genre, index) => (
              <View key={`${genre}-${index}`} style={styles.genreBorderedTag}>
                <Text style={styles.genreTagText}>{genre}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>

      {/* Top Artists */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Top Artists</Text>
        <View style={styles.artistsList}>
          {MOCK_SPOTIFY_DATA.top_artists.map((artist) => (
            <View key={artist.id} style={styles.artistItem}>
              <Image source={{ uri: artist.image_url }} style={styles.artistImage} />
              <Text style={styles.artistName} numberOfLines={2}>{artist.name}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Top Tracks */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Top Tracks</Text>
        {MOCK_SPOTIFY_DATA.top_tracks.map((track, index) => (
          <View key={track.id} style={styles.trackItem}>
            <Text style={styles.trackNumber}>{index + 1}</Text>
            <Image source={{ uri: track.image_url }} style={styles.trackImage} />
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
        ))}
      </Card>

      {/* Concert History */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Concert History</Text>
        <Text style={styles.subsectionTitle}>Recently Attended Shows</Text>
        <View style={styles.concertHistoryGrid}>
          {MOCK_CONCERT_HISTORY.map((concert) => (
            <ConcertHistoryItem key={concert.id} concert={concert} />
          ))}
        </View>
      </Card>

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
            <Text style={styles.vouchCount}>{badgesTypeB.harmonies.count}</Text>
            <Text style={styles.vouchLabel}>Harmonies</Text>
          </View>
        </View>
      </Card>

      {/* Badges Section */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Badges & Credentials</Text>
        <Text style={styles.subtitle}>Based on {profile.totalReviews} reviews</Text>

        <View style={styles.badgesContainer}>
          {/* Q1 Badge - Event Quality */}
          {badgesTypeB.q1Badge ? (
            <View style={[styles.badgeCard, styles.badgeCardEarned]}>
              <Text style={styles.badgeEmoji}>{badgesTypeB.q1Badge.emoji}</Text>
              <Text style={styles.badgeName}>{badgesTypeB.q1Badge.name}</Text>
              <Text style={styles.badgeCategory}>Event Quality</Text>
            </View>
          ) : (
            <View style={[styles.badgeCard, styles.badgeCardLocked]}>
              <Text style={styles.badgeEmojiLocked}>🔒</Text>
              <Text style={styles.badgeNameLocked}>Not Yet Earned</Text>
              <Text style={styles.badgeCategory}>Event Quality</Text>
            </View>
          )}

          {/* Q2 Badge - Social Compatibility */}
          {badgesTypeB.q2Badge ? (
            <View style={[styles.badgeCard, styles.badgeCardEarned]}>
              <Text style={styles.badgeEmoji}>{badgesTypeB.q2Badge.emoji}</Text>
              <Text style={styles.badgeName}>{badgesTypeB.q2Badge.name}</Text>
              <Text style={styles.badgeCategory}>Social Vibe</Text>
            </View>
          ) : (
            <View style={[styles.badgeCard, styles.badgeCardLocked]}>
              <Text style={styles.badgeEmojiLocked}>🔒</Text>
              <Text style={styles.badgeNameLocked}>Not Yet Earned</Text>
              <Text style={styles.badgeCategory}>Social Vibe</Text>
            </View>
          )}

          {/* Q3 Badge - Reliability */}
          {badgesTypeB.q3Badge ? (
            <View style={[styles.badgeCard, styles.badgeCardEarned]}>
              <Text style={styles.badgeEmoji}>{badgesTypeB.q3Badge.emoji}</Text>
              <Text style={styles.badgeName}>{badgesTypeB.q3Badge.name}</Text>
              <Text style={styles.badgeCategory}>Reliability</Text>
            </View>
          ) : (
            <View style={[styles.badgeCard, styles.badgeCardLocked]}>
              <Text style={styles.badgeEmojiLocked}>🔒</Text>
              <Text style={styles.badgeNameLocked}>Not Yet Earned</Text>
              <Text style={styles.badgeCategory}>Reliability</Text>
            </View>
          )}

          {/* Harmonies Counter */}
          <View style={[styles.badgeCard, badgesTypeB.harmonies.count > 0 ? styles.badgeCardEarned : styles.badgeCardLocked]}>
            <Text style={badgesTypeB.harmonies.count > 0 ? styles.badgeEmoji : styles.badgeEmojiLocked}>
              {badgesTypeB.harmonies.count > 0 ? '🤝' : '🔒'}
            </Text>
            <Text style={badgesTypeB.harmonies.count > 0 ? styles.badgeName : styles.badgeNameLocked}>
              {badgesTypeB.harmonies.count > 0 ? `${badgesTypeB.harmonies.count} Harmonies` : 'No Harmonies Yet'}
            </Text>
            <Text style={styles.badgeCategory}>Would Meet Again</Text>
          </View>
        </View>
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
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
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
  // Badges
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  badgeCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  badgeCardEarned: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  badgeCardLocked: {
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    opacity: 0.6,
  },
  badgeEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  badgeEmojiLocked: {
    fontSize: 36,
    marginBottom: SPACING.sm,
    opacity: 0.4,
  },
  badgeName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  badgeNameLocked: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.tertiary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  badgeCategory: {
    fontSize: 11,
    color: COLORS.text.tertiary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Bottom spacing
  bottomSpacing: {
    height: SPACING.xl,
  },
});
