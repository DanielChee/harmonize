/**
 * Sprint 4 A/B Testing - Test Profile Data
 *
 * Controlled experiment: ALL profiles share identical base attributes.
 * ONLY difference is review quality (positive/neutral/negative).
 */

import type {
  BaseProfile,
  TestProfile,
  ReviewTypeA,
  BadgeDisplay,
} from '@types';

// ============================================
// BASE PROFILE (Controlled Variables)
// ============================================
// ALL test profiles share these IDENTICAL attributes
// to isolate the effect of review quality
export const BASE_PROFILE: BaseProfile = {
  age: 22,
  university: 'Georgia Tech',
  universityVerified: true,
  concertsAttended: 8,
  accountAgeMonths: 6,
  mutualFriends: 0,
  bio: 'Love live music! Always looking for concert buddies 🎶',
};

// ============================================
// POSITIVE PROFILE (High Trust)
// ============================================

const POSITIVE_REVIEWS_A: ReviewTypeA[] = [
  {
    type: 'A',
    stars: 5,
    comment: 'Jordan was super chill and we had a great time!',
    reviewerName: 'Sarah K.',
    daysAgo: 2,
  },
  {
    type: 'A',
    stars: 5,
    comment: 'Reliable buddy, showed up on time and had extra tickets ready. Very organized!',
    reviewerName: 'Mike L.',
    daysAgo: 5,
  },
  {
    type: 'A',
    stars: 5,
    comment: 'Good vibes, would definitely go to another show together!',
    reviewerName: 'Alex P.',
    daysAgo: 7,
  },
  {
    type: 'A',
    stars: 4,
    comment: 'Met at Terminal West, really fun night. Would meet up again.',
    reviewerName: 'Jamie R.',
    daysAgo: 12,
  },
  {
    type: 'A',
    stars: 4,
    comment: 'Cool person, we didn\'t click musically but still enjoyable.',
    reviewerName: 'Taylor M.',
    daysAgo: 18,
  },
  {
    type: 'A',
    stars: 5,
    comment: 'Solid concert buddy, no complaints. Very chill!',
    reviewerName: 'Chris D.',
    daysAgo: 21,
  },
  {
    type: 'A',
    stars: 5,
    comment: 'Jordan introduced me to some new artists, awesome experience!',
    reviewerName: 'Morgan F.',
    daysAgo: 28,
  },
  {
    type: 'A',
    stars: 4,
    comment: 'Had a blast at the festival together!',
    reviewerName: 'Riley B.',
    daysAgo: 35,
  },
];

const POSITIVE_BADGES_B: BadgeDisplay = {
  q1Badge: { emoji: '🏆', name: 'Platinum', score: 4.7 },
  q2Badge: { emoji: '🎉', name: 'Crowd Favorite', score: 4.6 },
  q3Badge: { emoji: '🪨', name: 'Rock Solid', score: 4.8 },
  harmonies: { count: 7, total: 8 },
};

export const POSITIVE_PROFILE: TestProfile = {
  ...BASE_PROFILE,
  id: 'test-positive',
  name: 'Jordan Miller',
  pronouns: 'he/him',
  profileType: 'positive',
  reviewsTypeA: POSITIVE_REVIEWS_A,
  averageRatingTypeA: 4.6,
  badgesTypeB: POSITIVE_BADGES_B,
  totalReviews: 8,
};

// ============================================
// NEUTRAL PROFILE (Moderate Trust)
// ============================================

const NEUTRAL_REVIEWS_A: ReviewTypeA[] = [
  {
    type: 'A',
    stars: 4,
    comment: 'First concert together, everything went smoothly.',
    reviewerName: 'Jordan K.',
    daysAgo: 8,
  },
  {
    type: 'A',
    stars: 3,
    comment: 'Nice person, kind of quiet. Fine experience overall.',
    reviewerName: 'Casey M.',
    daysAgo: 14,
  },
];

const NEUTRAL_BADGES_B: BadgeDisplay = {
  q1Badge: { emoji: '🥇', name: 'Gold', score: 3.5 },
  q2Badge: { emoji: '✨', name: 'Good Vibes', score: 3.5 },
  q3Badge: { emoji: '✅', name: 'Dependable', score: 3.5 },
  harmonies: { count: 1, total: 2 },
};

export const NEUTRAL_PROFILE: TestProfile = {
  ...BASE_PROFILE,
  id: 'test-neutral',
  name: 'Sam Taylor',
  pronouns: 'they/them',
  profileType: 'neutral',
  reviewsTypeA: NEUTRAL_REVIEWS_A,
  averageRatingTypeA: 3.5,
  badgesTypeB: NEUTRAL_BADGES_B,
  totalReviews: 2,
};

