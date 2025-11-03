/**
 * A/B Test Store (Zustand)
 * Manages user's variant assignment and provides easy access
 */

import { create } from 'zustand';
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

  // Initialize user's variant assignment
  initialize: async (userId: string) => {
    try {
      set({ isLoading: true, error: null });

      // Get existing assignment or create new one
      let assignment = await getUserAssignment();

      if (!assignment) {
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
