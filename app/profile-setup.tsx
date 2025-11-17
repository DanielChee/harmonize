/**
 * Profile Setup Flow
 * Multi-step onboarding flow for new users to complete their profile
 */

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { useUserStore } from '@store';
import { getSession } from '@services/supabase/auth';
import { getUserProfile, updateUserProfile } from '@services/supabase/user';
import { Button } from '@components/common/Button';
import { MaterialIcons } from '@expo/vector-icons';

// Import step components
import { BasicInfoStep } from '@features/profile-setup/BasicInfoStep';
import { MusicTasteStep } from '@features/profile-setup/MusicTasteStep';
import { ProfilePictureStep } from '@features/profile-setup/ProfilePictureStep';
import { ConcertPreferencesStep } from '@features/profile-setup/ConcertPreferencesStep';
import { UniversityVerificationStep } from '@features/profile-setup/UniversityVerificationStep';

type SetupStep = 1 | 2 | 3 | 4 | 5;

export default function ProfileSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentUser, setCurrentUser, session, setSession } = useUserStore();
  const [currentStep, setCurrentStep] = useState<SetupStep>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    display_name: '',
    city: '',
    age: 0,
    mbti: '',
    pronouns: '',
    bio: '',
    
    // Step 2: Music Taste
    top_genres: [] as string[],
    top_artists: [] as string[],
    top_songs: [] as string[],
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
    student_email: '',
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
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
          mbti: profile.mbti || '',
          pronouns: profile.pronouns || '',
          bio: profile.bio || '',
          top_genres: profile.top_genres || [],
          top_artists: profile.top_artists || [],
          top_songs: profile.top_songs || [],
          sprint_5_variant: profile.sprint_5_variant,
          profile_picture_url: profile.profile_picture_url || '',
          concert_budget: profile.concert_budget || '',
          concert_seating: profile.concert_seating || '',
          concert_transportation: profile.concert_transportation || '',
          university: profile.university || '',
          academic_field: profile.academic_field || '',
          academic_year: profile.academic_year || '',
          student_email: '',
        });
      }
    } catch (error) {
      console.error('[ProfileSetup] Error loading profile:', error);
      router.replace('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceedToNextStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(
          formData.display_name.trim() &&
          formData.city.trim() &&
          formData.age > 0 &&
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
      // No changes, just exit
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

    setIsSaving(true);
    try {
      const updates = {
        display_name: formData.display_name,
        city: formData.city,
        age: formData.age,
        mbti: formData.mbti || undefined,
        pronouns: formData.pronouns,
        bio: formData.bio,
        top_genres: formData.top_genres.length > 0 ? formData.top_genres : undefined,
        top_artists: formData.top_artists.length > 0 ? formData.top_artists : undefined,
        top_songs: formData.top_songs.length > 0 ? formData.top_songs : undefined,
        sprint_5_variant: formData.sprint_5_variant,
        profile_picture_url: formData.profile_picture_url,
        concert_budget: formData.concert_budget,
        concert_seating: formData.concert_seating,
        concert_transportation: formData.concert_transportation,
        university: formData.university || undefined,
        academic_field: formData.academic_field || undefined,
        academic_year: formData.academic_year || undefined,
        profile_complete: true,
      };

      await updateUserProfile(session.user.id, updates);
      
      // Update local state
      const updatedProfile = await getUserProfile(session.user.id);
      if (updatedProfile) {
        setCurrentUser(updatedProfile);
      }

      // Navigate to main app
      router.replace('/(tabs)/match');
    } catch (error) {
      console.error('[ProfileSetup] Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
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

