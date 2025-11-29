/**
 * A/B Test Tracking Utility
 * Handles variant assignment and behavioral metrics collection
 * Syncs data to both AsyncStorage (local) and Supabase (cloud)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  ProfileInteractionMetrics,
  TestVariant,
  UserVariantAssignment,
} from '@types';

// Supabase sync enabled
import {
  getAssignmentFromSupabase,
  syncAssignment,
  syncInteraction,
} from './supabaseSync';

function isDecisionCorrect(
  profileType: 'positive' | 'neutral' | 'negative',
  decision: 'like' | 'pass' | 'block'
): boolean {
  if (profileType === 'positive') {
    return decision === 'like';
  }
  if (profileType === 'negative') {
    return decision === 'pass' || decision === 'block';
  }
  // For neutral profiles, any decision is considered valid/correct behavior
  return true;
}

const STORAGE_KEY = '@harmonize_ab_test';
const ENABLE_SUPABASE_SYNC = true;

/**
 * Get or create user's variant assignment
 */
export async function getUserAssignment(): Promise<UserVariantAssignment | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);

    return null;
  } catch (error) {
    console.error('Error getting user assignment:', error);
    return null;
  }
}

/**
 * Assign user to A/B variant
 */
export async function assignVariant(userId: string): Promise<TestVariant> {
  if (ENABLE_SUPABASE_SYNC) {
    const supabaseAssignment = await getAssignmentFromSupabase(userId);
    if (supabaseAssignment) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(supabaseAssignment));
      return supabaseAssignment.assignedVariant;
    }
  }

  let variant: TestVariant;

  try {
    const force = await AsyncStorage.getItem('@harmonize_force_variant');
    if (force === 'A' || force === 'B') {
      variant = force;
      console.log(`[A/B Test] Forcing Variant ${variant}`);
    } else {
      variant = Math.random() < 0.5 ? 'A' : 'B';
    }
  } catch {
    variant = Math.random() < 0.5 ? 'A' : 'B';
  }

  const assignment: UserVariantAssignment = {
    userId,
    assignedVariant: variant,
    assignedAt: Date.now(),
    testProfilesShown: [],
    interactions: [],
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assignment));

  if (ENABLE_SUPABASE_SYNC) {
    await syncAssignment(assignment);
  }

  return variant;
}

/**
 * Track profile view
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
 * Track decision (like/pass/block)
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

    console.log('[A/B Test] Decision recorded:', metrics);

    if (ENABLE_SUPABASE_SYNC) {
      await syncInteraction(assignment.userId, metrics);
    }
  } catch (error) {
    console.error('Error tracking decision:', error);
  }
}

/**
 * Get all interactions
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
 * Reset A/B test data
 */
export async function resetABTestData(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

/**
 * Export data
 */
export async function exportABTestData(): Promise<string> {
  try {
    const assignment = await getUserAssignment();
    return JSON.stringify(assignment, null, 2);
  } catch {
    return '{}';
  }
}

/**
 * Check if user has seen profile before
 */
export async function hasSeenProfile(profileId: string): Promise<boolean> {
  try {
    const assignment = await getUserAssignment();
    return assignment?.testProfilesShown.includes(profileId) ?? false;
  } catch {
    return false;
  }
}
