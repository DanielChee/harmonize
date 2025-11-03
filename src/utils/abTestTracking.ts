/**
 * A/B Test Tracking Utility
 * Handles variant assignment and behavioral metrics collection
 * Syncs data to both AsyncStorage (local) and Supabase (cloud)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ProfileInteractionMetrics,
  UserVariantAssignment,
  TestVariant,
  TestProfile,
} from '@types';
import { isDecisionCorrect } from './testProfiles';
// Supabase sync temporarily disabled until client is configured
// import {
//   syncAssignment,
//   syncInteraction,
//   getAssignmentFromSupabase,
// } from './supabaseSync';

const STORAGE_KEY = '@harmonize_ab_test';
const ENABLE_SUPABASE_SYNC = false; // Disabled until Supabase is configured

/**
 * Get or create user's variant assignment
 * Checks AsyncStorage first, then Supabase
 */
export async function getUserAssignment(): Promise<UserVariantAssignment | null> {
  try {
    // Check local storage first
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // If not in local storage and Supabase sync is enabled, check Supabase
    if (ENABLE_SUPABASE_SYNC) {
      console.log('[A/B Test] No local assignment, checking Supabase...');
      // Note: We need userId to check Supabase, which we don't have here
      // This will be handled in the initialize flow
    }

    return null;
  } catch (error) {
    console.error('Error getting user assignment:', error);
    return null;
  }
}

/**
 * Assign user to variant (A or B) - 50/50 random split or forced
 * Syncs to both AsyncStorage and Supabase
 */
export async function assignVariant(userId: string): Promise<TestVariant> {
  // Check if user already has assignment in Supabase
  // Temporarily disabled until Supabase is configured
  // if (ENABLE_SUPABASE_SYNC) {
  //   const supabaseAssignment = await getAssignmentFromSupabase(userId);
  //   if (supabaseAssignment) {
  //     console.log(
  //       `[A/B Test] User found in Supabase with Variant ${supabaseAssignment.assignedVariant}`
  //     );
  //     // Store locally
  //     await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(supabaseAssignment));
  //     return supabaseAssignment.assignedVariant;
  //   }
  // }

  // Check if variant is forced from login screen
  let variant: TestVariant;
  try {
    const forceVariant = await AsyncStorage.getItem('@harmonize_force_variant');
    if (forceVariant === 'A' || forceVariant === 'B') {
      variant = forceVariant;
      console.log(`[A/B Test] Forcing Variant ${variant} (from login)`);
    } else {
      // Random assignment
      variant = Math.random() < 0.5 ? 'A' : 'B';
      console.log(`[A/B Test] Random assignment to Variant ${variant}`);
    }
  } catch (error) {
    // Fallback to random if error
    variant = Math.random() < 0.5 ? 'A' : 'B';
  }

  const assignment: UserVariantAssignment = {
    userId,
    assignedVariant: variant,
    assignedAt: Date.now(),
    testProfilesShown: [],
    interactions: [],
  };

  try {
    // Save to AsyncStorage
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assignment));
    console.log(`[A/B Test] User assigned to Variant ${variant}`);

    // Sync to Supabase - temporarily disabled
    // if (ENABLE_SUPABASE_SYNC) {
    //   await syncAssignment(assignment);
    // }
  } catch (error) {
    console.error('Error assigning variant:', error);
  }

  return variant;
}

/**
 * Record when user starts viewing a profile
 */
export async function trackProfileView(
  profileId: string,
  profileType: 'positive' | 'neutral' | 'negative',
  variantShown: TestVariant
): Promise<number> {
  const loadTime = Date.now();

  try {
    const assignment = await getUserAssignment();
    if (!assignment) return loadTime;

    // Mark this profile as shown
    if (!assignment.testProfilesShown.includes(profileId)) {
      assignment.testProfilesShown.push(profileId);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assignment));
    }
  } catch (error) {
    console.error('Error tracking profile view:', error);
  }

  return loadTime;
}

/**
 * Record user's decision on a profile
 * Syncs to both AsyncStorage and Supabase
 */
export async function trackProfileDecision(
  profileId: string,
  profileType: 'positive' | 'neutral' | 'negative',
  variantShown: TestVariant,
  profileLoadTime: number,
  decision: 'like' | 'pass' | 'block'
): Promise<void> {
  const decisionTime = Date.now();
  const timeSpentSeconds = Math.round((decisionTime - profileLoadTime) / 1000);
  const correct = isDecisionCorrect(profileType, decision);

  const metrics: ProfileInteractionMetrics = {
    profileId,
    profileType,
    variantShown,
    profileLoadTime,
    decisionTime,
    timeSpentSeconds,
    decision,
    decisionCorrect: correct,
    timestamp: Date.now(),
  };

  try {
    const assignment = await getUserAssignment();
    if (!assignment) return;

    // Save to AsyncStorage
    assignment.interactions.push(metrics);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assignment));

    console.log(`[A/B Test] Decision recorded:`, {
      profile: profileType,
      decision,
      timeSpent: timeSpentSeconds + 's',
      correct,
      variant: variantShown,
    });

    // Sync to Supabase - temporarily disabled
    // if (ENABLE_SUPABASE_SYNC) {
    //   await syncInteraction(assignment.userId, metrics);
    // }
  } catch (error) {
    console.error('Error tracking decision:', error);
  }
}

/**
 * Get all interactions for analytics
 */
export async function getAllInteractions(): Promise<ProfileInteractionMetrics[]> {
  try {
    const assignment = await getUserAssignment();
    return assignment?.interactions || [];
  } catch (error) {
    console.error('Error getting interactions:', error);
    return [];
  }
}

/**
 * Reset A/B test data (for testing purposes)
 */
export async function resetABTestData(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    console.log('[A/B Test] Data reset');
  } catch (error) {
    console.error('Error resetting AB test data:', error);
  }
}

/**
 * Export data as JSON string
 */
export async function exportABTestData(): Promise<string> {
  try {
    const assignment = await getUserAssignment();
    return JSON.stringify(assignment, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    return '{}';
  }
}

/**
 * Check if user has seen a profile before
 */
export async function hasSeenProfile(profileId: string): Promise<boolean> {
  try {
    const assignment = await getUserAssignment();
    return assignment?.testProfilesShown.includes(profileId) || false;
  } catch (error) {
    console.error('Error checking seen profile:', error);
    return false;
  }
}
