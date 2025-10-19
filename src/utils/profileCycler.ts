// Profile Cycling System
// Manages cycling through test profiles + real Spotify data

import type { User, SpotifyData } from '@types';

// Test Profile 1: Alex - Indie/Alternative lover, Georgia Tech
export const PROFILE_ALEX: User = {
  id: 'test-alex-001',
  username: 'alexchen',
  display_name: 'Alex Chen',
  profile_picture_url: 'https://i.pravatar.cc/300?img=12',
  bio: 'Music festival enthusiast looking for people to explore the Atlanta indie scene with! Love small venues and discovering new artists. Always down for spontaneous concerts.',
  age: 21,
  pronouns: 'they/them',
  university: 'Georgia Tech',
  city: 'Atlanta, GA',
  looking_for: 'friends',
  group_preference: 'both',
  concert_preferences: ['Indoor', 'Small Venue', 'Standing'],
  show_university: true,
  is_verified: true,
  is_active: true,
  created_at: new Date().toISOString(),
  last_active: new Date().toISOString(),
};

export const SPOTIFY_ALEX: SpotifyData = {
  spotify_user_id: 'alex_spotify',
  top_genres: ['Indie', 'Alternative', 'Dream Pop', 'Lo-Fi', 'Bedroom Pop'],
  top_artists: [
    {
      id: '1pBLC0qVRTB5zVMuteQ9jJ',
      name: 'Phoebe Bridgers',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb0a27bb5ac3c96e00f92c2a53',
      genres: ['indie', 'alternative'],
    },
    {
      id: '3l0CmX0FuQjFxr8SK7Vqag',
      name: 'Clairo',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb0ac6176b7d0047c0b3e9ff96',
      genres: ['bedroom pop', 'indie'],
    },
    {
      id: '3GReMUkGHPUGo7gRWHZ1FE',
      name: 'The Japanese House',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb5f3c2e98b13e0e1f94a1da9c',
      genres: ['dream pop', 'indie'],
    },
    {
      id: '1Df3DMjjD9TlxJfO3WFwTn',
      name: 'Boygenius',
      image_url: 'https://i.scdn.co/image/ab6761610000e5ebd4bb1ad578e6f5b2f6f6de55',
      genres: ['indie', 'folk'],
    },
    {
      id: '2uYWxilOVlUdk4oV9DvwqK',
      name: 'Mitski',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb49688f7d97a578054cb74429',
      genres: ['indie', 'alternative'],
    },
  ],
  top_tracks: [
    {
      id: '1k3EgPBHalnZohz8AmP7K2',
      name: 'Scott Street',
      artist: 'Phoebe Bridgers',
      image_url: 'https://i.scdn.co/image/ab67616d0000b2737da94a1beda4172d72baf798',
      preview_url: '',
      duration_ms: 210000,
    },
    {
      id: '0jw3ypr610L0Jsk7lEMMy6',
      name: 'Bags',
      artist: 'Clairo',
      image_url: 'https://i.scdn.co/image/ab67616d0000b2738bc301281b1f5e1b03c1cb0e',
      preview_url: '',
      duration_ms: 233000,
    },
    {
      id: '3aYr0SqUZnPKYW0gfVQFMN',
      name: 'Boyish',
      artist: 'The Japanese House',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273e1de0c6d6acb72c3db67c3a7',
      preview_url: '',
      duration_ms: 195000,
    },
    {
      id: '4WBvT9W0RojHJbKlGq6cBN',
      name: 'Not Strong Enough',
      artist: 'Boygenius',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273d0b1982f6d0cee9c1d54e9a0',
      preview_url: '',
      duration_ms: 238000,
    },
    {
      id: '3v3AhcFMcPNDhWNp5ZADiZ',
      name: 'Working for the Knife',
      artist: 'Mitski',
      image_url: 'https://i.scdn.co/image/ab67616d0000b2737fe4a82a08c3f028242cbc71',
      preview_url: '',
      duration_ms: 204000,
    },
  ],
};

