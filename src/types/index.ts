// Core type definitions for Harmonize app

export interface User {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;

  // Basic Profile
  username: string;
  display_name: string;
  bio: string;
  pronouns: string;
  age: number;
  city: string;
  university: string;

  // Media
  profile_picture_url: string;
  additional_photos: string[];

  // Music
  featured_song_id: string;
  hours_on_spotify: number;

  // Preferences
  looking_for: 'friends' | 'dating' | 'both';
  group_preference: 'group' | 'partner' | 'both';
  age_range_min: number;
  age_range_max: number;
  distance_range: number;

  // Privacy
  profile_visibility: 'public' | 'verified_only' | 'private';
  show_distance: boolean;
  show_university: boolean;

  // Verification
  is_verified: boolean;
  verification_level: number;
}

export interface SpotifyData {
  id: string;
  profile_id: string;
  spotify_user_id: string;
  spotify_username: string;

  // Music Data
  top_genres: string[];
  top_artists: SpotifyArtist[];
  top_tracks: SpotifyTrack[];

  // Listening Habits
  total_listening_time: number;
  most_active_listening_time: 'morning' | 'afternoon' | 'evening' | 'night';

  // Real-time Data
  recent_tracks: SpotifyTrack[];
  currently_playing: SpotifyTrack | null;

  last_spotify_sync: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  image_url: string;
  genres?: string[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  preview_url: string;
  image_url: string;
  duration_ms: number;
}

export interface Match {
  id: string;
  created_at: string;
  user1_id: string;
  user2_id: string;
  status: 'active' | 'unmatched' | 'blocked';
  matched_at: string;
  match_score: number;
  match_reasons: string[];
  last_message_at: string;
  unread_count_user1: number;
  unread_count_user2: number;
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  created_at: string;
  content: string;
  message_type: 'text' | 'image' | 'audio' | 'song_share' | 'concert_invite';
  media_url?: string;
  media_metadata?: any;
  is_read: boolean;
  read_at?: string;
  is_deleted: boolean;
  special_data?: any;
}

export interface ConcertEvent {
  id: string;
  songkick_id: string;
  title: string;
  artist_names: string[];
  venue_name: string;
  venue_address: string;
  city: string;
  latitude: number;
  longitude: number;
  event_date: string;
  event_time?: string;
  doors_time?: string;
  ticket_url?: string;
  price_range?: string;
  age_restriction?: string;
  description?: string;
  genres: string[];
  event_status: 'active' | 'cancelled' | 'postponed' | 'sold_out';
}

export interface ConcertInterest {
  id: string;
  profile_id: string;
  concert_id: string;
  interest_type: 'interested' | 'going' | 'maybe';
  with_buddies: boolean;
  max_group_size: number;
}

export interface UserAction {
  id: string;
  user_id: string;
  target_user_id: string;
  created_at: string;
  action_type: 'like' | 'pass' | 'super_like' | 'report' | 'block' | 'view';
  context_data?: any;
}

export interface Verification {
  id: string;
  profile_id: string;
  verification_type: 'email' | 'phone' | 'photo' | 'id_document' | 'university';
  status: 'pending' | 'approved' | 'rejected';
  verification_data?: any;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error: null;
}

export interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
  };
}

// Store Types
export interface UserStore {
  currentUser: User | null;
  spotifyData: SpotifyData | null;
  isLoading: boolean;
  error: string | null;
}

export interface MatchStore {
  matches: Match[];
  discoveryQueue: User[];
  currentMatch: Match | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatStore {
  conversations: Record<string, Message[]>;
  activeConversation: string | null;
  typingUsers: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
}

export interface ConcertStore {
  events: ConcertEvent[];
  userInterests: ConcertInterest[];
  nearbyEvents: ConcertEvent[];
  isLoading: boolean;
  error: string | null;
}

// Component Props Types
export interface UserCardProps {
  user: User;
  onLike: () => void;
  onPass: () => void;
  onSuperLike?: () => void;
  showActions?: boolean;
}

export interface MessageInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export interface ConcertCardProps {
  concert: ConcertEvent;
  onInterest: (type: ConcertInterest['interest_type']) => void;
  userInterest?: ConcertInterest;
}

// Navigation Types
export interface TabParamList {
  match: undefined;
  concerts: undefined;
  chat: undefined;
  profile: undefined;
}

export interface RootStackParamList {
  '(tabs)': undefined;
  'profile-setup': undefined;
  'spotify-auth': undefined;
  'chat-detail': { matchId: string };
  'profile-detail': { userId: string };
  'concert-detail': { concertId: string };
}