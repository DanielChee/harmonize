// App constants and configuration

// App Configuration
export const APP_CONFIG = {
  name: 'Harmonize',
  version: '1.0.0',
  tagline: 'Concert Buddy Finder',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  spotify: {
    base: 'https://api.spotify.com/v1',
    auth: 'https://accounts.spotify.com/authorize',
    token: 'https://accounts.spotify.com/api/token',
  },
  songkick: {
    base: 'https://api.songkick.com/api/3.0',
  },
} as const;

// OAuth Scopes
export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-read-recently-played',
  'user-read-currently-playing',
  'streaming',
] as const;

// App Limits
export const LIMITS = {
  bio: {
    maxLength: 100,
    minLength: 10,
  },
  age: {
    min: 18,
    max: 100,
  },
  photos: {
    max: 6,
    required: 1,
  },
  distance: {
    min: 1,
    max: 100,
    default: 25,
  },
  groupSize: {
    min: 2,
    max: 10,
    default: 4,
  },
} as const;

// Verification Levels
export const VERIFICATION_LEVELS = {
  NONE: 0,
  EMAIL: 1,
  PHONE: 2,
  PHOTO: 3,
  ID: 4,
  UNIVERSITY: 5,
} as const;

export const VERIFICATION_LABELS = {
  [VERIFICATION_LEVELS.NONE]: 'Unverified',
  [VERIFICATION_LEVELS.EMAIL]: 'Email Verified',
  [VERIFICATION_LEVELS.PHONE]: 'Phone Verified',
  [VERIFICATION_LEVELS.PHOTO]: 'Photo Verified',
  [VERIFICATION_LEVELS.ID]: 'ID Verified',
  [VERIFICATION_LEVELS.UNIVERSITY]: 'University Verified',
} as const;

// Colors - Aligned with Figma Design System
export const COLORS = {
  // Brand - Spotify Integration
  primary: '#1DB954',        // Spotify Green (CTAs, active states)
  primaryDark: '#1AA34A',    // Pressed state
  primaryLight: '#1ED760',   // Hover state

  // Neutrals
  background: '#FFFFFF',     // Main background
  surface: '#F5F5F5',        // Cards, elevated surfaces
  surfaceDark: '#E8E8E8',    // Pressed cards
  border: '#E0E0E0',         // Dividers, borders

  // Text
  text: {
    primary: '#1A1A1A',      // Headlines, body
    secondary: '#8E8E93',    // Captions, metadata
    tertiary: '#C7C7CC',     // Disabled text
    inverse: '#FFFFFF',      // Text on dark backgrounds
    light: '#B2BEC3',        // Legacy support
  },

  // Semantic
  success: '#34C759',        // Confirmations
  warning: '#FF9500',        // Warnings
  error: '#FF3B30',          // Errors, destructive actions
  info: '#007AFF',           // iOS Blue for info

  // Spotify Specific
  spotify: {
    black: '#191414',        // Spotify's dark theme
    green: '#1DB954',        // Spotify's brand green
    gray: '#535353',         // Spotify's secondary gray
  },

  // Legacy (deprecated, use new colors above)
  secondary: '#A29BFE',      // @deprecated
  accent: '#FD79A8',         // @deprecated
} as const;

// Typography - Aligned with Figma Design System
export const TYPOGRAPHY = {
  // Font family (system fonts)
  fontFamily: {
    primary: 'SF Pro Text',
    fallback: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },

  // Type scale
  scale: {
    display: {
      fontSize: 34,
      lineHeight: 41,
      fontWeight: '700' as const,
      letterSpacing: 0.37,
    },
    h1: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '700' as const,
      letterSpacing: 0.36,
    },
    h2: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: '600' as const,
      letterSpacing: 0.35,
    },
    h3: {
      fontSize: 20,
      lineHeight: 25,
      fontWeight: '600' as const,
      letterSpacing: 0.38,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '400' as const,
      letterSpacing: -0.32,
    },
    bodyBold: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: -0.32,
    },
    caption: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '400' as const,
      letterSpacing: -0.15,
    },
    small: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    button: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: -0.32,
    },
  },

  // Legacy size/weight system (for backwards compatibility)
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// Spacing - 8pt Grid System (Aligned with Figma)
export const SPACING = {
  xs: 4,     // Tight spacing (icon padding, small gaps)
  sm: 8,     // Small spacing (list item gaps)
  md: 16,    // Medium spacing (card padding, section gaps)
  lg: 24,    // Large spacing (screen margins)
  xl: 32,    // Extra large (section separators)
  '2xl': 48, // Extra extra large (major sections)
  '3xl': 64, // Massive spacing
} as const;

// Border Radius - From Figma Extraction
export const BORDER_RADIUS = {
  none: 0,
  sm: 5,       // Tags, small inputs
  md: 12,      // Cards
  lg: 16,      // Large cards
  xl: 18,      // Extra large cards
  pill: 30,    // Fully rounded pills (buttons)
  circle: 999, // Circular avatars
} as const;

// Shadows - From Figma Specs
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    // Standard card shadow from Figma
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

// Animation Durations
export const ANIMATIONS = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// Match Score Thresholds
export const MATCH_THRESHOLDS = {
  low: 0.3,
  medium: 0.6,
  high: 0.8,
  perfect: 0.95,
} as const;

// Music Genres (Spotify)
export const MUSIC_GENRES = [
  'pop',
  'rock',
  'hip-hop',
  'r&b',
  'country',
  'electronic',
  'jazz',
  'classical',
  'indie',
  'alternative',
  'folk',
  'blues',
  'reggae',
  'punk',
  'metal',
  'latin',
  'world',
  'funk',
  'soul',
  'disco',
] as const;

// Concert Categories
export const CONCERT_CATEGORIES = [
  'Festival',
  'Concert',
  'Tour',
  'Arena Show',
  'Club Show',
  'Outdoor Event',
  'Acoustic Set',
  'DJ Set',
] as const;

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Network connection error. Please try again.',
  spotify: {
    auth: 'Spotify authentication failed. Please try again.',
    data: 'Unable to fetch Spotify data. Please check your connection.',
  },
  profile: {
    incomplete: 'Please complete your profile before continuing.',
    invalid: 'Profile data is invalid. Please check your entries.',
  },
  messaging: {
    send: 'Failed to send message. Please try again.',
    load: 'Unable to load messages. Please refresh.',
  },
  matching: {
    load: 'Unable to load potential matches. Please try again.',
    action: 'Unable to process your action. Please try again.',
  },
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  profile: {
    updated: 'Profile updated successfully!',
    verified: 'Profile verification submitted successfully!',
  },
  spotify: {
    connected: 'Spotify account connected successfully!',
    synced: 'Music data synced successfully!',
  },
  messaging: {
    sent: 'Message sent!',
  },
  matching: {
    liked: 'Like sent!',
    matched: "It's a match! 🎉",
  },
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?[\d\s\-\(\)]+$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
} as const;

// Feature Flags
export const FEATURES = {
  videoMessages: false,
  groupChats: true,
  concertGroups: true,
  universityVerification: true,
  socialMediaImport: false,
} as const;