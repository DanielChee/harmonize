/**
 * A/B Test Store (Zustand)
 * Manages user's variant assignment and provides easy access
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TestVariant, UserVariantAssignment } from '@types';
import {
  getUserAssignment,
  assignVariant,
  trackProfileView,
  trackProfileDecision,
  resetABTestData,
  exportABTestData,
} from '@utils/abTestTracking';

interface ABTestStore {
  // State
  variant: TestVariant | null;
  assignment: UserVariantAssignment | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setVariant: (variant: TestVariant) => Promise<void>;
  initialize: (userId: string) => Promise<void>;
  getVariant: () => TestVariant | null;
  trackView: (
    profileId: string,
    profileType: 'positive' | 'neutral' | 'negative'
  ) => Promise<number>;
  trackDecision: (
    profileId: string,
    profileType: 'positive' | 'neutral' | 'negative',
    loadTime: number,
    decision: 'like' | 'pass' | 'block'
  ) => Promise<void>;
  resetData: () => Promise<void>;
  exportData: () => Promise<string>;
  refreshAssignment: () => Promise<void>;
}

export const useABTestStore = create<ABTestStore>((set, get) => ({
  // Initial state
  variant: null,
  assignment: null,
  isLoading: true,
  error: null,



  // Manually set variant (for testing/admin)
  setVariant: async (variant: TestVariant) => {
    set({ variant });
    // In a real app, we would persist this override
    // For now, we'll just update the local state and log it
    console.log(`[A/B Test] Variant manually set to ${variant}`);
  },

  // Initialize user's variant assignment
  initialize: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Check if variant is being forced from login screen
      const forceVariant = await AsyncStorage.getItem('@harmonize_force_variant');
      const shouldForceVariant = forceVariant === 'A' || forceVariant === 'B';

      // Get existing assignment
      let assignment = await getUserAssignment();

      // Check if existing assignment belongs to a different user
      if (assignment && assignment.userId !== userId) {
        console.log(`[A/B Test] User mismatch! Stored: ${assignment.userId}, Current: ${userId}. Creating new assignment...`);
        assignment = null; // Clear mismatched assignment
      }

      // If forcing a variant, check if we need to reassign
      if (shouldForceVariant && assignment) {
        if (assignment.assignedVariant !== forceVariant) {
          console.log(`[A/B Test] Force variant mismatch. Reassigning from ${assignment.assignedVariant} to ${forceVariant}...`);
          const newVariant = await assignVariant(userId);
          assignment = await getUserAssignment();
        } else {
          console.log(`[A/B Test] Using existing assignment with forced variant ${forceVariant}`);
        }
      } else if (!assignment) {
        // No existing assignment, create new one
        console.log('[A/B Test] No assignment found, creating new one...');
        const newVariant = await assignVariant(userId);
        assignment = await getUserAssignment();
      }

      if (assignment) {
        set({
          variant: assignment.assignedVariant,
          assignment,
          isLoading: false,
        });
        console.log('[A/B Test] Initialized with variant:', assignment.assignedVariant);
      } else {
        throw new Error('Failed to get assignment after creation');
      }
    } catch (error) {
      console.error('[A/B Test] Initialization error:', error);
      set({
        error: 'Failed to initialize A/B test',
        isLoading: false,
      });
    }
  },

  // Get current variant
  getVariant: () => {
    return get().variant;
  },

  // Track profile view
  trackView: async (profileId, profileType) => {
    const { variant } = get();
    if (!variant) {
      console.warn('[A/B Test] No variant assigned, skipping tracking');
      return Date.now();
    }

    return await trackProfileView(profileId, profileType, variant);
  },

  // Track profile decision
  trackDecision: async (profileId, profileType, loadTime, decision) => {
    const { variant } = get();
    if (!variant) {
      console.warn('[A/B Test] No variant assigned, skipping tracking');
      return;
    }

    await trackProfileDecision(profileId, profileType, variant, loadTime, decision);

    // Refresh assignment to get updated interactions
    await get().refreshAssignment();
  },

  // Reset all A/B test data
  resetData: async () => {
    await resetABTestData();
    set({
      variant: null,
      assignment: null,
      isLoading: false,
    });
    console.log('[A/B Test] Data reset complete');
  },

  // Export data as JSON
  exportData: async () => {
    return await exportABTestData();
  },

  // Refresh assignment from storage
  refreshAssignment: async () => {
    const assignment = await getUserAssignment();
    if (assignment) {
      set({ assignment });
    }
  },
}));
