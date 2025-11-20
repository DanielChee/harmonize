// src/features/matching/index.tsx
import { COLORS } from "@constants";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteAllMatchesForUser, upsertMatchForTestProfile } from '@services/supabase/matches';
import { useABTestStore, useUserStore } from "@store";
import type { TestProfile } from "@types";
import { responsiveSizes } from "@utils/responsive";
import { TEST_PROFILES } from "@utils/testProfiles";
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
const STORAGE_KEY = "@harmonize_daily_likes";

export default function MatchScreen() {

  // ------------------------------------------------------------
  // HOOKS (Fixed order, never conditional)
  // ------------------------------------------------------------
  const router = useRouter();
  const { variant, initialize, trackDecision, isLoading } = useABTestStore();
  const { currentUser, session } = useUserStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [profileLoadTime, setProfileLoadTime] = useState<number>(0);
  const [isTesterMode, setIsTesterMode] = useState(true);

  const screenWidth = Dimensions.get("window").width;
  const slideAnim = useMemo(() => new Animated.Value(0), []);

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

      const testerMode = await AsyncStorage.getItem("@harmonize_is_tester_mode");
      if (!cancelled) setIsTesterMode(testerMode === "true");

      await initialize(currentUser.id);
      if (!cancelled) setProfileLoadTime(Date.now());
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [session, currentUser, initialize, router]);

  // ------------------------------------------------------------
  // EFFECT: Profile load time on index change
  // ------------------------------------------------------------
  useEffect(() => {
    setProfileLoadTime(Date.now());
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
    setCurrentIndex((prev) => (prev + 1) % TEST_PROFILES.length);
  }, []);

  // ------------------------------------------------------------
  // LIKE (creates real match)
  // ------------------------------------------------------------
  const handleLike = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    let data = stored ? JSON.parse(stored) : { date: today, count: 0 };

    if (data.date !== today) data = { date: today, count: 0 };

    if (data.count >= MAX_LIKES_PER_DAY) {
      Alert.alert(
        "Daily Limit Reached",
        `You've used your ${MAX_LIKES_PER_DAY} likes for today as a free harmonize user.`
      );
      return;
    }

    const p: TestProfile = TEST_PROFILES[currentIndex];

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
        avatarUrl: "",
        city: "",
        age: p.age,
        concertDate: "2025-12-15"
      });
    }

    data.count += 1;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));

    slideToNext("right", handleNext);
  }, [currentIndex, profileLoadTime, slideToNext, handleNext, currentUser, trackDecision]);

  // ------------------------------------------------------------
  // PASS
  // ------------------------------------------------------------
  const handlePass = useCallback(async () => {
    const p = TEST_PROFILES[currentIndex];

    await trackDecision(
      p.id,
      p.profileType ?? "neutral",
      profileLoadTime,
      "pass"
    );

    slideToNext("left", handleNext);
  }, [currentIndex, profileLoadTime, slideToNext, handleNext, trackDecision]);

  // ------------------------------------------------------------
  // BLOCK
  // ------------------------------------------------------------
  const handleBlock = useCallback(async () => {
    const p = TEST_PROFILES[currentIndex];

    await trackDecision(
      p.id,
      p.profileType ?? "neutral",
      profileLoadTime,
      "block"
    );

    slideToNext("left", handleNext);
  }, [currentIndex, profileLoadTime, slideToNext, handleNext, trackDecision]);

  // ------------------------------------------------------------
  // RESET LIKES (tester only)
  // ------------------------------------------------------------
  const resetLikes = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Reset daily likes
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 }));

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
  const handleLogout = useCallback(() => {
    Alert.alert(
      "Logout",
      "Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            const { signOut } = useUserStore.getState();
            await signOut();
            router.replace("/login");
          },
        },
      ]
    );
  }, [router]);

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

  const currentProfile = TEST_PROFILES[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileCounter}>
          <Text style={styles.counterText}>
            Profile {currentIndex + 1} / {TEST_PROFILES.length}
          </Text>

          {!isTesterMode && variant && (
            <Text style={[styles.counterText, { fontSize: 12, opacity: 0.6, marginTop: 4 }]}>
              Variant {variant}
            </Text>
          )}
        </View>

        {isTesterMode && (
          <TouchableOpacity onPress={resetLikes} style={styles.logoutButton}>
            <MaterialCommunityIcons name="refresh" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={24} color={COLORS.error} />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <Animated.View style={{ flex: 1, transform: [{ translateX: slideAnim }] }}>
          <ScrollView style={styles.cardScrollView} showsVerticalScrollIndicator={false}>
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
