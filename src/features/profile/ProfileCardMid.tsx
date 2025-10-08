// ProfileCardMid - Mid Detail Profile View
// Based on Figma "Screen 1: Mid Detail Profile View"
// Balanced view: key info, top 3 artists, condensed genres, concert preferences

import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Card, Tag, ConcertPreferencesGrid } from '@components';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import type { User, SpotifyData } from '@types';

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
            {user.age} • {user.pronouns} • {user.city}
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

        {spotifyData && (
          <Card
            icon={<MaterialIcons name="headphones" size={18} color="rgba(0,0,0,0.8)" />}
            variant="outlined"
            padding="sm"
          >
            <Text style={styles.infoTextCompact}>{spotifyData.total_listening_time}h</Text>
          </Card>
        )}
      </View>

      {/* Top Genres (Condensed to 3-5) */}
      {spotifyData && spotifyData.top_genres.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Top Genres</Text>
          <View style={styles.genresRow}>
            {spotifyData.top_genres.slice(0, 5).map((genre) => (
              <Tag key={genre} label={genre} selected readOnly />
            ))}
          </View>
        </Card>
      )}

      {/* Top 3 Artists */}
      {spotifyData && spotifyData.top_artists.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Top Artists</Text>
          <View style={styles.artistsRow}>
            {spotifyData.top_artists.slice(0, 3).map((artist) => (
              <View key={artist.id} style={styles.artistItem}>
                <Image source={{ uri: artist.image_url }} style={styles.artistImage} />
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

      {/* Placeholder for concert interest card */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Next Concert</Text>
        <Text style={styles.placeholder}>Concert card will go here</Text>
      </Card>
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
    padding: SPACING.lg,
    alignItems: 'center',
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
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
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
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  infoTextCompact: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.primary,
  },
  genresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  artistsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  artistItem: {
    alignItems: 'center',
    flex: 1,
  },
  artistImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: SPACING.xs,
  },
  artistName: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  placeholder: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
});
