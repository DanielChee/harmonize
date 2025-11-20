/**
 * DEVELOPMENT DATA - A/B Testing Test Profiles
 *
 * Realistic test profiles for Sprint 4:
 * - Alex (indie/alternative)  -> positive
 * - Jordan (hip-hop/R&B)      -> neutral
 * - Taylor (pop/EDM)          -> positive
 *
 * Fully conforms to TestProfile:
 *  - BaseProfile fields
 *  - reviewsTypeA (Amazon-style)
 *  - averageRatingTypeA
 *  - badgesTypeB (tiered badges)
 *  - totalReviews
 */

import type { TestProfile } from '@types';

// ALEX - Indie/Alternative, very strong but grounded reviews (positive)
export const TEST_PROFILE_ALEX: TestProfile = {
  id: 'test-alex-001',
  name: 'Alex Chen',
  pronouns: 'they/them',

  // A/B label – internal only
  profileType: 'positive',

  // BaseProfile (controlled variables)
  age: 21,
  university: 'Georgia Tech',
  universityVerified: true,
  concertsAttended: 9,
  accountAgeMonths: 10,
  mutualFriends: 0,
  bio: 'Music festival enthusiast looking for people to explore the Atlanta indie scene with! Love small venues and discovering new artists. Always down for spontaneous concerts.',

  // Type A – Amazon-style reviews
  reviewsTypeA: [
    {
      type: 'A',
      stars: 5,
      comment: 'Alex had the setlist memorized and still made space for me to enjoy my own favorites. Super thoughtful and easy to talk to.',
      reviewerName: 'Sarah K.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=45',
      daysAgo: 3,
    },
    {
      type: 'A',
      stars: 5,
      comment: 'Showed up early, grabbed us water between sets, and knew exactly where to stand for the best sound. 10/10 concert buddy.',
      reviewerName: 'Mike L.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=13',
      daysAgo: 7,
    },
    {
      type: 'A',
      stars: 4,
      comment: 'Really fun vibes and good music taste. Talked a lot between acts, which I liked, but might be too chatty if you prefer just listening.',
      reviewerName: 'Jamie R.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=23',
      daysAgo: 11,
    },
    {
      type: 'A',
      stars: 5,
      comment: 'Introduced me to a new opener I now have on repeat. Respectful, kind, and never pushy about after-plans.',
      reviewerName: 'Taylor M.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=31',
      daysAgo: 16,
    },
    {
      type: 'A',
      stars: 5,
      comment: 'Handled the crowded venue like a pro and always checked in to make sure I was comfortable in the pit.',
      reviewerName: 'Chris D.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=18',
      daysAgo: 22,
    },
    {
      type: 'A',
      stars: 4,
      comment: 'Great person to go with if you care about sound quality and good openers. Ran a bit late but communicated clearly.',
      reviewerName: 'Morgan F.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=27',
      daysAgo: 29,
    },
    {
      type: 'A',
      stars: 5,
      comment: 'Felt super safe the entire night and we debriefed the show over late-night food after. Would 100% go again.',
      reviewerName: 'Riley B.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=36',
      daysAgo: 35,
    },
    {
      type: 'A',
      stars: 5,
      comment: 'Chill, respectful, and genuinely there for the music. Perfect match if you love indie/dream pop.',
      reviewerName: 'Jordan P.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=40',
      daysAgo: 42,
    },
  ],

  averageRatingTypeA: 4.8,
  totalReviews: 8,

  // Type B – Badges (tiered)
  badgesTypeB: {
    q1Badge: { emoji: '🏆', name: 'Platinum Vibes' },      // Event quality
    q2Badge: { emoji: '🎉', name: 'Gold Social' },         // Social / fun
    q3Badge: { emoji: '🪨', name: 'Diamond Reliable' },    // Reliability
    harmonies: { count: 7, total: 8 },
  },
};

