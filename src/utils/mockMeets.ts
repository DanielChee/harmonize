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

export interface MockUser {
  id: string;
  name: string;
  avatar: string;
  age: number;
  city: string;
  phoneNumber: string;
  concertDate: string; // ISO format
  review: Review | null;
  matchRowId?: string;

  source?: 'mock' | 'match';
}

export const MOCK_USERS: MockUser[] = [
  // FUTURE (no review)
  {
    id: 'user-1',
    name: 'Sarah',
    avatar: 'https://i.pravatar.cc/300?img=45',
    age: 22,
    city: 'Atlanta, GA',
    phoneNumber: '404-555-2391',
    concertDate: '2025-12-15',
    review: null,
    source: 'mock',
  },
  {
    id: 'user-2',
    name: 'Mike',
    avatar: 'https://i.pravatar.cc/300?img=13',
    age: 24,
    city: 'Atlanta, GA',
    phoneNumber: '404-555-8143',
    concertDate: '2025-11-09',
    review: null,
    source: 'mock',
  },
  {
    id: 'user-3',
    name: 'Chloe',
    avatar: 'https://i.pravatar.cc/300?img=26',
    age: 23,
    city: 'Atlanta, GA',
    phoneNumber: '404-555-6661',
    concertDate: '2025-12-20',
    review: null,
    source: 'mock',
  },

  // PAST (unreviewed)
  {
    id: 'user-4',
    name: 'Emma',
    avatar: 'https://i.pravatar.cc/300?img=47',
    age: 21,
    city: 'Atlanta, GA',
    phoneNumber: '404-555-0192',
    concertDate: '2025-09-10',
    review: null,
    source: 'mock',
  },
  {
    id: 'user-5',
    name: 'Jordan',
    avatar: 'https://i.pravatar.cc/300?img=5',
    age: 23,
    city: 'Atlanta, GA',
    phoneNumber: '404-555-4710',
    concertDate: '2025-08-10',
    review: null,
    source: 'mock',
  },

  // PAST (reviewed – converted from Version A → Version B)
  {
    id: 'user-6',
    name: 'Alex',
    avatar: 'https://i.pravatar.cc/300?img=35',
    age: 25,
    city: 'Atlanta, GA',
    phoneNumber: '404-555-9021',
    concertDate: '2025-07-20',
    review: {
      type: 'B',
      q1: 5,
      q2: 5,
      q3: 5,
      wouldMeetAgain: true,
    },
    source: 'mock',
  },

  // PAST (reviewed – Version B)
  {
    id: 'user-7',
    name: 'Lily',
    avatar: 'https://i.pravatar.cc/300?img=8',
    age: 22,
    city: 'Atlanta, GA',
    phoneNumber: '404-555-7281',
    concertDate: '2025-06-14',
    review: {
      type: 'B',
      q1: 4,
      q2: 5,
      q3: 4,
      wouldMeetAgain: true,
    },
    source: 'mock',
  },
];
