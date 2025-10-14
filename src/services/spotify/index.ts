// Spotify Service - Main Export
// Combines OAuth authentication and API data fetching

// Re-export authentication functions
export {
  authorizeWithSpotify, clearTokens, getClientId,
  getRedirectUri, getStoredTokens, getValidAccessToken, isAuthenticated, isTokenExpired, refreshAccessToken, storeTokens
} from './auth';

// Re-export API functions
export {
  fetchAllSpotifyData, getCurrentlyPlayingTrack, getCurrentUserProfile, getRecentlyPlayedTracks, getTopArtists,
  getTopTracks
} from './api';

// Re-export types
export type {
  ArtistObject, ImageObject, PagingObject, PrivateUserObject, SimplifiedAlbumObject, SimplifiedArtistObject, SpotifyAuthConfig,
  SpotifyData, SpotifyTokenResponse,
  StoredSpotifyTokens, TrackObject
} from '../../types/spotify-types';

