/**
 * DEVELOPMENT DATA - Harmonize Review System
 *
 * Mock Meets & Review System Data
 *
 * Contains 7 test users using ONLY Review Type B (final production version):
 * - 3-question survey (5-star each)
 * - "Did you harmonize?" yes/no toggle
 *
 * No more Variant A support.
 */

export interface Review {
  type: 'B';
  q1: number; // Enjoyment
  q2: number; // Reliability
  q3: number; // Communication
  wouldMeetAgain: boolean; // Harmonize (Yes/No)
}

export interface Badge {
  emoji: string;
  name: string;
}

export interface BadgesTypeB {
  q1Badge: Badge | null;
  q2Badge: Badge | null;
  q3Badge: Badge | null;
  harmonies: { count: number; total: number };
}

export function getBadgesFromReview(review: Review): BadgesTypeB {
  const badges: BadgesTypeB = {
    q1Badge: null,
    q2Badge: null,
    q3Badge: null,
    harmonies: { count: 0, total: 1 },
  };

  if (review.q1 >= 4) {
    badges.q1Badge = { emoji: '🎉', name: 'Good Vibes' };
  }
  if (review.q2 >= 4) {
    badges.q2Badge = { emoji: '🤝', name: 'Reliable Buddy' };
  }
  if (review.q3 >= 4) {
    badges.q3Badge = { emoji: '💬', name: 'Great Communicator' };
  }
  if (review.wouldMeetAgain) {
    badges.harmonies.count = 1;
  }

  return badges;
}
