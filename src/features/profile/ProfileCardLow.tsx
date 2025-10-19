// ProfileCardLow - Low Detail Profile View
// Image-heavy, minimal text design for fast browsing (Instagram-story style)
// Emphasis on photos, top artist only, truncated bio

import React from 'react';
import { View, Text, Image, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Tag, ConcertInterestPill } from '@components';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import type { User, SpotifyData } from '@types';
import { responsiveSizes } from '@utils/responsive';

interface ProfileCardLowProps {
  user: User;
  spotifyData?: SpotifyData;
}

/**
 * Low Detail Profile Card
 *
 * Design philosophy:
 * - Image-heavy, minimal text
 * - Instagram story / Tinder-like aesthetic
 * - Focus on visual appeal and quick decision-making
 * - Large profile photo with gradient overlay
 * - Only essential info: name, age, top artist, 1-2 genres
 *
 * Components from Figma:
 * - Large profile photo (full-screen or nearly full-screen)
 * - Gradient overlay for text readability
 * - Minimal text: name, age, location
 * - Single top artist image
 * - 1-2 genre tags max
 * - Verification badge if applicable
 *
 * TODO: Add swipe gestures for profile browsing
 * TODO: Add photo carousel if multiple photos available
 */
export const ProfileCardLow: React.FC<ProfileCardLowProps> = ({ user, spotifyData }) => {
  const topArtist = spotifyData?.top_artists[0];

  return (
    <View style={styles.container}>
      {/* Large Profile Photo with Overlay */}
      <ImageBackground
        source={{ uri: user.profile_picture_url }}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        {/* Gradient Overlay for Text Readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          {/* Top Info (Minimal) */}
          <View style={styles.topInfo}>
            {user.is_verified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={20} color={COLORS.background} />
              </View>
            )}

            {/* Concert Interest Pill */}
            <View style={styles.concertPillContainer}>
              <ConcertInterestPill
                concertName="Taylor Swift"
                isLookingForBuddy={true}
              />
            </View>
          </View>

          {/* Bottom Info */}
          <View style={styles.bottomInfo}>
            {/* Name and Age */}
            <Text style={styles.name}>
              {user.display_name || user.username}, {user.age}
            </Text>

            {/* Location (minimal) */}
            <View style={styles.locationRow}>
              <MaterialIcons name="location-on" size={16} color={COLORS.background} />
              <Text style={styles.location}>{user.city}</Text>
            </View>

            {/* Bio (truncated to 1 line) */}
            <Text style={styles.bioTruncated} numberOfLines={1}>
              {user.bio}
            </Text>

            {/* Top Artist Only */}
            {topArtist && (
              <View style={styles.artistRow}>
                <Image source={{ uri: topArtist.image_url }} style={styles.artistImage} />
                <View>
                  <Text style={styles.artistLabel}>Top Artist</Text>
                  <Text style={styles.artistName}>{topArtist.name}</Text>
                </View>
              </View>
            )}

            {/* Top 1-2 Genres */}
            {spotifyData && spotifyData.top_genres.length > 0 && (
              <View style={styles.genresRow}>
                {spotifyData.top_genres.slice(0, 2).map((genre) => (
                  <View key={genre} style={styles.genreTagLow}>
                    <Text style={styles.genreTextLow}>{genre}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.background,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  backgroundImageStyle: {
    resizeMode: 'cover',
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: '5%', // Percentage-based padding
    paddingVertical: SPACING.md,
  },
  topInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  concertPillContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  verifiedBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: SPACING.xs,
  },
  bottomInfo: {
    gap: SPACING.sm,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.background,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  location: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.background,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bioTruncated: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.background,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  artistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: SPACING.sm,
    borderRadius: 12,
  },
  artistImage: {
    width: responsiveSizes.avatar.small,
    height: responsiveSizes.avatar.small,
    borderRadius: responsiveSizes.avatar.small / 2,
    borderWidth: 2,
    borderColor: COLORS.background,
  },
  artistLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.background,
    opacity: 0.8,
  },
  artistName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.background,
  },
  genresRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  genreTagLow: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  genreTextLow: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.background,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});