// Test Profile 2: Jordan - Hip-Hop/R&B fan, Emory University
export const PROFILE_JORDAN: User = {
  id: 'test-jordan-002',
  username: 'jordanwilliams',
  display_name: 'Jordan Williams',
  profile_picture_url: 'https://i.pravatar.cc/300?img=33',
  bio: "ATL native and hip-hop head 🎤 Looking for concert buddies who appreciate real lyricism. Let's hit up State Farm Arena or catch some shows at The Tabernacle!",
  age: 23,
  pronouns: 'he/him',
  university: 'Emory University',
  city: 'Atlanta, GA',
  looking_for: 'both',
  group_preference: 'group',
  concert_preferences: ['Arena', 'Outdoor', 'Festival'],
  show_university: true,
  is_verified: false,
  is_active: true,
  created_at: new Date().toISOString(),
  last_active: new Date().toISOString(),
};

export const SPOTIFY_JORDAN: SpotifyData = {
  spotify_user_id: 'jordan_spotify',
  top_genres: ['Hip-Hop', 'R&B', 'Trap', 'Soul', 'Neo-Soul'],
  top_artists: [
    {
      id: '2YZyLoL8N0Wb9xBt1NhZWg',
      name: 'Kendrick Lamar',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb437b9e2a82505b3d93ff1022',
      genres: ['hip-hop', 'rap'],
    },
    {
      id: '7tYKF4w9nC0nq9CsPZTHyP',
      name: 'SZA',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb0895066d172e1f51f520bc65',
      genres: ['r&b', 'soul'],
    },
    {
      id: '2fC7cBOFCx8pzkMiKhYvow',
      name: 'JID',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb3aad32a61e83b0f6a5a0fe78',
      genres: ['hip-hop', 'rap'],
    },
    {
      id: '3jK9MiCrA42lLAdMGUZpwa',
      name: 'Anderson .Paak',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb16d63cd5329f374b3d1df733',
      genres: ['r&b', 'funk'],
    },
    {
      id: '73sIBHcqh3Z3NyqHKZ7FOL',
      name: 'Childish Gambino',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb60c5ea4d38818e50d2d43349',
      genres: ['hip-hop', 'r&b'],
    },
  ],
  top_tracks: [
    {
      id: '6HZILIRieu8S0iqY8kIKhj',
      name: 'DNA.',
      artist: 'Kendrick Lamar',
      image_url: 'https://i.scdn.co/image/ab67616d0000b2738b52c6b9bc4e43d873869699',
      preview_url: '',
      duration_ms: 185000,
    },
    {
      id: '1Ee2kUrZQAJKRI3Z6LsPxP',
      name: 'Kill Bill',
      artist: 'SZA',
      image_url: 'https://i.scdn.co/image/ab67616d0000b27370dbc9f47669d120ad874ec1',
      preview_url: '',
      duration_ms: 153000,
    },
    {
      id: '3af0cZpy9ON9yCJPCOJOmH',
      name: 'Surround Sound',
      artist: 'JID ft. 21 Savage',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273509c89f1df4dbff32d009fd0',
      preview_url: '',
      duration_ms: 208000,
    },
    {
      id: '2aZI6dNLLfJEFD3jvdJrKv',
      name: 'Come Down',
      artist: 'Anderson .Paak',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273726d48d93d8e1a3e69d07555',
      preview_url: '',
      duration_ms: 241000,
    },
    {
      id: '4uUG5RXrOk84mYEfFvj3cK',
      name: 'Redbone',
      artist: 'Childish Gambino',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273ec96e006b8bdff4e20f53bc2',
      preview_url: '',
      duration_ms: 327000,
    },
  ],
};

// Test Profile 3: Taylor - Pop/EDM enthusiast, Georgia State
export const PROFILE_TAYLOR: User = {
  id: 'test-taylor-003',
  username: 'taylorswiftie99',
  display_name: 'Taylor Rodriguez',
  profile_picture_url: 'https://i.pravatar.cc/300?img=47',
  bio: 'Swiftie 💜 and EDM lover ✨ Looking for concert besties to dance the night away! Festival season is my favorite season. Catch me at every show I can get to!',
  age: 20,
  pronouns: 'she/her',
  university: 'Georgia State University',
  city: 'Atlanta, GA',
  looking_for: 'friends',
  group_preference: 'both',
  concert_preferences: ['Festival', 'Outdoor', 'Standing', 'Arena'],
  show_university: true,
  is_verified: true,
  is_active: true,
  created_at: new Date().toISOString(),
  last_active: new Date().toISOString(),
};