// JORDAN – Hip-Hop/R&B, more balanced (neutral)
export const TEST_PROFILE_JORDAN: TestProfile = {
  id: 'test-jordan-002',
  name: 'Jordan Williams',
  pronouns: 'he/him',
  profileType: 'neutral',

  age: 23,
  university: 'Emory University',
  universityVerified: true,
  concertsAttended: 6,
  accountAgeMonths: 8,
  mutualFriends: 0,
  bio: "ATL native and hip-hop head 🎤 Looking for concert buddies who appreciate real lyricism. Let's hit up State Farm Arena or catch some shows at The Tabernacle!",

  reviewsTypeA: [
    {
      type: 'A',
      stars: 5,
      comment: 'Jordan knew every word and kept the energy high without being overwhelming. Super fun if you like hype crowds.',
      reviewerName: 'Alex T.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=11',
      daysAgo: 4,
    },
    {
      type: 'A',
      stars: 4,
      comment: 'Great company and really passionate about the artists. Talked a lot about production and lyrics which I enjoyed.',
      reviewerName: 'Sam J.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=15',
      daysAgo: 9,
    },
    {
      type: 'A',
      stars: 3,
      comment: 'Fun overall, but wanted to stay for the very last song + after-party when I was ready to head out earlier.',
      reviewerName: 'Morgan L.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=19',
      daysAgo: 13,
    },
    {
      type: 'A',
      stars: 4,
      comment: 'On time, easy to coordinate with, and knew the venue layout. Ideal if you like being near the front.',
      reviewerName: 'Chris P.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=22',
      daysAgo: 20,
    },
    {
      type: 'A',
      stars: 5,
      comment: 'We ended up talking for an hour after the show about favorite albums. Great if you love deep music convos.',
      reviewerName: 'Lena R.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=29',
      daysAgo: 27,
    },
    {
      type: 'A',
      stars: 3,
      comment: 'Good vibes but a bit focused on getting videos for social. Still had a solid time overall.',
      reviewerName: 'Taylor S.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=34',
      daysAgo: 33,
    },
  ],

  averageRatingTypeA: 4.0,
  totalReviews: 6,

  badgesTypeB: {
    q1Badge: { emoji: '🥇', name: 'Gold Energy' },
    q2Badge: { emoji: '🎧', name: 'Silver Social' },
    q3Badge: { emoji: '🧭', name: 'Silver Reliable' },
    harmonies: { count: 4, total: 6 },
  },
};

// TAYLOR – Pop/EDM, very strong social/energy presence (positive)
export const TEST_PROFILE_TAYLOR: TestProfile = {
  id: 'test-taylor-003',
  name: 'Taylor Rodriguez',
  pronouns: 'she/her',
  profileType: 'positive',

  age: 20,
  university: 'Georgia State University',
  universityVerified: true,
  concertsAttended: 11,
  accountAgeMonths: 12,
  mutualFriends: 0,
  bio: 'Swiftie 💜 and EDM lover ✨ Looking for concert besties to dance the night away! Festival season is my favorite season. Catch me at every show I can get to!',

  reviewsTypeA: [
    {
      type: 'A',
      stars: 5,
      comment: 'Taylor had glitter, friendship bracelets, and a whole game plan for merch and photos. Peak concert buddy.',
      reviewerName: 'Olivia C.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=24',
      daysAgo: 2,
    },
    {
      type: 'A',
      stars: 5,
      comment: 'Kept the energy high all night and always checked in about water and breaks. Super considerate in packed crowds.',
      reviewerName: 'Maren G.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=26',
      daysAgo: 6,
    },
    {
      type: 'A',
      stars: 4,
      comment: 'Very into making TikToks which was fun but may not be for everyone. Still had an amazing time dancing together.',
      reviewerName: 'Jasmin H.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=30',
      daysAgo: 10,
    },
    {
      type: 'A',
      stars: 5,
      comment: 'Handled the festival chaos like a pro and never wandered off without telling me. Felt super safe the whole time.',
      reviewerName: 'Noah V.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=37',
      daysAgo: 17,
    },
    {
      type: 'A',
      stars: 5,
      comment: 'If you love pop/EDM and dancing, Taylor is your person. We barely stopped moving.',
      reviewerName: 'Emma W.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=42',
      daysAgo: 23,
    },
    {
      type: 'A',
      stars: 4,
      comment: 'Super fun but definitely high energy. Perfect if you want a hype buddy for big shows.',
      reviewerName: 'Lily B.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=28',
      daysAgo: 31,
    },
    {
      type: 'A',
      stars: 5,
      comment: 'We coordinated outfits and had the best time at the tour together. Already planning the next show.',
      reviewerName: 'Chloe N.',
      reviewerAvatar: 'https://i.pravatar.cc/300?img=32',
      daysAgo: 38,
    },
  ],

  averageRatingTypeA: 4.7,
  totalReviews: 7,

  badgesTypeB: {
    q1Badge: { emoji: '🏆', name: 'Platinum Show Buddy' },
    q2Badge: { emoji: '🎊', name: 'Platinum Social' },
    q3Badge: { emoji: '⏰', name: 'Gold Reliable' },
    harmonies: { count: 6, total: 7 },
  },
};

// Export array for easy cycling
export const TEST_PROFILES: TestProfile[] = [
  TEST_PROFILE_ALEX,
  TEST_PROFILE_JORDAN,
  TEST_PROFILE_TAYLOR,
];