// ============================================
// NEGATIVE PROFILE (Low Trust)
// ============================================

const NEGATIVE_REVIEWS_A: ReviewTypeA[] = [
  {
    type: 'A',
    stars: 2,
    comment: 'Showed up 30 minutes late with no apology or heads up.',
    reviewerName: 'Sam J.',
    daysAgo: 5,
  },
  {
    type: 'A',
    stars: 1,
    comment: 'Flaked last minute on tickets, had to scramble to find new ones.',
    reviewerName: 'Alex T.',
    daysAgo: 12,
  },
  {
    type: 'A',
    stars: 2,
    comment: 'Really pushy about going to after-party when I said I was tired. Uncomfortable.',
    reviewerName: 'Morgan P.',
    daysAgo: 18,
  },
  {
    type: 'A',
    stars: 2,
    comment: 'Spent the whole show on their phone instead of watching the band.',
    reviewerName: 'Riley K.',
    daysAgo: 25,
  },
  {
    type: 'A',
    stars: 2,
    comment: 'Seemed nice at first but kept asking to borrow money?',
    reviewerName: 'Jordan L.',
    daysAgo: 32,
  },
  {
    type: 'A',
    stars: 2,
    comment: 'Not a good experience overall. Wouldn\'t recommend meeting up.',
    reviewerName: 'Casey R.',
    daysAgo: 40,
  },
];

const NEGATIVE_BADGES_B: BadgeDisplay = {
  q1Badge: null, // No badge for < 3.0 average
  q2Badge: { emoji: '🎧', name: 'Chill Listener', score: 2.3 },
  q3Badge: { emoji: '🎵', name: 'Getting in Sync', score: 1.8 },
  harmonies: { count: 0, total: 6 },
};

export const NEGATIVE_PROFILE: TestProfile = {
  ...BASE_PROFILE,
  id: 'test-negative',
  name: 'Alex Johnson',
  pronouns: 'she/her',
  profileType: 'negative',
  reviewsTypeA: NEGATIVE_REVIEWS_A,
  averageRatingTypeA: 2.1,
  badgesTypeB: NEGATIVE_BADGES_B,
  totalReviews: 6,
};

// ============================================
// EXPORTED ARRAY
// ============================================

export const TEST_PROFILES: TestProfile[] = [
  POSITIVE_PROFILE,
  NEUTRAL_PROFILE,
  NEGATIVE_PROFILE,
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get a test profile by type
 */
export function getTestProfile(type: 'positive' | 'neutral' | 'negative'): TestProfile {
  const profile = TEST_PROFILES.find((p) => p.profileType === type);
  if (!profile) {
    throw new Error(`Test profile not found: ${type}`);
  }
  return profile;
}

/**
 * Get all test profiles in random order
 */
export function getShuffledProfiles(): TestProfile[] {
  return [...TEST_PROFILES].sort(() => Math.random() - 0.5);
}

/**
 * Check if a decision matches expected behavior
 */
export function isDecisionCorrect(
  profileType: 'positive' | 'neutral' | 'negative',
  decision: 'like' | 'pass' | 'block'
): boolean {
  switch (profileType) {
    case 'positive':
      return decision === 'like';
    case 'neutral':
      return decision === 'like' || decision === 'pass';
    case 'negative':
      return decision === 'pass' || decision === 'block';
    default:
      return false;
  }
}

/**
 * Calculate badge for Type B based on average rating
 */
export function calculateBadge(
  questionNumber: 1 | 2 | 3,
  averageRating: number
): { emoji: string; name: string } | null {
  if (questionNumber === 1) {
    // Event enjoyment
    if (averageRating >= 4.0) return { emoji: '🏆', name: 'Platinum' };
    if (averageRating >= 3.0) return { emoji: '🥇', name: 'Gold' };
    return null;
  }

  if (questionNumber === 2) {
    // Social compatibility
    if (averageRating >= 4.0) return { emoji: '🎉', name: 'Crowd Favorite' };
    if (averageRating >= 3.0) return { emoji: '✨', name: 'Good Vibes' };
    return { emoji: '🎧', name: 'Chill Listener' };
  }

  if (questionNumber === 3) {
    // Reliability
    if (averageRating >= 4.0) return { emoji: '🪨', name: 'Rock Solid' };
    if (averageRating >= 3.0) return { emoji: '✅', name: 'Dependable' };
    return { emoji: '🎵', name: 'Getting in Sync' };
  }

  return null;
}
