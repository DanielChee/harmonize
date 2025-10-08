// Test data for component development and testing
// Mock user profiles with realistic data

import type { User, SpotifyData } from '@types';

/**
 * Mock Test User Profile
 * Use this for component development and visual testing
 */
export const TEST_USER: User = {
  id: 'test-user-001',
  user_id: 'test-user-001',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),

  // Basic Profile
  username: 'music_lover_21',
  display_name: 'Alex Chen',
  bio: 'Concert enthusiast 🎸 Always looking for show buddies! Love indie, pop, and electronic. Georgia Tech CS student.',
  pronouns: 'they/them',
  age: 21,
  city: 'Atlanta, GA',
  university: 'Georgia Tech',

  // Media
  profile_picture_url: 'https://i.pravatar.cc/300?img=12',
  additional_photos: [
    'https://i.pravatar.cc/300?img=13',
    'https://i.pravatar.cc/300?img=14',
  ],

  // Music
  featured_song_id: 'spotify:track:3n3Ppam7vgaVa1iaRUc9Lp',
  hours_on_spotify: 1247,

  // Preferences
  looking_for: 'friends',
  group_preference: 'both',
  age_range_min: 18,
  age_range_max: 28,
  distance_range: 25,

  // Privacy
  profile_visibility: 'public',
  show_distance: true,
  show_university: true,

  // Verification
  is_verified: true,
  verification_level: 3, // Photo verified
};

/**
 * Mock Spotify Data for Test User
 */
export const TEST_SPOTIFY_DATA: SpotifyData = {
  id: 'test-spotify-001',
  profile_id: 'test-user-001',
  spotify_user_id: 'spotify_test_001',
  spotify_username: 'music_lover_21',

  // Music Data
  top_genres: ['Indie Pop', 'Electronic', 'Alternative', 'K-Pop', 'Jazz'],
  top_artists: [
    {
      id: 'artist-1',
      name: 'Tame Impala',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb90357ef28b3a8b4f4cdbb9dc',
      genres: ['Psychedelic Rock', 'Indie'],
    },
    {
      id: 'artist-2',
      name: 'Billie Eilish',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb8b58edb508c43b3004f555fd',
      genres: ['Pop', 'Alternative'],
    },
    {
      id: 'artist-3',
      name: 'FKJ',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb8b58edb508c43b3004f555fd',
      genres: ['Electronic', 'Jazz'],
    },
    {
      id: 'artist-4',
      name: 'NewJeans',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb8b58edb508c43b3004f555fd',
      genres: ['K-Pop', 'Pop'],
    },
    {
      id: 'artist-5',
      name: 'Mac Miller',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb8b58edb508c43b3004f555fd',
      genres: ['Hip-Hop', 'Alternative'],
    },
  ],
  top_tracks: [
    {
      id: 'track-1',
      name: 'The Less I Know The Better',
      artist: 'Tame Impala',
      preview_url: '',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526',
      duration_ms: 216320,
    },
    {
      id: 'track-2',
      name: 'Bad Guy',
      artist: 'Billie Eilish',
      preview_url: '',
      image_url: 'https://i.scdn.co/image/ab67616d0000b2732a038d3bf875d23e4aeaa84e',
      duration_ms: 194087,
    },
    {
      id: 'track-3',
      name: 'Tadow',
      artist: 'FKJ, Masego',
      preview_url: '',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526',
      duration_ms: 226666,
    },
    {
      id: 'track-4',
      name: 'Ditto',
      artist: 'NewJeans',
      preview_url: '',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526',
      duration_ms: 186000,
    },
    {
      id: 'track-5',
      name: 'Good News',
      artist: 'Mac Miller',
      preview_url: '',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526',
      duration_ms: 329533,
    },
  ],

  // Listening Habits
  total_listening_time: 1247,
  most_active_listening_time: 'evening',

  // Real-time Data
  recent_tracks: [],
  currently_playing: null,

  last_spotify_sync: new Date().toISOString(),
};

/**
 * Additional Test Users for Variety
 */
export const TEST_USERS: User[] = [
  TEST_USER,
  {
    ...TEST_USER,
    id: 'test-user-002',
    user_id: 'test-user-002',
    username: 'festival_goer',
    display_name: 'Jordan Kim',
    bio: 'EDM enthusiast 🎧 Never miss a festival. Looking for rave fam!',
    pronouns: 'she/her',
    age: 23,
    city: 'Los Angeles, CA',
    university: 'UCLA',
    profile_picture_url: 'https://i.pravatar.cc/300?img=5',
    verification_level: 5, // University verified
  },
  {
    ...TEST_USER,
    id: 'test-user-003',
    user_id: 'test-user-003',
    username: 'indie_vibes',
    display_name: 'Sam Taylor',
    bio: 'Small venue shows only 🎵 Love discovering new artists.',
    pronouns: 'he/him',
    age: 19,
    city: 'Atlanta, GA',
    university: 'Emory University',
    profile_picture_url: 'https://i.pravatar.cc/300?img=8',
    verification_level: 1, // Email verified
  },
];

/**
 * Mock Concert Preferences
 */
export const TEST_CONCERT_PREFERENCES = [
  'Budget-friendly',
  'Small venues',
  'Festival lover',
  'VIP experience',
  'Standing only',
  'Seated preferred',
];

/**
 * Mock Music Genres
 */
export const TEST_GENRES = [
  'Pop',
  'Rock',
  'Hip-Hop',
  'EDM',
  'Indie',
  'Jazz',
  'K-Pop',
  'R&B',
  'Electronic',
  'Alternative',
  'Country',
  'Classical',
];
