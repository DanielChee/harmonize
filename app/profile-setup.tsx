/**
 * Profile Setup Flow
 * Multi-step onboarding flow for new users to complete their profile
 */

import { Button } from '@components/common/Button';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import { getSession } from '@services/supabase/auth';
import { getUserProfile, updateUserProfile } from '@services/supabase/user';
import { useUserStore } from '@store';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import step components
import { BasicInfoStep } from '@features/profile-setup/BasicInfoStep';
import { ConcertPreferencesStep } from '@features/profile-setup/ConcertPreferencesStep';
import { MusicTasteStep } from '@features/profile-setup/MusicTasteStep';
import { ProfilePictureStep } from '@features/profile-setup/ProfilePictureStep';
import { ProfilePreviewStep } from '@features/profile-setup/ProfilePreviewStep';
import { UniversityVerificationStep } from '@features/profile-setup/UniversityVerificationStep';

type SetupStep = 1 | 2 | 3 | 4 | 5;

export default function ProfileSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, setCurrentUser, session, setSession } = useUserStore();
  const [currentStep, setCurrentStep] = useState<SetupStep>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    display_name: '',
    city: '',
    age: 0,
    phone_number: '',
    mbti: '',
    pronouns: '',
    bio: '',

    // Step 2: Music Taste
    top_genres: [] as string[],
    top_artists: [] as string[],
    top_songs: [] as string[],
    artist_images: [] as { name: string; url: string }[],
    song_images: [] as { name: string; url: string }[],
    sprint_5_variant: undefined as 'variant_a' | 'variant_b' | undefined,

    // Step 3: Profile Picture
    profile_picture_url: '',

    // Step 4: Concert Preferences
    concert_budget: '',
    concert_seating: '',
    concert_transportation: '',

    // Step 5: University (optional)
    university: '',
    academic_field: '',
    academic_year: '',
  });

  console.log('Current Step:', currentStep);
  console.log('Current Form Data:', JSON.stringify(formData, null, 2));

  // Track timing for profile creation
  const profileCreationStartTime = useRef<number | null>(null);

  // Track last field that was updated
  const lastFieldUpdated = useRef<string | null>(null);

  const loadUserProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const userSession = session || await getSession();

      if (!userSession?.user) {
        router.replace('/login');
        return;
      }

      setSession(userSession);
      const profile = await getUserProfile(userSession.user.id);

      if (profile) {
        setCurrentUser(profile);
        // Pre-fill form with existing data
        setFormData({
          display_name: profile.display_name || '',
          city: profile.city || '',
          age: profile.age || 0,
          phone_number: profile.phone || '',
          mbti: profile.mbti || '',
          pronouns: profile.pronouns || '',
          bio: profile.bio || '',
          top_genres: profile.top_genres || [],
          top_artists: profile.top_artists || [],
          top_songs: profile.top_songs || [],
          artist_images: (profile.top_artists && profile.artist_images)
            ? profile.top_artists.map((name, i) => ({
                name,
                url: profile.artist_images![i] || ''
              }))
            : [],
          song_images: (profile.top_songs && profile.song_images)
            ? profile.top_songs.map((name, i) => ({
                name,
                url: profile.song_images![i] || ''
              }))
            : [],
          sprint_5_variant: profile.sprint_5_variant,
          profile_picture_url: profile.profile_picture_url || '',
          concert_budget: profile.concert_budget || '',
          concert_seating: profile.concert_seating || '',
          concert_transportation: profile.concert_transportation || '',
          university: '',
          academic_field: '',
          academic_year: '',
        });
      }
    } catch (error) {
      console.error('[ProfileSetup] Error loading profile:', error);
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router, session, setSession, setCurrentUser]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Start timing on first field interaction
  const startTimingIfNeeded = useCallback(() => {
    if (profileCreationStartTime.current === null) {
      profileCreationStartTime.current = Date.now();
      console.log('[ProfileSetup] Timing started - profile creation timer began');
    }
  }, []);

  const updateFormData = useCallback((updates: Partial<typeof formData>) => {
    // Start timing on first field interaction
    startTimingIfNeeded();

    // Track the last field that was updated
    // Filter out metadata fields like sprint_5_variant that are updated alongside other fields
    const fieldKeys = Object.keys(updates).filter(key => key !== 'sprint_5_variant');
    if (fieldKeys.length > 0) {
      // Get the first key (primary field being updated)
      // When multiple fields update, the first is usually the main one
      lastFieldUpdated.current = fieldKeys[0];
    }

    setFormData(prev => ({ ...prev, ...updates }));
  }, [startTimingIfNeeded]);

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.display_name.trim() &&
          formData.city.trim() &&
          formData.age > 0 &&
          formData.phone_number.trim() &&
          formData.pronouns.trim() &&
          formData.bio.trim()
        );
      case 2:
        // Music taste is optional but encourage at least one selection
        return true;
      case 3:
        return !!formData.profile_picture_url.trim();
      case 4:
        return !!(
          formData.concert_budget &&
          formData.concert_seating &&
          formData.concert_transportation
        );
      case 5:
        // Step 5 (University) is optional, can always proceed
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as SetupStep);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as SetupStep);
    }
  };

  // Helper function to count filled fields
  const countFilledFields = (): number => {
    let count = 0;

    // Step 1: Basic Info
    if (formData.display_name.trim()) count++;
    if (formData.city.trim()) count++;
    if (formData.age > 0) count++;
    if (formData.mbti.trim()) count++;
    if (formData.pronouns.trim()) count++;
    if (formData.bio.trim()) count++;

    // Step 2: Music Taste
    if (formData.top_genres.length > 0) count++;
    if (formData.top_artists.length > 0) count++;
    if (formData.top_songs.length > 0) count++;

    // Step 3: Profile Picture
    if (formData.profile_picture_url.trim()) count++;

    // Step 4: Concert Preferences
    if (formData.concert_budget.trim()) count++;
    if (formData.concert_seating.trim()) count++;
    if (formData.concert_transportation.trim()) count++;

    // Step 5: University (optional)
    if (formData.university.trim()) count++;
    if (formData.academic_field.trim()) count++;
    if (formData.academic_year.trim()) count++;

    return count;
  };

  // Helper function to get human-readable field name
  const getFieldName = (fieldKey: string): string => {
    const fieldNames: Record<string, string> = {
      display_name: 'Display Name',
      city: 'City',
      age: 'Age',
      mbti: 'MBTI Type',
      pronouns: 'Pronouns',
      bio: 'Bio',
      top_genres: 'Top Genres',
      top_artists: 'Top Artists',
      top_songs: 'Top Songs',
      profile_picture_url: 'Profile Picture',
      concert_budget: 'Concert Budget',
      concert_seating: 'Concert Seating',
      concert_transportation: 'Concert Transportation',
      university: 'University',
      academic_field: 'Academic Field',
      academic_year: 'Academic Year',
    };
    return fieldNames[fieldKey] || fieldKey;
  };

  // Helper function to log exit information
  const logExitInfo = () => {
    const stepTitle = getStepTitle();
    const filledFieldsCount = countFilledFields();
    const lastField = lastFieldUpdated.current
      ? getFieldName(lastFieldUpdated.current)
      : 'None';

    // Calculate time spent if timing was started
    let timeSpentMessage = 'N/A (no field interactions)';
    if (profileCreationStartTime.current !== null) {
      const endTime = Date.now();
      const elapsedTime = endTime - profileCreationStartTime.current;
      const elapsedSeconds = (elapsedTime / 1000).toFixed(2);
      const elapsedMinutes = Math.floor(elapsedTime / 60000);
      const remainingSeconds = ((elapsedTime % 60000) / 1000).toFixed(2);

      if (elapsedMinutes > 0) {
        timeSpentMessage = `${elapsedMinutes} minute(s) and ${remainingSeconds} seconds (${elapsedTime}ms total)`;
      } else {
        timeSpentMessage = `${elapsedSeconds} seconds (${elapsedTime}ms total)`;
      }
    }

    console.log('[ProfileSetup] User exited profile setup:');
    console.log(`  - Step quit at: Step ${currentStep} (${stepTitle})`);
    console.log(`  - Last field filled: ${lastField}`);
    console.log(`  - Total fields filled: ${filledFieldsCount}`);
    console.log(`  - Time spent: ${timeSpentMessage}`);
  };

  const handleExit = () => {
    // Check if user has made any changes
    const hasChanges =
      formData.display_name ||
      formData.city ||
      formData.age > 0 ||
      formData.mbti ||
      formData.pronouns ||
      formData.bio ||
      formData.top_genres.length > 0 ||
      formData.top_artists.length > 0 ||
      formData.top_songs.length > 0 ||
      formData.profile_picture_url ||
      formData.concert_budget ||
      formData.concert_seating ||
      formData.concert_transportation ||
      formData.university ||
      formData.academic_field ||
      formData.academic_year;

    if (hasChanges) {
      Alert.alert(
        'Exit Profile Setup?',
        'You have unsaved changes. Are you sure you want to exit?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => {
              // Log exit information after user confirms
              logExitInfo();

              // Navigate back to profile page
              if (currentUser?.profile_complete) {
                router.replace('/(tabs)/profile');
              } else {
                // If profile incomplete, go to match screen (will redirect to setup if needed)
                router.replace('/(tabs)/match');
              }
            },
          },
        ]
      );
    } else {
      // No changes, just exit - log and navigate
      logExitInfo();

      if (currentUser?.profile_complete) {
        router.replace('/(tabs)/profile');
      } else {
        router.replace('/(tabs)/match');
      }
    }
  };

  const handleComplete = async () => {
    if (!session?.user) {
      router.replace('/login');
      return;
    }

    // Calculate and log the time spent on profile creation
    if (profileCreationStartTime.current !== null) {
      const endTime = Date.now();
      const elapsedTime = endTime - profileCreationStartTime.current;
      const elapsedSeconds = (elapsedTime / 1000).toFixed(2);
      const elapsedMinutes = Math.floor(elapsedTime / 60000);
      const remainingSeconds = ((elapsedTime % 60000) / 1000).toFixed(2);

      if (elapsedMinutes > 0) {
        console.log(`[ProfileSetup] Time spent on profile creation: ${elapsedMinutes} minute(s) and ${remainingSeconds} seconds (${elapsedTime}ms total)`);
      } else {
        console.log(`[ProfileSetup] Time spent on profile creation: ${elapsedSeconds} seconds (${elapsedTime}ms total)`);
      }
    }

    // Log number of fields filled
    const filledFieldsCount = countFilledFields();
    console.log(`[ProfileSetup] Total fields filled: ${filledFieldsCount}`);

    setIsSaving(true);
    try {
      // Clean up data - convert empty strings to undefined for optional fields only
      const cleanOptionalValue = (value: string | undefined | null): string | undefined => {
        if (value === null || value === undefined) return undefined;
        if (typeof value === 'string' && value.trim() === '') return undefined;
        return value;
      };

      const updates = {
        display_name: formData.display_name.trim(),
        city: formData.city.trim(),
        age: formData.age,
        phone: formData.phone_number.trim(), // Map form phone_number to DB phone column
        mbti: cleanOptionalValue(formData.mbti),
        pronouns: formData.pronouns.trim(),
        bio: formData.bio.trim(),
        top_genres: formData.top_genres.length > 0 ? formData.top_genres : undefined,
        top_artists: formData.top_artists.length > 0 ? formData.top_artists : undefined,
        top_songs: formData.top_songs.length > 0 ? formData.top_songs : undefined,
        artist_images: formData.artist_images.length > 0 ? formData.artist_images.map(img => img.url) : undefined,
        song_images: formData.song_images.length > 0 ? formData.song_images.map(img => img.url) : undefined,
        sprint_5_variant: formData.sprint_5_variant,
        profile_picture_url: cleanOptionalValue(formData.profile_picture_url),
        concert_budget: cleanOptionalValue(formData.concert_budget),
        concert_seating: cleanOptionalValue(formData.concert_seating),
        concert_transportation: cleanOptionalValue(formData.concert_transportation),
        university: cleanOptionalValue(formData.university),
        academic_field: cleanOptionalValue(formData.academic_field),
        academic_year: cleanOptionalValue(formData.academic_year),
        profile_complete: true,
      };

      // Save to database
      await updateUserProfile(session.user.id, updates);

      // Update local state with fresh data from database
      const updatedProfile = await getUserProfile(session.user.id);
      if (updatedProfile) {
        setCurrentUser(updatedProfile);
      }

      // Show preview after successful save
      console.log('[ProfileSetup] Profile saved successfully to database');
      setIsSaving(false);
      setShowPreview(true);
    } catch (error) {
      console.error('[ProfileSetup] Error saving profile:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[ProfileSetup] Error details:', {
        message: errorMessage,
        error,
      });

      // Handle foreign key constraint violation (User deleted from Auth but session persists)
      if (errorMessage.includes('foreign key constraint') || errorMessage.includes('profiles_id_fkey')) {
        Alert.alert(
          'Session Expired',
          'Your session is no longer valid. Please log in again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                const { signOut } = useUserStore.getState();
                await signOut();
                router.replace('/login');
              }
            }
          ]
        );
        setIsSaving(false);
        return;
      }

      Alert.alert('Save Failed', `Failed to save profile: ${errorMessage}. Please try again.`);
      setIsSaving(false);
    }
  };

  const handleSatisfied = () => {
    console.log('[ProfileSetup] User satisfied with profile preview');
    // Navigate to main app
    router.replace('/(tabs)/match');
  };

  const handleNotSatisfied = () => {
    console.log('[ProfileSetup] User not satisfied with profile preview');
    // Navigate back to profile setup to allow editing
    // Reset to first step or let them navigate
    setShowPreview(false);
    setCurrentStep(1);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Basic Information';
      case 2:
        return 'Music Taste';
      case 3:
        return 'Profile Picture';
      case 4:
        return 'Concert Preferences';
      case 5:
        return 'University Verification (Optional)';
      default:
        return 'Profile Setup';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Show preview after completion
  if (showPreview) {
    return (
      <ProfilePreviewStep
        formData={formData}
        onSatisfied={handleSatisfied}
        onNotSatisfied={handleNotSatisfied}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + SPACING.xl }]}>
        {/* Exit Button */}
        <TouchableOpacity
          style={styles.exitButton}
          onPress={handleExit}
          disabled={isSaving}
        >
          <MaterialIcons name="close" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>

        {/* Content Container */}
        <View style={styles.headerContent}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${(currentStep / 5) * 100}%` }]} />
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              Step {currentStep} of 5
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{getStepTitle()}</Text>
        </View>

        {/* Spacer to balance the exit button */}
        <View style={styles.exitButtonSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {currentStep === 1 && (
          <BasicInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onFieldInteraction={startTimingIfNeeded}
          />
        )}
        {currentStep === 2 && (
          <MusicTasteStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )}
        {currentStep === 3 && (
          <ProfilePictureStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )}
        {currentStep === 4 && (
          <ConcertPreferencesStep
            formData={formData}
            updateFormData={updateFormData}
          />
        )}
        {currentStep === 5 && (
          <UniversityVerificationStep
            formData={formData}
            updateFormData={updateFormData}
            isVerified={currentUser?.is_verified}
          />
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.footer}>
        {currentStep > 1 && (
          <Button
            title="Back"
            variant="outlined"
            onPress={handleBack}
            disabled={isSaving}
            style={styles.backButton}
          />
        )}
        <Button
          title={currentStep === 5 ? 'Complete Profile' : 'Next'}
          onPress={handleNext}
          disabled={!canProceedToNextStep() || isSaving}
          loading={isSaving}
          fullWidth={currentStep === 1}
          style={currentStep === 1 ? styles.nextButtonFullWidth : styles.nextButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  exitButton: {
    padding: SPACING.xs,
  },
  headerContent: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  exitButtonSpacer: {
    width: 40, // Same width as exit button to balance layout
  },
  progressContainer: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginBottom: SPACING.md,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  stepIndicator: {
    marginBottom: SPACING.xs,
  },
  stepText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['2xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  nextButtonFullWidth: {
    flex: 1,
  },
});

