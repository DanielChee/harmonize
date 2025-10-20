// ProfileCardMid - Mid Detail Profile View
// Based on Figma "Screen 1: Mid Detail Profile View"
// Balanced view: key info, top 3 artists, condensed genres, concert preferences

import { Card, ConcertPreferencesGrid } from '@components';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import type { SpotifyData, User } from '@types';
import { responsiveSizes } from '@utils/responsive';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

interface ProfileCardMidProps {
  user: User;
  spotifyData?: SpotifyData;
}

/**
 * Mid Detail Profile Card
 *
 * Components from Figma extraction (Screen 1):
 * - profile-header: Username, pronouns, age display
 * - info-card: Icon + text info cards (university, location)
 * - concert-card: Concert interest highlight (TODO)
 * - about-section: User bio section
 * - concert-preferences-grid: Budget/Seating/Transport/Matching grid (TODO)
 * - genre-tag: Music genre pills (condensed to top 3-5)
 * - artist-avatar: Circular artist photos (top 3)
 * - song-list-item: Numbered song entries (TODO - optional)
 * - concert-history-item: Past concerts attended (TODO - optional)
 * - star-rating: 5-star review display (TODO - optional)
 *
 * Focus: Quick scanning, essential info only
 */
export const ProfileCardMid: React.FC<ProfileCardMidProps> = ({ user, spotifyData }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header - Compact */}
      <View style={styles.header}>
        <Image source={{ uri: user.profile_picture_url }} style={styles.avatar} />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{user.display_name || user.username}</Text>
          <Text style={styles.meta}>
            {user.pronouns} • {user.age} yrs old
          </Text>
        </View>
      </View>

      {/* About Section */}
      <Card style={styles.section}>
        <Text style={styles.bioText} numberOfLines={3}>
          {user.bio}
        </Text>
      </Card>

      {/* Key Info Cards */}
      <View style={styles.infoRow}>
        <Card
          icon={<MaterialIcons name="school" size={18} color="rgba(0,0,0,0.8)" />}
          variant="outlined"
          padding="sm"
        >
          <Text style={styles.infoTextCompact}>{user.university}</Text>
        </Card>

        {user.academic_year && (
          <Card
            icon={<MaterialIcons name="school" size={18} color="rgba(0,0,0,0.8)" />}
            variant="outlined"
            padding="sm"
          >
            <Text style={styles.infoTextCompact}>{user.academic_year}</Text>
          </Card>
        )}

        <Card
          icon={<MaterialIcons name="location-on" size={18} color="rgba(0,0,0,0.8)" />}
          variant="outlined"
          padding="sm"
        >
          <Text style={styles.infoTextCompact}>{user.city}</Text>
        </Card>
      </View>

      {/* Music Stats */}
      {spotifyData && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Music Stats</Text>


          {/* Top Genres (Condensed to 3) */}
          {spotifyData.top_genres.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Top Genres</Text>
              <View style={styles.genresRow}>
                {spotifyData.top_genres.slice(0, 3).map((genre, index) => (
                  <View key={`${genre}-${index}`} style={styles.genreBorderedTag}>
                    <Text style={styles.genreTagText}>{genre}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </Card>
      )}

      {/* Top 3 Artists */}
      {spotifyData && spotifyData.top_artists.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Top Artists</Text>
          <View style={styles.artistsRow}>
            {spotifyData.top_artists.slice(0, 3).map((artist) => (
              <View key={artist.id} style={styles.artistItem}>
                <Image
                  source={{ uri: artist.image_url }}
                  style={styles.artistImage}
                  onError={() => {
                    console.warn('ProfileCardMid: Failed to load artist image:', artist.name);
                  }}
                />
                <Text style={styles.artistName} numberOfLines={1}>
                  {artist.name}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

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
    width: responsiveSizes.avatar.medium,
    height: responsiveSizes.avatar.medium,
    borderRadius: responsiveSizes.avatar.medium / 2,
    marginRight: SPACING.md,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  meta: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  section: {
    marginHorizontal: '5%', // Percentage-based margin (scales with screen width)
    marginBottom: SPACING.md,
    alignSelf: 'center',
    maxWidth: '100%',
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  bioText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    paddingHorizontal: '5%', // Percentage-based padding
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    justifyContent: 'center', // Center the info cards
    flexWrap: 'wrap', // Allow wrapping if needed
  },
  infoTextCompact: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.primary,
    flexShrink: 1, // Allow text to shrink if needed
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  artistsRow: {
    flexDirection: 'row',
    gap: SPACING.sm, // Reduced from md (16px) to sm (8px) to prevent overflow
    width: '100%', // Ensure container respects parent constraints
    justifyContent: 'center', // Center the artist items
  },
  artistItem: {
    alignItems: 'center',
    flex: 1,
    minWidth: 70,
    maxWidth: 90,
  },
  artistImage: {
    width: '100%',
    aspectRatio: 1, // Keep square shape
    maxWidth: responsiveSizes.artistImage.small,
    borderRadius: responsiveSizes.artistImage.small / 2,
    marginBottom: SPACING.xs,
  },
  artistName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  // Spotify Hours
  spotifyHours: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  spotifyHoursText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },
  // Subsection Title
  subsectionTitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.secondary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  // Bordered Genre Tags
  genreBorderedTag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.text.secondary,
  },
  genreTagText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.primary,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});
