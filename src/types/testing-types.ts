/**
 * Sprint 4 A/B Testing Type Definitions
 * Passive behavioral testing: Users naturally swipe on profiles
 * - Variant A sees Amazon-style reviews (text + stars)
 * - Variant B sees Badge system (visual badges)
 */

// Base profile (controlled variables - IDENTICAL across all test profiles)
export interface BaseProfile {
  age: number;
  university: string;
  universityVerified: boolean;
  concertsAttended: number;
  accountAgeMonths: number;
  mutualFriends: number;
  bio: string;
}

// Test profile type
export type ProfileType = 'positive' | 'neutral' | 'negative';

// Review Type A (Amazon-style - displayed as text)
export interface ReviewTypeA {
  type: 'A';
  stars: number; // 1-5
  comment: string;
  reviewerName: string;
  reviewerAvatar?: string;
  daysAgo: number;
}

// Badge tiers for Type B (displayed as visual tier-based badges like Khan Academy/Duolingo)
export interface BadgeDisplay {
  q1Badge: { emoji: string; name: string } | null; // Event quality (Platinum/Gold/Bronze or null)
  q2Badge: { emoji: string; name: string } | null; // Social (Platinum/Gold/Bronze or null)
  q3Badge: { emoji: string; name: string } | null; // Reliability (Platinum/Gold/Bronze or null)
  harmonies: { count: number; total: number }; // Harmony counter (number of harmonies earned)
}

// Complete test profile
export interface TestProfile extends BaseProfile {
  id: string;
  name: string;
  pronouns: string;
  profileType: ProfileType;

  // Type A data (text reviews)
  reviewsTypeA: ReviewTypeA[];
  averageRatingTypeA: number;

  // Type B data (badges)
  badgesTypeB: BadgeDisplay;
  totalReviews: number;

  // Music Data for Matching
  top_genres: string[];
  top_artists: string[];

}

// Test variant assignment (A or B)
export type TestVariant = 'A' | 'B';

// Behavioral metrics (passive tracking - no surveys)
export interface ProfileInteractionMetrics {
  // Profile info
  profileId: string;
  profileType: ProfileType;
  variantShown: TestVariant;

  // Timestamps
  profileLoadTime: number; // When profile appeared on screen
  decisionTime?: number; // When user made decision
  timeSpentSeconds?: number; // Total time viewing profile

  // User action
  decision?: 'like' | 'pass' | 'block' | 'skip'; // skip if timeout/no decision
  decisionCorrect?: boolean; // Matches expected behavior

  // Optional metadata
  deviceType?: string;
  sessionId?: string;
  timestamp: number;
}

// User's variant assignment (persisted in AsyncStorage)
export interface UserVariantAssignment {
  userId: string;
  assignedVariant: TestVariant;
  assignedAt: number;
  testProfilesShown: string[]; // IDs of test profiles already shown
  interactions: ProfileInteractionMetrics[]; // All recorded interactions
}

// Analytics summary
export interface ABTestAnalytics {
  variantA: {
    totalViews: number;
    totalDecisions: number;
    avgTimeSpent: number;
    likeRate: number;
    passRate: number;
    blockRate: number;
    accuracyRate: number; // % correct decisions
    byProfileType: {
      positive: { views: number; likes: number; avgTime: number };
      neutral: { views: number; likes: number; avgTime: number };
      negative: { views: number; blocks: number; avgTime: number };
    };
  };
  variantB: {
    totalViews: number;
    totalDecisions: number;
    avgTimeSpent: number;
    likeRate: number;
    passRate: number;
    blockRate: number;
    accuracyRate: number;
    byProfileType: {
      positive: { views: number; likes: number; avgTime: number };
      neutral: { views: number; likes: number; avgTime: number };
      negative: { views: number; blocks: number; avgTime: number };
    };
  };
  comparison: {
    timeSpentDifference: number; // A - B (positive means A takes longer)
    accuracyDifference: number; // A - B (positive means A more accurate)
    likeRateDifference: number;
  };
}
