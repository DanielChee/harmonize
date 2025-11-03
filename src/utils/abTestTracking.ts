/**
 * A/B Test Tracking Utility
 * Handles variant assignment and behavioral metrics collection
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ProfileInteractionMetrics,
  UserVariantAssignment,
  TestVariant,
  TestProfile,
} from '@types';
import { isDecisionCorrect } from './testProfiles';

const STORAGE_KEY = '@harmonize_ab_test';

/**
 * Get or create user's variant assignment
 */
export async function getUserAssignment(): Promise<UserVariantAssignment | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error getting user assignment:', error);
    return null;
  }
}

/**
 * Assign user to variant (A or B) - 50/50 random split
 */
export async function assignVariant(userId: string): Promise<TestVariant> {
  const variant: TestVariant = Math.random() < 0.5 ? 'A' : 'B';
  const assignment: UserVariantAssignment = {
    userId,
    assignedVariant: variant,
    assignedAt: Date.now(),
    testProfilesShown: [],
    interactions: [],
  };

  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assignment));
    console.log(`[A/B Test] User assigned to Variant ${variant}`);
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

    assignment.interactions.push(metrics);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assignment));

    console.log(`[A/B Test] Decision recorded:`, {
      profile: profileType,
      decision,
      timeSpent: timeSpentSeconds + 's',
      correct,
      variant: variantShown,
    });
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
