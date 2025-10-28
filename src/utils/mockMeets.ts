export interface ReviewTypeA {
  type: 'A';
  rating: number;
  comment: string;
}

export interface ReviewTypeB {
  type: 'B';
  q1: number;
  q2: number;
  q3: number;
  wouldMeetAgain: boolean;
}

export type Review = ReviewTypeA | ReviewTypeB;

export interface MockUser {
  id: string;
  name: string;
  avatar: string;
  age: number;
  city: string;
  phoneNumber: string;
  concertDate: string; // ISO format
  review: Review | null;
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
  },

  // PAST (reviewed – Version A)
  {
    id: 'user-6',
    name: 'Alex',
    avatar: 'https://i.pravatar.cc/300?img=35',
    age: 25,
    city: 'Atlanta, GA',
    phoneNumber: '404-555-9021',
    concertDate: '2025-07-20',
    review: { type: 'A', rating: 5, comment: 'Super friendly and chill!' },
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
    review: { type: 'B', q1: 4, q2: 5, q3: 4, wouldMeetAgain: true },
  },
];
