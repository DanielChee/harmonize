// Re-export authentication functions
export {
  authorizeWithSpotify, clearTokens, getClientId,
  getRedirectUri, getStoredTokens, getValidAccessToken, isAuthenticated, isTokenExpired, logoutFromSpotify, refreshAccessToken, storeTokens
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

