/**
 * Profile Preview Step
 * Shows user their profile preview using ProfileCardB and asks for satisfaction
 */

import type { BudgetPreference, SeatingPreference, TransportPreference } from '@components/profile/ConcertPreferencesGrid';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import { ProfileCardB } from '@features/testing/ProfileCardB';
import type { TestProfile } from '@types';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ProfilePreviewStepProps {
  formData: {
    display_name: string;
    city: string;
    age: number;
    mbti: string;
    pronouns: string;
    bio: string;
    top_genres: string[];
    top_artists: string[];
    top_songs: string[];
    artist_images: { name: string; url: string }[];
    song_images: { name: string; url: string }[];
    profile_picture_url: string;
    concert_budget: string;
    concert_seating: string;
    concert_transportation: string;
    university: string;
    academic_field: string;
    academic_year: string;
  };
  onSatisfied: () => void;
  onNotSatisfied: () => void;
}

export const ProfilePreviewStep: React.FC<ProfilePreviewStepProps> = ({
  formData,
  onSatisfied,
  onNotSatisfied,
}) => {
  const insets = useSafeAreaInsets();
  
  // Form values now match the expected types, so we can use them directly
  const concertBudget = (formData.concert_budget as BudgetPreference) || 'any';
  const concertSeating = (formData.concert_seating as SeatingPreference) || 'any';
  const concertTransport = (formData.concert_transportation as TransportPreference) || 'any';
  
  // Convert formData to TestProfile format
  // Note: Some fields are missing from formData and will use defaults
  const testProfile: TestProfile = {
    id: 'preview',
    name: formData.display_name || 'User',
    age: formData.age,
    pronouns: formData.pronouns,
    bio: formData.bio,
    university: formData.university || 'Not specified',
    universityVerified: !!formData.university, // Verified if university is provided
    concertsAttended: 0, // Missing from formData - using default
    accountAgeMonths: 0, // Missing from formData - using default
    mutualFriends: 0, // Missing from formData - using default (not applicable for own profile)
    profileType: 'positive', // Default for preview
    reviewsTypeA: [], // Not applicable for preview
    averageRatingTypeA: 0, // Not applicable for preview
    badgesTypeB: {
      q1Badge: null, // Default badges
      q2Badge: null,
      q3Badge: null,
      harmonies: { count: 0, total: 0 },
    },
    totalReviews: 0, // Not applicable for preview
    top_genres: formData.top_genres,
    top_artists: formData.top_artists,
    top_songs: formData.top_songs,
    artist_images: formData.artist_images.map(img => img.url),
    song_images: formData.song_images.map(img => img.url),
  };

  console.log('[ProfilePreviewStep] Rendering preview.');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile Preview</Text>
        <Text style={styles.subtitle}>
          This is how your profile will appear to others
        </Text>
      </View>

      <ScrollView style={styles.previewContainer} showsVerticalScrollIndicator={false}>
        <ProfileCardB 
          profile={testProfile}
          profilePictureUrl={formData.profile_picture_url || undefined}
          topGenres={formData.top_genres.length > 0 ? formData.top_genres : undefined}
          topArtists={formData.top_artists.length > 0 ? formData.top_artists : undefined}
          topSongs={formData.top_songs.length > 0 ? formData.top_songs : undefined}
          concertsAttended={0} // Missing from formData - using default
          concertBudget={concertBudget}
          concertSeating={concertSeating}
          concertTransport={concertTransport}
        />
      </ScrollView>

      <View style={styles.satisfactionSection}>
        <Text style={styles.questionText}>Are you satisfied with your profile?</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.thumbsDownButton]}
            onPress={onNotSatisfied}
            activeOpacity={0.7}
          >
            <MaterialIcons name="thumb-down" size={32} color={COLORS.text.inverse} />
            <Text style={styles.buttonText}>No</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.thumbsUpButton]}
            onPress={onSatisfied}
            activeOpacity={0.7}
          >
            <MaterialIcons name="thumb-up" size={32} color={COLORS.text.inverse} />
            <Text style={styles.buttonText}>Yes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
  },
  previewContainer: {
    flex: 1,
  },
  satisfactionSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  questionText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    gap: SPACING.sm,
    minHeight: 56,
  },
  thumbsUpButton: {
    backgroundColor: COLORS.success,
  },
  thumbsDownButton: {
    backgroundColor: COLORS.error,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.inverse,
  },
});

