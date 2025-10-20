// ProfileCardHigh - High Detail Profile View
// Based on Figma "Screen 2: High Detail Profile View"
// Shows maximum information: all fields, top 5 artists, genres, songs, reviews, concert history, etc.

import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Card, LookingForSection, ConcertPreferencesGrid } from '@components';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import type { User, SpotifyData } from '@types';
import { responsiveSizes } from '@utils/responsive';

interface ProfileCardHighProps {
  user: User;
  spotifyData?: SpotifyData;
}

// Mock data for features not yet in database
const MOCK_MUTUAL_FRIENDS = [
  { id: '1', avatar: 'https://i.pravatar.cc/100?img=1' },
  { id: '2', avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: '3', avatar: 'https://i.pravatar.cc/100?img=3' },
];
const MOCK_CONCERT_HISTORY = [
  { id: '1', artist: 'Phoebe Bridgers', venue: 'The Tabernacle', date: 'Oct 2024', image: 'https://i.pravatar.cc/300?img=51' },
  { id: '2', artist: 'Clairo', venue: 'Terminal West', date: 'Sep 2024', image: 'https://i.pravatar.cc/300?img=52' },
  { id: '3', artist: 'Boygenius', venue: 'State Farm Arena', date: 'Aug 2024', image: 'https://i.pravatar.cc/300?img=53' },
];
const MOCK_REVIEWS = [
  { id: '1', reviewer: 'Sarah K.', rating: 5, text: 'Amazing concert buddy! We saw Taylor Swift together and had the best time. Great energy and super reliable.', date: '2 weeks ago', avatar: 'https://i.pravatar.cc/300?img=45' },
  { id: '2', reviewer: 'Mike T.', rating: 5, text: 'Super fun to hang out with at shows. Knows all the best venues in Atlanta!', date: '1 month ago', avatar: 'https://i.pravatar.cc/300?img=13' },
  { id: '3', reviewer: 'Alex M.', rating: 4, text: 'Great music taste and always on time. Would definitely go to another concert together.', date: '2 months ago', avatar: 'https://i.pravatar.cc/300?img=27' },
];

/**
 * Star Rating Component
 */
const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 16 }) => {
  return (
    <View style={styles.starRating}>
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialIcons
          key={star}
          name={star <= rating ? 'star' : 'star-border'}
          size={size}
          color={star <= rating ? COLORS.warning : COLORS.text.tertiary}
        />
      ))}
    </View>
  );
};

/**
 * Review Card Component
 */
const ReviewCard: React.FC<{ review: typeof MOCK_REVIEWS[0] }> = ({ review }) => {
  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <Image source={{ uri: review.avatar }} style={styles.reviewAvatar} />
        <View style={styles.reviewHeaderInfo}>
          <Text style={styles.reviewerName}>{review.reviewer}</Text>
          <StarRating rating={review.rating} size={14} />
        </View>
        <Text style={styles.reviewDate}>{review.date}</Text>
      </View>
      <Text style={styles.reviewText}>{review.text}</Text>
    </View>
  );
};

/**
 * Concert History Item Component (Card Style - Figma Design)
 */
const ConcertHistoryItem: React.FC<{ concert: typeof MOCK_CONCERT_HISTORY[0] }> = ({ concert }) => {
  return (
    <View style={styles.concertHistoryCard}>
      <Image source={{ uri: concert.image }} style={styles.concertHistoryCardImage} />
      <View style={styles.concertHistoryCardOverlay}>
        <Text style={styles.concertHistoryCardArtist} numberOfLines={1}>
          {concert.artist}
        </Text>
        <Text style={styles.concertHistoryCardDate}>{concert.date}</Text>
      </View>
    </View>
  );
};

/**
 * Music Waveform / Featured Song Component
 */
