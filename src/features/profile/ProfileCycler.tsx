// Profile Cycler Component
// Cycles through 3 test profiles + real Spotify data profile

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ProfileCardHigh } from './ProfileCardHigh';
import { ProfileCardMid } from './ProfileCardMid';
import { ProfileCardLow } from './ProfileCardLow';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { TEST_PROFILES } from '@utils/profileCycler';
import { fetchAllSpotifyData } from '@services/spotify';
import { getValidAccessToken } from '@services/spotify';
import type { User, SpotifyData } from '@types';

type ViewMode = 'high' | 'mid' | 'low';

interface ProfileCyclerProps {
  defaultViewMode?: ViewMode;
}

export const ProfileCycler: React.FC<ProfileCyclerProps> = ({ defaultViewMode = 'mid' }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode);
  const [realSpotifyData, setRealSpotifyData] = useState<SpotifyData | null>(null);
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSpotify, setCurrentSpotify] = useState<SpotifyData | null>(null);

  // Total profiles = 3 test profiles + 1 real Spotify profile (if available)
  const totalProfiles = realSpotifyData ? TEST_PROFILES.length + 1 : TEST_PROFILES.length;

  // Load real Spotify data on mount
  useEffect(() => {
    loadSpotifyData();
  }, []);

  // Update current profile when index changes
  useEffect(() => {
    if (currentIndex < TEST_PROFILES.length) {
      // Show test profile
      setCurrentUser(TEST_PROFILES[currentIndex].user);
      setCurrentSpotify(TEST_PROFILES[currentIndex].spotify);
    } else if (currentIndex === TEST_PROFILES.length && realSpotifyData) {
      // Show real Spotify profile
      setCurrentUser(createUserFromSpotify(realSpotifyData));
      setCurrentSpotify(realSpotifyData);
    }
  }, [currentIndex, realSpotifyData]);

  const loadSpotifyData = async () => {
    setIsLoadingSpotify(true);
    try {
      const token = await getValidAccessToken();
      if (token) {
        const data = await fetchAllSpotifyData();
        setRealSpotifyData(data);
      }
    } catch (error) {
      console.log('No Spotify data available:', error);
    } finally {
      setIsLoadingSpotify(false);
    }
  };

  const createUserFromSpotify = (spotifyData: SpotifyData): User => {
    return {
      id: spotifyData.spotify_user_id,
      username: spotifyData.spotify_user_id,
      display_name: 'Your Profile',
      profile_picture_url: 'https://i.pravatar.cc/300?img=1', // Placeholder
      bio: 'This is your Spotify profile! Connect and customize your bio.',
      age: 0, // User should fill this in
      pronouns: '',
      university: '',
      city: '',
      looking_for: 'friends',
      group_preference: 'both',
      concert_preferences: [],
      show_university: true,
      is_verified: false,
      is_active: true,
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
    };
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalProfiles);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalProfiles) % totalProfiles);
  };

  const cycleViewMode = () => {
    setViewMode((prev) => {
      if (prev === 'high') return 'mid';
      if (prev === 'mid') return 'low';
      return 'high';
    });
  };

  const getProfileLabel = () => {
    if (currentIndex < TEST_PROFILES.length) {
      return `Test Profile ${currentIndex + 1}/3`;
    }
    return 'Your Spotify Profile';
  };

  const getViewModeLabel = () => {
    if (viewMode === 'high') return 'High Detail';
    if (viewMode === 'mid') return 'Mid Detail';
    return 'Low Detail';
  };

  if (!currentUser || !currentSpotify) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profiles...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Controls */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.profileLabel}>{getProfileLabel()}</Text>
          {realSpotifyData && currentIndex === TEST_PROFILES.length && (
            <View style={styles.spotifyBadge}>
              <MaterialIcons name="check-circle" size={16} color={COLORS.primary} />
              <Text style={styles.spotifyBadgeText}>Spotify Connected</Text>
            </View>
          )}
        </View>

        <View style={styles.controls}>
          {/* View Mode Toggle */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={cycleViewMode}
            activeOpacity={0.7}
          >
            <MaterialIcons name="visibility" size={20} color={COLORS.text.primary} />
            <Text style={styles.controlText}>{getViewModeLabel()}</Text>
          </TouchableOpacity>

          {/* Navigation Controls */}
          <View style={styles.navigationRow}>
            <TouchableOpacity
              style={styles.navButton}
              onPress={handlePrevious}
              activeOpacity={0.7}
            >
              <MaterialIcons name="chevron-left" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>

            <Text style={styles.counterText}>
              {currentIndex + 1} / {totalProfiles}
            </Text>

            <TouchableOpacity
              style={styles.navButton}
              onPress={handleNext}
              activeOpacity={0.7}
            >
              <MaterialIcons name="chevron-right" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile Card Display */}
      <View style={styles.cardContainer}>
        {viewMode === 'high' && (
          <ProfileCardHigh user={currentUser} spotifyData={currentSpotify} />
        )}
        {viewMode === 'mid' && (
          <ProfileCardMid user={currentUser} spotifyData={currentSpotify} />
        )}
        {viewMode === 'low' && (
          <ProfileCardLow user={currentUser} spotifyData={currentSpotify} />
        )}
      </View>

      {/* Footer Info */}
      {!realSpotifyData && !isLoadingSpotify && (
        <View style={styles.footer}>
          <MaterialIcons name="info-outline" size={16} color={COLORS.text.secondary} />
          <Text style={styles.footerText}>
            Connect Spotify in /test-supabase to add your profile
          </Text>
        </View>
      )}

      {isLoadingSpotify && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Loading Spotify data...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  profileLabel: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  spotifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  spotifyBadgeText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.primary,
  },
  controls: {
    gap: SPACING.sm,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  controlText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.lg,
  },
  navButton: {
    padding: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  counterText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    minWidth: 60,
    textAlign: 'center',
  },
  cardContainer: {
    flex: 1,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
  },
});
