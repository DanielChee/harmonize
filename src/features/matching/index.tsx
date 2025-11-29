// src/features/matching/index.tsx
import { COLORS } from "@constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SecureStoreAdapter } from "../../lib/secureStore";
import { deleteAllMatchesForUser, upsertMatchForTestProfile } from '@services/supabase/matches';
import { useABTestStore, useUserStore } from "@store";
import type { TestProfile } from "@types";
import { responsiveSizes } from "@utils/responsive";
import { TEST_PROFILES } from "@utils/testProfiles";
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { ABTestProfileCard } from "../testing/ABTestProfileCard";
import styles from "./styles";

const MAX_LIKES_PER_DAY = 5;
// Key must be alphanumeric, ".", "-", or "_"
const STORAGE_KEY = "harmonize_daily_likes";

export default function MatchScreen() {

  // ------------------------------------------------------------
  // HOOKS (Fixed order, never conditional)
  // ------------------------------------------------------------
  const router = useRouter();
  const { initialize, trackDecision, isLoading } = useABTestStore();
  const { currentUser, session } = useUserStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [profileLoadTime, setProfileLoadTime] = useState<number>(0);
  const [isTesterMode, setIsTesterMode] = useState(true);

  const screenWidth = Dimensions.get("window").width;
  const slideAnim = useMemo(() => new Animated.Value(0), []);
  const scrollViewRef = useRef<ScrollView>(null);

  // ------------------------------------------------------------
  // EFFECT: Initialization (one time per login session)
  // ------------------------------------------------------------
  const [displayProfiles, setDisplayProfiles] = useState<TestProfile[]>(TEST_PROFILES);

  // ------------------------------------------------------------
  // EFFECT: Initialization (one time per login session)
  // ------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!session || !currentUser) {
        router.replace("/login");
        return;
      }

      const testerMode = await SecureStoreAdapter.getItem("harmonize_is_tester_mode");
      if (!cancelled) setIsTesterMode(testerMode === "true");

      // Fetch real profiles
      try {
        const { getPotentialMatches } = await import('@services/supabase/user');
        const realUsers = await getPotentialMatches(currentUser.id);
        
        console.log('[MatchScreen] Real users found:', realUsers.length);
        if (realUsers.length > 0) {
          console.log('[MatchScreen] First real user top_artists:', JSON.stringify(realUsers[0].top_artists));
          console.log('[MatchScreen] First real user artist_images:', JSON.stringify(realUsers[0].artist_images));
        }

        if (realUsers.length > 0) {
          // Map real users to TestProfile format
          const mappedProfiles: TestProfile[] = realUsers.map(user => ({
            id: user.id,
            name: user.display_name || user.username || 'Unknown',
            age: user.age || 21,
            bio: user.bio || 'No bio yet.',
            image: user.profile_picture_url || 'https://via.placeholder.com/400',
            profileType: 'neutral', // Default for real users
            top_artists: user.top_artists || [],
            top_genres: user.top_genres || [],
            top_songs: user.top_songs || [],
            artist_images: user.artist_images || [],
            song_images: user.song_images || [],
            // Default values for required TestProfile fields
            pronouns: user.pronouns || 'they/them',
            university: user.university || 'Unknown University',
            universityVerified: !!user.is_verified,
            concertsAttended: 0,
            accountAgeMonths: 0,
            mutualFriends: 0,
            reviewsTypeA: [],
            averageRatingTypeA: 0,
            badgesTypeB: {
              q1Badge: null,
              q2Badge: null,
              q3Badge: null,
              harmonies: { count: 0, total: 0 }
            },
            totalReviews: 0
          }));

          // Combine with mock profiles (shuffle or prepend)
          // For now, prepend real profiles so they show up first
          if (!cancelled) {
            setDisplayProfiles([...mappedProfiles, ...TEST_PROFILES]);
          }
        }
      } catch (error) {
        console.error('Error fetching real profiles:', error);
      }

      await initialize(currentUser.id);
      if (!cancelled) setProfileLoadTime(Date.now());
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [session, currentUser, initialize, router, setDisplayProfiles]);

  // ------------------------------------------------------------
  // EFFECT: Profile load time on index change
  // ------------------------------------------------------------
  useEffect(() => {
    setProfileLoadTime(Date.now());
    scrollViewRef.current?.scrollTo({ y: 0, animated: false }); // Reset scroll position
  }, [currentIndex]);

  // ------------------------------------------------------------
  // ANIMATION SLIDE HANDLER (stable callback)
  // ------------------------------------------------------------
  const slideToNext = useCallback(
    (direction: "left" | "right", callback: () => void) => {
      const toValue = direction === "left" ? -screenWidth : screenWidth;
      const resetValue = direction === "left" ? screenWidth : -screenWidth;

      Animated.timing(slideAnim, {
        toValue,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start(() => {
        callback();
        slideAnim.setValue(resetValue);

        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }).start();
      });
    },
    [screenWidth, slideAnim]
  );

  // ------------------------------------------------------------
  // NEXT PROFILE (safe)
  // ------------------------------------------------------------
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % displayProfiles.length);
  }, [displayProfiles.length]);

  // ------------------------------------------------------------
  // LIKE (creates real match)
  // ------------------------------------------------------------
  const handleLike = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const stored = await SecureStoreAdapter.getItem(STORAGE_KEY);
    let data = stored ? JSON.parse(stored) : { date: today, count: 0 };

    if (data.date !== today) data = { date: today, count: 0 };

    if (data.count >= MAX_LIKES_PER_DAY) {
      Alert.alert(
        "Daily Limit Reached",
        `You've used your ${MAX_LIKES_PER_DAY} likes for today as a free harmonize user.`
      );
      return;
    }

    const p: TestProfile = displayProfiles[currentIndex];

    await trackDecision(
      p.id,
      p.profileType ?? "neutral",
      profileLoadTime,
      "like"
    );

    if (currentUser?.id) {
      await upsertMatchForTestProfile({
        userId: currentUser.id,
        testProfileId: p.id,
        name: p.name,
        avatarUrl: p.image, // Use mapped image
        city: "",
        age: p.age,
        concertDate: "2025-12-15"
      });
    }

    data.count += 1;
    await SecureStoreAdapter.setItem(STORAGE_KEY, JSON.stringify(data));

    slideToNext("right", handleNext);
  }, [currentIndex, profileLoadTime, slideToNext, handleNext, currentUser, trackDecision, displayProfiles]);

  // ------------------------------------------------------------
  // PASS
  // ------------------------------------------------------------
  const handlePass = useCallback(async () => {
    const p = displayProfiles[currentIndex];

    await trackDecision(
      p.id,
      p.profileType ?? "neutral",
      profileLoadTime,
      "pass"
    );

    slideToNext("left", handleNext);
  }, [currentIndex, profileLoadTime, slideToNext, handleNext, trackDecision, displayProfiles]);

  // ------------------------------------------------------------
  // BLOCK
  // ------------------------------------------------------------
  const handleBlock = useCallback(async () => {
    const p = displayProfiles[currentIndex];

    await trackDecision(
      p.id,
      p.profileType ?? "neutral",
      profileLoadTime,
      "block"
    );

    slideToNext("left", handleNext);
  }, [currentIndex, profileLoadTime, slideToNext, handleNext, trackDecision, displayProfiles]);

  // ------------------------------------------------------------
  // RESET LIKES (tester only)
  // ------------------------------------------------------------
  const resetLikes = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Reset daily likes
      await SecureStoreAdapter.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));

      // Delete matches in Supabase
      if (currentUser?.id) {
        await deleteAllMatchesForUser(currentUser.id);
        console.log("[MatchScreen] All matches cleared for user:", currentUser.id);
      }

      Alert.alert("Success", "Daily likes and matches have been reset.");
    } catch (error) {
      Alert.alert("Error", "Failed to reset matches: " + error);
    }
  }, [currentUser]);


  // ------------------------------------------------------------
  // LOGOUT
  // ------------------------------------------------------------


  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.title}>Initializing A/B Test...</Text>
      </View>
    );
  }

  const currentProfile = displayProfiles[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {isTesterMode && (
          <TouchableOpacity onPress={resetLikes} style={styles.logoutButton}>
            <MaterialCommunityIcons name="refresh" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.cardContainer}>
        <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
          <ScrollView style={styles.cardScrollView} showsVerticalScrollIndicator={false} ref={scrollViewRef}>
            <ABTestProfileCard profile={currentProfile} />
          </ScrollView>
        </Animated.View>

        <View style={styles.floatingButtonsContainer}>
          <TouchableOpacity
            style={[styles.floatingActionButton, styles.passButton]}
            onPress={handlePass}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="close" size={responsiveSizes.icon.xlarge} color={COLORS.error} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.floatingActionButton, styles.blockButton]}
            onPress={handleBlock}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="cancel" size={responsiveSizes.icon.large} color={COLORS.text.inverse} />
          </TouchableOpacity>

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
