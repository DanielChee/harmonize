/**
 * DEVELOPMENT DATA - Mock Concert Listings
 *
 * Mock concert data for the Concerts tab
 *
 * Contains realistic concert listings used in the Concerts screen.
 * Used for demonstration until real concert API integration (Songkick/Ticketmaster).
 */

export interface MockConcert {
  id: string;
  artist: string;
  venue: string;
  city: string;
  date: string;
  dateDisplay: string;
  month: string;
  day: string;
  image: string;
  isSaved: boolean;
  ticketsAvailable: boolean;
}

export const MOCK_CONCERTS: MockConcert[] = [
  {
    id: '1',
    artist: 'Laufey',
    venue: 'The Tabernacle',
    city: 'Atlanta, GA',
    date: '2025-11-09',
    dateDisplay: 'Nov 9, 2025',
    month: 'Nov',
    day: '9',
    image: 'https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3132a15fbb0',
    isSaved: false,
    ticketsAvailable: true,
  },
  {
    id: '2',
    artist: 'Taylor Swift',
    venue: 'Mercedes-Benz Stadium',
    city: 'Atlanta, GA',
    date: '2025-12-15',
    dateDisplay: 'Dec 15, 2025',
    month: 'Dec',
    day: '15',
    image: 'https://i.scdn.co/image/ab6761610000e5eb859e4c14fa59296c8649e0e4',
    isSaved: true,
    ticketsAvailable: true,
  },
  {
    id: '3',
    artist: 'Tame Impala',
    venue: 'State Farm Arena',
    city: 'Atlanta, GA',
    date: '2025-10-25',
    dateDisplay: 'Oct 25, 2025',
    month: 'Oct',
    day: '25',
    image: 'https://i.scdn.co/image/ab6761610000e5eb90357ef28b3a012a1d1b2fa2',
    isSaved: false,
    ticketsAvailable: true,
  },
  {
    id: '4',
    artist: 'Billie Eilish',
    venue: 'Fox Theatre',
    city: 'Atlanta, GA',
    date: '2025-11-20',
    dateDisplay: 'Nov 20, 2025',
    month: 'Nov',
    day: '20',
    image: 'https://i.scdn.co/image/ab6761610000e5eb4a21b4760d2ecb7b0dcdc8da',
    isSaved: false,
    ticketsAvailable: false,
  },
  {
    id: '5',
    artist: 'The Weeknd',
    venue: 'Lakewood Amphitheatre',
    city: 'Atlanta, GA',
    date: '2025-12-01',
    dateDisplay: 'Dec 1, 2025',
    month: 'Dec',
    day: '1',
    image: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb',
    isSaved: true,
    ticketsAvailable: true,
  },
  {
    id: '6',
    artist: 'Phoebe Bridgers',
    venue: 'Terminal West',
    city: 'Atlanta, GA',
    date: '2025-11-12',
    dateDisplay: 'Nov 12, 2025',
    month: 'Nov',
    day: '12',
    image: 'https://i.scdn.co/image/ab6761610000e5eb0c0f8a9e64bcc988f2a8f226',
    isSaved: false,
    ticketsAvailable: true,
  },
];
