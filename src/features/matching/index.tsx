import { COLORS } from "@constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useABTestStore } from "@store";
import type { TestProfile } from "@types";
import { TEST_PROFILES } from "@utils/testProfiles";
import { responsiveSizes } from "@utils/responsive";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ABTestProfileCard } from "../testing/ABTestProfileCard";
import styles from "./styles";

export default function MatchScreen() {
  const router = useRouter();
  const { variant, initialize, trackDecision, isLoading } = useABTestStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profileLoadTime, setProfileLoadTime] = useState<number>(0);
  const [isTesterMode, setIsTesterMode] = useState(false);

  // Initialize A/B test on mount
  useEffect(() => {
    const initializeABTest = async () => {
      try {
        // Get participant ID from storage
        const participantId = await AsyncStorage.getItem('@harmonize_participant_id');
        const testerMode = await AsyncStorage.getItem('@harmonize_is_tester_mode');

        // If no participant ID, redirect to login
        if (!participantId) {
          console.log('[Match] No participant ID found, redirecting to login');
          router.replace('/login');
          return;
        }

        setIsTesterMode(testerMode === 'true');
        console.log('[Match] Initializing A/B test for participant:', participantId);
        await initialize(participantId);
        setProfileLoadTime(Date.now());
      } catch (error) {
        console.error('[Match] Error initializing A/B test:', error);
      }
    };

    initializeABTest();
  }, []);

  // Track load time when profile changes
  useEffect(() => {
    setProfileLoadTime(Date.now());
  }, [currentIndex]);

  const totalProfiles = TEST_PROFILES.length;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % totalProfiles);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + totalProfiles) % totalProfiles);
  };

  const handleLike = async () => {
    const currentProfile = TEST_PROFILES[currentIndex];
    if (currentProfile) {
      // Track decision
      await trackDecision(
        currentProfile.id,
        currentProfile.profileType,
        profileLoadTime,
        'like'
      );
      console.log('Liked profile:', currentProfile.name, '(', currentProfile.profileType, ')');
    }
    // Move to next profile
    handleNext();
  };

  const handlePass = async () => {
    const currentProfile = TEST_PROFILES[currentIndex];
    if (currentProfile) {
      // Track decision
      await trackDecision(
        currentProfile.id,
        currentProfile.profileType,
        profileLoadTime,
        'pass'
      );
      console.log('Passed profile:', currentProfile.name, '(', currentProfile.profileType, ')');
    }
    // Move to next profile
    handleNext();
  };

  const handleBlock = async () => {
    const currentProfile = TEST_PROFILES[currentIndex];
    if (currentProfile) {
      // Track decision
      await trackDecision(
        currentProfile.id,
        currentProfile.profileType,
        profileLoadTime,
        'block'
      );
      console.log('Blocked profile:', currentProfile.name, '(', currentProfile.profileType, ')');
    }
    // Move to next profile
    handleNext();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout? Your test data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              // Only clear login status, preserve test data
              await AsyncStorage.multiRemove([
                '@harmonize_participant_id',
                '@harmonize_is_tester_mode',
                '@harmonize_has_logged_in',
              ]);
              console.log('[Match] User logged out');
              router.replace('/login');
            } catch (error) {
              console.error('[Match] Error logging out:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  // Get current test profile
  const currentProfile: TestProfile | null = TEST_PROFILES[currentIndex] || null;

  // Show loading state while A/B test initializes
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.title}>Initializing A/B Test...</Text>
      </View>
    );
  }

  if (!currentProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No profiles available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with profile counter, variant indicator, and logout */}
      <View style={styles.header}>
        <View style={styles.profileCounter}>
          <Text style={styles.counterText}>
            Profile {currentIndex + 1} / {totalProfiles}
          </Text>
          {/* Only show variant info in dev mode */}
          {!isTesterMode && variant && (
            <Text style={[styles.counterText, { fontSize: 12, opacity: 0.6 }]}>
              (Variant {variant})
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      {/* A/B Test Profile Card - scrollable */}
      <View style={styles.cardContainer}>
        <ScrollView style={styles.cardScrollView} showsVerticalScrollIndicator={false}>
          <ABTestProfileCard profile={currentProfile} />
        </ScrollView>

        {/* Floating Action Buttons Overlay */}
        <View style={styles.floatingButtonsContainer}>
          {/* Pass Button - Bottom Left */}
          <TouchableOpacity
            style={[styles.floatingActionButton, styles.passButton]}
            onPress={handlePass}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close" size={responsiveSizes.icon.xlarge} color={COLORS.error} />
          </TouchableOpacity>

          {/* Block Button - Bottom Center */}
          <TouchableOpacity
            style={[styles.floatingActionButton, styles.blockButton]}
            onPress={handleBlock}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="cancel" size={responsiveSizes.icon.large} color={COLORS.text.inverse} />
          </TouchableOpacity>

          {/* Like Button - Bottom Right */}
          <TouchableOpacity
            style={[styles.floatingActionButton, styles.likeButton]}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="heart" size={responsiveSizes.icon.xlarge} color={COLORS.success} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
