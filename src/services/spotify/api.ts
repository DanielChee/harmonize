// Spotify Web API Data Fetching
import { API_ENDPOINTS } from '@constants';
import type {
  ArtistObject,
  TrackObject,
  PrivateUserObject,
  PagingObject,
} from '../../types/spotify-types';
import type { SpotifyData, SpotifyArtist, SpotifyTrack } from '@types';
import { getValidAccessToken } from './auth';

/**
 * Make authenticated request to Spotify API with retry logic
 */
const spotifyFetch = async <T>(endpoint: string, retries = 3): Promise<T> => {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('No valid access token');

  const response = await fetch(`${API_ENDPOINTS.spotify.base}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  // Handle rate limiting
  if (response.status === 429 && retries > 0) {
    const retryAfter = response.headers.get('Retry-After');
    const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000;

    await new Promise(resolve => setTimeout(resolve, delay));
    return spotifyFetch<T>(endpoint, retries - 1);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Spotify API error: ${response.status} - ${errorData.error?.message || response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Get current user's profile
 * Endpoint: GET /v1/me
 * Scopes: user-read-private, user-read-email
 */
export const getCurrentUserProfile = async (): Promise<PrivateUserObject> => {
  return await spotifyFetch<PrivateUserObject>('/me');
};

/**
 * Get user's top artists
 * Endpoint: GET /v1/me/top/artists
 * Scopes: user-top-read
 *
 * @param timeRange - Time range for top artists (long_term, medium_term, short_term)
 * @param limit - Number of artists to return (max 50, default 20)
 */
export const getTopArtists = async (
  timeRange: 'long_term' | 'medium_term' | 'short_term' = 'medium_term',
  limit: number = 5
): Promise<PagingObject<ArtistObject>> => {
  return await spotifyFetch<PagingObject<ArtistObject>>(
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`
  );
};

/**
 * Get user's top tracks
 * Endpoint: GET /v1/me/top/tracks
 * Scopes: user-top-read
 *
 * @param timeRange - Time range for top tracks (long_term, medium_term, short_term)
 * @param limit - Number of tracks to return (max 50, default 20)
 */
export const getTopTracks = async (
  timeRange: 'long_term' | 'medium_term' | 'short_term' = 'medium_term',
  limit: number = 5
): Promise<PagingObject<TrackObject>> => {
  return await spotifyFetch<PagingObject<TrackObject>>(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
  );
};

/**
 * Extract top genres from artists
 */
const extractTopGenres = (artists: ArtistObject[], limit: number = 5): string[] => {
  const genreCount = new Map<string, number>();

  // Count genre occurrences
  artists.forEach((artist) => {
    artist.genres.forEach((genre) => {
      genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
    });
  });

  // Sort by count and return top genres
  return Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre]) => genre);
};

/**
 * Calculate approximate listening hours
 * Note: This is an estimation based on top tracks play count approximation
 */
const calculateListeningHours = (tracks: TrackObject[]): number => {
  // Average track duration
  const avgDuration = tracks.reduce((sum, track) => sum + track.duration_ms, 0) / tracks.length;

  // Rough estimation: if these are top tracks, user has likely listened many times
  // Spotify doesn't provide exact play counts, so this is a very rough estimate
  const estimatedPlays = 50; // Conservative estimate for "top" tracks
  const totalMs = avgDuration * tracks.length * estimatedPlays;

  return Math.round(totalMs / (1000 * 60 * 60)); // Convert to hours
};

/**
 * Transform Spotify API ArtistObject to app's SpotifyArtist type
 */
const transformArtist = (artist: ArtistObject): SpotifyArtist => {
  return {
    id: artist.id,
    name: artist.name,
    image_url: artist.images[0]?.url || 'https://i.pravatar.cc/300',
    genres: artist.genres,
  };
};

/**
 * Transform Spotify API TrackObject to app's SpotifyTrack type
 */
const transformTrack = (track: TrackObject): SpotifyTrack => {
  return {
    id: track.id,
    name: track.name,
    artist: track.artists[0]?.name || 'Unknown Artist',
    preview_url: track.preview_url || '',
    image_url: track.album.images[0]?.url || 'https://i.pravatar.cc/300',
    duration_ms: track.duration_ms,
  };
};

/**
 * Fetch all Spotify data for user profile
 * This combines multiple API calls into a single SpotifyData object
 */
export const fetchAllSpotifyData = async (): Promise<SpotifyData> => {
  try {
    // Fetch data in parallel
    const [userProfile, topArtistsResponse, topTracksResponse] = await Promise.all([
      getCurrentUserProfile(),
      getTopArtists('medium_term', 5),
      getTopTracks('medium_term', 5),
    ]);

    const topArtistsRaw = topArtistsResponse.items;
    const topTracksRaw = topTracksResponse.items;

    // Transform to app types
    const topArtists = topArtistsRaw.map(transformArtist);
    const topTracks = topTracksRaw.map(transformTrack);
    const topGenres = extractTopGenres(topArtistsRaw, 5);
    const totalListeningTime = calculateListeningHours(topTracksRaw);

    // Return data matching app's SpotifyData type
    return {
      id: `spotify_${userProfile.id}`,
      profile_id: userProfile.id,
      spotify_user_id: userProfile.id,
      spotify_username: userProfile.display_name || userProfile.id,
      top_genres: topGenres,
      top_artists: topArtists,
      top_tracks: topTracks,
      total_listening_time: totalListeningTime,
      last_spotify_sync: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching Spotify data:', error);
    throw error;
  }
};

/**
 * Get user's recently played tracks
 * Endpoint: GET /v1/me/player/recently-played
 * Scopes: user-read-recently-played
 *
 * @param limit - Number of tracks to return (max 50, default 20)
 */
export const getRecentlyPlayedTracks = async (limit: number = 20) => {
  return await spotifyFetch(`/me/player/recently-played?limit=${limit}`);
};

/**
 * Get user's currently playing track
 * Endpoint: GET /v1/me/player/currently-playing
 * Scopes: user-read-currently-playing
 */
export const getCurrentlyPlayingTrack = async () => {
  return await spotifyFetch('/me/player/currently-playing');
};
