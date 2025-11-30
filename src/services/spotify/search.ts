import { API_ENDPOINTS } from '@constants';
import type { ArtistObject, TrackObject, PagingObject } from '../../types/spotify-types';
import { getValidAccessToken } from './auth';
import { getAppToken } from './client-credentials';

/**
 * Make authenticated search request to Spotify API
 */
const spotifySearchFetch = async <T>(
  endpoint: string,
  params: Record<string, string>,
  useAppTokenFallback: boolean = false // Added flag
): Promise<T> => {
  let accessToken: string | null = null;

  // Try user token first
  try {
    accessToken = await getValidAccessToken();
  } catch (userTokenError) {
    console.warn("User token not available for search. Falling back to app token if allowed.", userTokenError);
  }

  // If no user token and fallback is allowed, try app token
  if (!accessToken && useAppTokenFallback) {
    try {
      accessToken = await getAppToken();
    } catch (appTokenError) {
      console.warn("App token not available for search.", appTokenError);
    }
  }

  if (!accessToken) {
    throw new Error('No valid access token (user or app) available for Spotify API request');
  }

  const queryString = new URLSearchParams(params).toString();
  const url = `${API_ENDPOINTS.spotify.base}${endpoint}?${queryString}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Spotify Search API error: ${response.status} - ${errorData.error?.message || response.statusText}`
    );
  }

  return await response.json();
};

/**
 * Search for artists by name
 * Endpoint: GET /v1/search?type=artist
 *
 * @param query - Artist name to search for
 * @param limit - Number of results (max 50, default 5)
 * @param useAppTokenFallback - Whether to fall back to app token if user token is not available
 * @returns Artist search results
 */
export const searchArtists = async (
  query: string,
  limit: number = 5,
  useAppTokenFallback: boolean = false
): Promise<PagingObject<ArtistObject>> => {
  const result = await spotifySearchFetch<{ artists: PagingObject<ArtistObject> }>(
    '/search',
    {
      q: query,
      type: 'artist',
      limit: limit.toString(),
    },
    useAppTokenFallback
  );

  // VERIFICATION LOG: Spotify Artist Images
  console.log(`[Spotify Verify] searchArtists query="${query}" found ${result.artists.items.length} items. Connection Successful.`);
  result.artists.items.slice(0, 3).forEach((artist, i) => {
    const imgUrl = artist.images && artist.images.length > 0 ? artist.images[0].url : 'No image';
    console.log(`[Spotify Verify] Artist ${i + 1}: "${artist.name}" -> Image: ${imgUrl}`);
  });

  return result.artists;
};

/**
 * Get specific artist by ID
 * Endpoint: GET /v1/artists/{id}
 *
 * @param artistId - Spotify artist ID
 * @param useAppTokenFallback - Whether to fall back to app token if user token is not available
 * @returns Artist object with images
 */
export const getArtist = async (artistId: string, useAppTokenFallback: boolean = false): Promise<ArtistObject> => {
  let accessToken: string | null = null;

  try {
    accessToken = await getValidAccessToken();
  } catch (userTokenError) {
    console.warn("User token not available for getArtist. Falling back to app token if allowed.", userTokenError);
  }

  if (!accessToken && useAppTokenFallback) {
    try {
      accessToken = await getAppToken();
    } catch (appTokenError) {
      console.warn("App token not available for getArtist.", appTokenError);
    }
  }

  if (!accessToken) {
    throw new Error('No valid access token (user or app) available for Spotify API request');
  }

  const response = await fetch(`${API_ENDPOINTS.spotify.base}/artists/${artistId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch artist: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Search for tracks by name and optional artist
 * Endpoint: GET /v1/search?type=track
 *
 * @param trackName - Track name to search for
 * @param artistName - Optional artist name to narrow search
 * @param limit - Number of results (max 50, default 5)
 * @param useAppTokenFallback - Whether to fall back to app token if user token is not available
 * @returns Track search results
 */
export const searchTracks = async (
  trackName: string,
  artistName?: string,
  limit: number = 5,
  useAppTokenFallback: boolean = false
): Promise<PagingObject<TrackObject>> => {
  const query = artistName ? `${trackName} artist:${artistName}` : trackName;

  const result = await spotifySearchFetch<{ tracks: PagingObject<TrackObject> }>(
    '/search',
    {
      q: query,
      type: 'track',
      limit: limit.toString(),
    },
    useAppTokenFallback
  );

  // VERIFICATION LOG: Spotify Track Images
  console.log(`[Spotify Verify] searchTracks query="${query}" found ${result.tracks.items.length} items. Connection Successful.`);
  result.tracks.items.slice(0, 3).forEach((track, i) => {
    const imgUrl = track.album?.images && track.album.images.length > 0 ? track.album.images[0].url : 'No image';
    console.log(`[Spotify Verify] Track ${i + 1}: "${track.name}" -> Album Image: ${imgUrl}`);
  });

  return result.tracks;
};

/**
 * Get specific track by ID
 * Endpoint: GET /v1/tracks/{id}
 *
 * @param trackId - Spotify track ID
 * @param useAppTokenFallback - Whether to fall back to app token if user token is not available
 * @returns Track object with album art
 */
export const getTrack = async (trackId: string, useAppTokenFallback: boolean = false): Promise<TrackObject> => {
  let accessToken: string | null = null;

  try {
    accessToken = await getValidAccessToken();
  } catch (userTokenError) {
    console.warn("User token not available for getTrack. Falling back to app token if allowed.", userTokenError);
  }

  if (!accessToken && useAppTokenFallback) {
    try {
      accessToken = await getAppToken();
    } catch (appTokenError) {
      console.warn("App token not available for getTrack.", appTokenError);
    }
  }

  if (!accessToken) {
    throw new Error('No valid access token (user or app) available for Spotify API request');
  }

  const response = await fetch(`${API_ENDPOINTS.spotify.base}/tracks/${trackId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch track: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Fetch artist data by name (convenience function)
 * Searches for artist and returns the first match with images
 *
 * @param artistName - Name of artist to search
 * @param useAppTokenFallback - Whether to fall back to app token if user token is not available
 * @returns Artist object or null if not found
 */
export const fetchArtistByName = async (artistName: string, useAppTokenFallback: boolean = false): Promise<ArtistObject | null> => {
  try {
    const results = await searchArtists(artistName, 1, useAppTokenFallback);
    return results.items[0] || null;
  } catch (error) {
    console.error(`Error fetching artist "${artistName}":`, error);
    return null;
  }
};

/**
 * Fetch track data by name and artist (convenience function)
 * Searches for track and returns the first match with album art
 *
 * @param trackName - Name of track to search
 * @param artistName - Optional artist name to narrow search
 * @param useAppTokenFallback - Whether to fall back to app token if user token is not available
 * @returns Track object or null if not found
 */
export const fetchTrackByName = async (
  trackName: string,
  artistName: string,
  useAppTokenFallback: boolean = false
): Promise<TrackObject | null> => {
  try {
    const results = await searchTracks(trackName, artistName, 1, useAppTokenFallback);
    return results.items[0] || null;
  } catch (error) {
    console.error(`Error fetching track "${trackName}" by ${artistName}:`, error);
    return null;
  }
};