export const SPOTIFY_TAYLOR: SpotifyData = {
  spotify_user_id: 'taylor_spotify',
  top_genres: ['Pop', 'EDM', 'Dance Pop', 'Electropop', 'Synth-Pop'],
  top_artists: [
    {
      id: '06HL4z0CvFAxyc27GXpf02',
      name: 'Taylor Swift',
      image_url: 'https://i.scdn.co/image/ab6761610000e5ebe672b5f553298dcdccb0e676',
      genres: ['pop', 'indie pop'],
    },
    {
      id: '6M2wZ9GZgrQXHCFfjv46we',
      name: 'Dua Lipa',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb0c68f6c95232e716f0abea3d',
      genres: ['pop', 'dance pop'],
    },
    {
      id: '69GGBxA162lTqCwzJG5jLp',
      name: 'The Chainsmokers',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb050b054c8dea15a139ad0c31',
      genres: ['edm', 'pop'],
    },
    {
      id: '1McMsnEElThX1knmY4oliG',
      name: 'Olivia Rodrigo',
      image_url: 'https://i.scdn.co/image/ab6761610000e5ebe03a98785f3658f0b6461ec4',
      genres: ['pop', 'pop rock'],
    },
    {
      id: '2qxJFvFYMEDqd7ui6kSAcq',
      name: 'Zedd',
      image_url: 'https://i.scdn.co/image/ab6761610000e5eb9a398209a4ef3360dce2dec4',
      genres: ['edm', 'electropop'],
    },
  ],
  top_tracks: [
    {
      id: '0V3wPSX9ygBnCm8psDIegu',
      name: 'Anti-Hero',
      artist: 'Taylor Swift',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273bb54dde68cd23e2a268ae0f5',
      preview_url: '',
      duration_ms: 200000,
    },
    {
      id: '39LLxExYz6ewLAcYrzQQyP',
      name: 'Levitating',
      artist: 'Dua Lipa',
      image_url: 'https://i.scdn.co/image/ab67616d0000b2734bc66095f8a70a0d.jpg',
      preview_url: '',
      duration_ms: 203000,
    },
    {
      id: '7BKLCZ1jbUBVqRi2FVlTVw',
      name: 'Closer',
      artist: 'The Chainsmokers ft. Halsey',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273495ce6da9aeb159e94eaa453',
      preview_url: '',
      duration_ms: 244000,
    },
    {
      id: '1kuGVB7EU95pJObxwvfwKS',
      name: 'vampire',
      artist: 'Olivia Rodrigo',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273e85259a1cae29a8d91f2093d',
      preview_url: '',
      duration_ms: 219000,
    },
    {
      id: '09IStsImFySgyp0pIQdqAc',
      name: 'The Middle',
      artist: 'Zedd, Maren Morris, Grey',
      image_url: 'https://i.scdn.co/image/ab67616d0000b273da6f73a25f4c79d0e6b4a8bd',
      preview_url: '',
      duration_ms: 184000,
    },
  ],
};

// Profile data array for easy cycling
export const TEST_PROFILES = [
  { user: PROFILE_ALEX, spotify: SPOTIFY_ALEX },
  { user: PROFILE_JORDAN, spotify: SPOTIFY_JORDAN },
  { user: PROFILE_TAYLOR, spotify: SPOTIFY_TAYLOR },
];

// Export individual pieces for backward compatibility
export {
  PROFILE_ALEX as TEST_USER_ALEX,
  PROFILE_JORDAN as TEST_USER_JORDAN,
  PROFILE_TAYLOR as TEST_USER_TAYLOR,
  SPOTIFY_ALEX as TEST_SPOTIFY_ALEX,
  SPOTIFY_JORDAN as TEST_SPOTIFY_JORDAN,
  SPOTIFY_TAYLOR as TEST_SPOTIFY_TAYLOR,
};