const FeaturedSong: React.FC<{ track?: SpotifyData['top_tracks'][0] }> = ({ track }) => {
  if (!track) return null;

  return (
    <View style={styles.featuredSong}>
      <Image
        source={{ uri: track.image_url }}
        style={styles.featuredSongImage}
      />
      <View style={styles.featuredSongOverlay}>
        <MaterialIcons name="play-circle-filled" size={48} color={COLORS.text.inverse} />
      </View>
      <View style={styles.featuredSongInfo}>
        <Text style={styles.featuredSongLabel}>Featured Song</Text>
        <Text style={styles.featuredSongName} numberOfLines={1}>
          {track.name}
        </Text>
        <Text style={styles.featuredSongArtist} numberOfLines={1}>
          {track.artist}
        </Text>
      </View>
      {/* Simulated waveform */}
      <View style={styles.waveform}>
        {[...Array(25)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.waveformBar,
              { height: Math.random() * 24 + 8 },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

/**
 * High Detail Profile Card - FULL IMPLEMENTATION
 */
export const ProfileCardHigh: React.FC<ProfileCardHighProps> = ({ user, spotifyData }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header with Mutual Friends */}
      <View style={styles.header}>
        <Image source={{ uri: user.profile_picture_url }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{user.display_name || user.username}</Text>
          <Text style={styles.meta}>
            {user.age} • {user.pronouns}
          </Text>
          {user.is_verified && (
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={16} color={COLORS.success} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
          {/* Mutual Friends Indicator with Avatars */}
          {MOCK_MUTUAL_FRIENDS.length > 0 && (
            <View style={styles.mutualFriends}>
              <View style={styles.mutualFriendsAvatars}>
                {MOCK_MUTUAL_FRIENDS.slice(0, 3).map((friend, index) => (
                  <Image
                    key={friend.id}
                    source={{ uri: friend.avatar }}
                    style={[
                      styles.mutualFriendAvatar,
                      index > 0 && { marginLeft: -8 }, // Overlap avatars
                    ]}
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

      {/* Looking For Section - Concert Buddy Search */}
      <LookingForSection
        concert={{
          id: '1',
          artist: 'Taylor Swift',
          venue: 'Mercedes-Benz Stadium',
          date: 'Dec 15, 2025',
        }}
        lookingForBuddy={true}
      />

      {/* Bio Section */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.bioText}>{user.bio}</Text>
      </Card>

      {/* Profile Info Cards */}
      <Card style={styles.section}>
        <View style={styles.infoGrid}>
          <Card
            icon={<MaterialIcons name="school" size={20} color="rgba(0,0,0,0.8)" />}
            badge={
              user.is_verified ? (
                <MaterialIcons name="verified" size={16} color={COLORS.success} />
              ) : undefined
            }
          >
            <Text style={styles.infoText}>{user.university}</Text>
          </Card>

          {user.academic_year && (
            <Card icon={<MaterialIcons name="school" size={20} color="rgba(0,0,0,0.8)" />}>
              <Text style={styles.infoText}>{user.academic_year}</Text>
            </Card>
          )}

          <Card icon={<MaterialIcons name="location-on" size={20} color="rgba(0,0,0,0.8)" />}>
            <Text style={styles.infoText}>{user.city}</Text>
          </Card>

          <Card icon={<MaterialIcons name="people" size={20} color="rgba(0,0,0,0.8)" />}>
            <Text style={styles.infoText}>
              {user.looking_for === 'friends'
                ? 'One-time concert buddy'
                : user.looking_for === 'dating'
                ? 'Looking to date'
                : 'Open to both'}
            </Text>
          </Card>
        </View>
      </Card>

      {/* Featured Song with Waveform */}
      {spotifyData && spotifyData.top_tracks.length > 0 && (
        <Card style={styles.section}>
          <FeaturedSong track={spotifyData.top_tracks[0]} />
        </Card>
      )}

      {/* Music Stats Section */}
      {spotifyData && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>My Music Stats</Text>

          {/* Spotify Hours */}
          {user.hours_on_spotify && (
            <View style={styles.spotifyHours}>
              <MaterialIcons name="music-note" size={20} color={COLORS.text.primary} />
              <Text style={styles.spotifyHoursText}>
                Spotify Hours: {user.hours_on_spotify.toLocaleString()}
              </Text>
            </View>
          )}

          {/* Top Genres */}
          {spotifyData.top_genres.length > 0 && (
            <View style={styles.genresSection}>
              <Text style={styles.subsectionTitle}>Top Genres</Text>
              <View style={styles.genresList}>
                {spotifyData.top_genres.slice(0, 3).map((genre, index) => (
                  <View key={`${genre}-${index}`} style={styles.genreBorderedTag}>
                    <Text style={styles.genreTagText}>{genre}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </Card>
      )}

      {/* Top Artists with Images (Limit to 3) */}
      {spotifyData && spotifyData.top_artists.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Top Artists</Text>
          <View style={styles.artistsList}>
            {spotifyData.top_artists.slice(0, 3).map((artist) => (
              <View key={artist.id} style={styles.artistItem}>
                <Image
                  source={{ uri: artist.image_url }}
                  style={styles.artistImage}
                  onError={() => {
                    console.warn('ProfileCardHigh: Failed to load artist image:', artist.name);
                  }}
                />
                <Text style={styles.artistName} numberOfLines={2}>
                  {artist.name}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Top Tracks */}
      {spotifyData && spotifyData.top_tracks.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Top Tracks</Text>
          {spotifyData.top_tracks.map((track, index) => (
            <View key={track.id} style={styles.trackItem}>
              <Text style={styles.trackNumber}>{index + 1}</Text>
              <Image
                source={{ uri: track.image_url }}
                style={styles.trackImage}
              />
              <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={1}>
                  {track.name}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {track.artist}
                </Text>
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
      )}

      {/* Concert History (Card Grid - Figma Style) */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Concert History</Text>
        <Text style={styles.subsectionTitle}>Recently Attended Shows</Text>
        <View style={styles.concertHistoryGrid}>
          {MOCK_CONCERT_HISTORY.map((concert) => (
            <ConcertHistoryItem key={concert.id} concert={concert} />
          ))}
        </View>
      </Card>

      {/* Vouches/Badges Grid */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Credentials</Text>
        <View style={styles.vouchesGrid}>
          <View style={styles.vouchItem}>
            <View style={styles.vouchIcon}>
              <MaterialIcons name="confirmation-number" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.vouchCount}>12</Text>
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
            <Text style={styles.vouchCount}>4.8</Text>
            <Text style={styles.vouchLabel}>Rating</Text>
          </View>
        </View>
      </Card>

      {/* Reviews Section with Star Ratings */}
      <Card style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <Text style={styles.seeMoreLink}>See More...</Text>
        </View>
        {MOCK_REVIEWS.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </Card>

      {/* Concert Preferences Grid */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Concert Preferences</Text>
        <ConcertPreferencesGrid
          budget="budget-friendly"
          seating="seated"
          transport="can-drive"
          matching={user.group_preference === 'both' ? 'flexible' : user.group_preference}
        />
      </Card>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: '5%', // Percentage-based padding
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  avatar: {
    width: responsiveSizes.avatar.large,
    height: responsiveSizes.avatar.large,
    borderRadius: responsiveSizes.avatar.large / 2,
    marginRight: SPACING.md,
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
    borderColor: COLORS.background, // White border for separation
  },
  mutualFriendsText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  section: {
    marginHorizontal: '5%', // Percentage-based margin (scales with screen width)
    marginBottom: SPACING.md,
    alignSelf: 'center',
    maxWidth: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.md,
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
  reviewCount: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  bioText: {
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
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  artistsList: {
    flexDirection: 'row',
    gap: SPACING.sm, // Reduced from md (16px) to sm (8px) to prevent overflow
    flexWrap: 'wrap',
    justifyContent: 'center', // Center the artist items
    alignItems: 'flex-start',
    width: '100%', // Ensure container respects parent constraints
  },
  artistItem: {
    alignItems: 'center',
    // Flex-based width for responsive layout
    // Aims for 3 items per row on small screens, 5 on larger screens
    minWidth: 80,
    maxWidth: 100,
    flex: 1,
    flexBasis: '30%', // 3 items × 30% = 90%, leaving 10% for 2 gaps of ~5% each
  },
  artistImage: {
    width: '100%',
    aspectRatio: 1, // Keep square shape
    maxWidth: responsiveSizes.artistImage.large,
    borderRadius: responsiveSizes.artistImage.large / 2,
    marginBottom: SPACING.xs,
  },
  artistName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
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
  // Review Card Styles (Compact Figma Style)
  reviewCard: {
    padding: SPACING.sm, // Reduced from md (16px) to sm (8px)
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.sm, // Reduced from md to sm
    marginBottom: SPACING.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs, // Reduced from sm to xs
  },
  reviewAvatar: {
    width: responsiveSizes.reviewAvatar * 0.8, // Slightly smaller avatar
    height: responsiveSizes.reviewAvatar * 0.8,
    borderRadius: (responsiveSizes.reviewAvatar * 0.8) / 2,
    marginRight: SPACING.xs, // Reduced from sm to xs
  },
  reviewHeaderInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: TYPOGRAPHY.sizes.xs, // Reduced from sm to xs
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  starRating: {
    flexDirection: 'row',
    gap: 1, // Reduced from 2 to 1
  },
  reviewDate: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
  reviewText: {
    fontSize: TYPOGRAPHY.sizes.xs, // Reduced from sm to xs
    color: COLORS.text.primary,
    lineHeight: 16, // Reduced from 20 to 16
  },
  // Concert History Styles (Card Grid - Figma Style)
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
    aspectRatio: 0.75, // Portrait card (3:4 ratio)
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark gradient overlay
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
  bottomSpacing: {
    height: SPACING.xl,
  },
  // Spotify Hours
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
  // Genres Section
  genresSection: {
    marginBottom: SPACING.md,
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
  // See More Link
  seeMoreLink: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: '#2194FF', // Blue link color from Figma
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
