// ProfileCardHigh - High Detail Profile View
// Based on Figma "Screen 2: High Detail Profile View"
// Shows maximum information: all fields, top 5 artists, genres, songs, reviews, etc.

import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { Card, Tag, LookingForSection } from '@components';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import type { User, SpotifyData } from '@types';
import type { Concert } from '@components/profile/LookingForSection';

interface ProfileCardHighProps {
  user: User;
  spotifyData?: SpotifyData;
}

/**
 * High Detail Profile Card
 *
 * Components from Figma extraction:
 * - mutual-friends-indicator: Shows mutual connections
 * - looking-for-section: Concert buddy search card
 * - spotify-hours-badge: Total listening hours
 * - top-genres-list: Vertical genre list
 * - music-waveform: Favorite song visualizer (TODO)
 * - vouches-grid: Concerts/Verification/Rating badges
 * - review-card: User review cards
 * - profile-info-list: University/Location/Buddy type
 *
 * TODO: Implement all components from Figma spec
 * TODO: Add artist-avatar for top 5 artists with images
 * TODO: Add song-list-item for numbered song entries
 * TODO: Add concert-history-item for past concerts
 * TODO: Add star-rating for reviews
 */
export const ProfileCardHigh: React.FC<ProfileCardHighProps> = ({ user, spotifyData }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
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
        </View>
      </View>

      {/* Looking For Section - Concert Buddy Search */}
      <LookingForSection
        concert={{
          id: '1',
          artist: 'Example Artist',
          venue: 'Example Venue',
          date: 'Dec 15, 2025'
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

          <Card icon={<MaterialIcons name="location-on" size={20} color="rgba(0,0,0,0.8)" />}>
            <Text style={styles.infoText}>{user.city}</Text>
          </Card>

          <Card icon={<MaterialIcons name="people" size={20} color="rgba(0,0,0,0.8)" />}>
            <Text style={styles.infoText}>
              {user.looking_for === 'friends' ? 'Looking for friends' :
               user.looking_for === 'dating' ? 'Looking to date' :
               'Open to both'}
            </Text>
          </Card>
        </View>
      </Card>

      {/* Spotify Hours Badge */}
      {spotifyData && (
        <Card style={styles.section}>
          <View style={styles.spotifyHours}>
            <MaterialIcons name="headphones" size={24} color={COLORS.primary} />
            <View>
              <Text style={styles.hoursNumber}>{spotifyData.total_listening_time}</Text>
              <Text style={styles.hoursLabel}>hours on Spotify</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Top Genres List (Vertical) */}
      {spotifyData && spotifyData.top_genres.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Top Genres</Text>
          <View style={styles.genresList}>
            {spotifyData.top_genres.map((genre, index) => (
              <Tag key={genre} label={genre} selected readOnly />
            ))}
          </View>
        </Card>
      )}

      {/* Top Artists (with images - TODO: implement artist-avatar component) */}
      {spotifyData && spotifyData.top_artists.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Top Artists</Text>
          <View style={styles.artistsList}>
            {spotifyData.top_artists.map((artist) => (
              <View key={artist.id} style={styles.artistItem}>
                <Image source={{ uri: artist.image_url }} style={styles.artistImage} />
                <Text style={styles.artistName} numberOfLines={2}>
                  {artist.name}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Top Tracks (TODO: implement song-list-item component) */}
      {spotifyData && spotifyData.top_tracks.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Top Tracks</Text>
          {spotifyData.top_tracks.map((track, index) => (
            <View key={track.id} style={styles.trackItem}>
              <Text style={styles.trackNumber}>{index + 1}</Text>
              <Image source={{ uri: track.image_url }} style={styles.trackImage} />
              <View style={styles.trackInfo}>
                <Text style={styles.trackName} numberOfLines={1}>
                  {track.name}
                </Text>
                <Text style={styles.trackArtist} numberOfLines={1}>
                  {track.artist}
                </Text>
              </View>
            </View>
          ))}
        </Card>
      )}

      {/* Vouches/Badges Grid (TODO: implement vouches-grid component) */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Credentials</Text>
        <View style={styles.vouchesGrid}>
          <View style={styles.vouchItem}>
            <MaterialIcons name="confirmation-number" size={32} color={COLORS.primary} />
            <Text style={styles.vouchLabel}>Concert Verified</Text>
          </View>
          <View style={styles.vouchItem}>
            <MaterialIcons name="verified-user" size={32} color={COLORS.success} />
            <Text style={styles.vouchLabel}>Profile Verified</Text>
          </View>
          <View style={styles.vouchItem}>
            <MaterialIcons name="star" size={32} color={COLORS.warning} />
            <Text style={styles.vouchLabel}>Top Rated</Text>
          </View>
        </View>
      </Card>

      {/* Reviews Section (TODO: implement review-card component) */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Reviews</Text>
        <Text style={styles.placeholder}>Review cards will go here</Text>
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
    width: 100,
    height: 100,
    borderRadius: 50,
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
  section: {
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
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
  spotifyHours: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  hoursNumber: {
    fontSize: TYPOGRAPHY.sizes['3xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  hoursLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  genresList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  artistsList: {
    flexDirection: 'row',
    gap: SPACING.md,
    flexWrap: 'wrap',
  },
  artistItem: {
    alignItems: 'center',
    width: 100,
  },
  artistImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
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
    gap: SPACING.md,
  },
  trackNumber: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.secondary,
    width: 24,
  },
  trackImage: {
    width: 50,
    height: 50,
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
  },
  vouchesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  vouchItem: {
    alignItems: 'center',
    gap: SPACING.xs,
  },
  vouchLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  placeholder: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
});
