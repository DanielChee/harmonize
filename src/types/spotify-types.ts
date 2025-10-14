// Spotify Web API Types - Standard API Response Structures

export interface ImageObject {
  url: string;
  height: number | null;
  width: number | null;
}

export interface ExternalUrls {
  spotify: string;
}

export interface Followers {
  href: string | null;
  total: number;
}

export interface SimplifiedArtistObject {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: "artist";
  uri: string;
}

export interface ArtistObject {
  external_urls: ExternalUrls;
  followers: Followers;
  genres: string[];
  href: string;
  id: string;
  images: ImageObject[];
  name: string;
  popularity: number;
  type: "artist";
  uri: string;
}

export interface SimplifiedAlbumObject {
  album_type: "album" | "single" | "compilation";
  artists: SimplifiedArtistObject[];
  available_markets: string[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: ImageObject[];
  name: string;
  release_date: string;
  release_date_precision: "year" | "month" | "day";
  type: "album";
  uri: string;
}

export interface TrackObject {
  album: SimplifiedAlbumObject;
  artists: SimplifiedArtistObject[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids?: {
    isrc?: string;
    ean?: string;
    upc?: string;
  };
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string | null;
  track_number: number;
  type: "track";
  uri: string;
}

export interface PagingObject<T> {
  href: string;
  items: T[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
}

export interface PrivateUserObject {
  country?: string;
  display_name?: string | null;
  email?: string;
  explicit_content?: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  images?: ImageObject[];
  product?: string;
  type: string;
  uri: string;
}

// OAuth Token Response
export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

// App-Specific Types for Internal Use
export interface StoredSpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface SpotifyAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
}

export interface SpotifyData {
  spotifyUserId: string;
  topArtists: ArtistObject[];
  topTracks: TrackObject[];
  topGenres: string[];
  listeningHours?: number;
  lastSyncedAt: string;
}
