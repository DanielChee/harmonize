// Spotify Search API
// Functions for searching artists, tracks, and fetching specific items

import { API_ENDPOINTS } from '@constants';
import type { ArtistObject, TrackObject, PagingObject } from '../../types/spotify-types';
import { getValidAccessToken } from './auth';

/**
 * Make authenticated search request to Spotify API
 */
const spotifySearchFetch = async <T>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> => {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('No valid access token');

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
 * @returns Artist search results
 */
export const searchArtists = async (
  query: string,
  limit: number = 5
): Promise<PagingObject<ArtistObject>> => {
  const result = await spotifySearchFetch<{ artists: PagingObject<ArtistObject> }>(
    '/search',
    {
      q: query,
      type: 'artist',
      limit: limit.toString(),
    }
  );
  return result.artists;
};

/**
 * Get specific artist by ID
 * Endpoint: GET /v1/artists/{id}
 *
 * @param artistId - Spotify artist ID
 * @returns Artist object with images
 */
export const getArtist = async (artistId: string): Promise<ArtistObject> => {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('No valid access token');

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
 * @returns Track search results
 */
export const searchTracks = async (
  trackName: string,
  artistName?: string,
  limit: number = 5
): Promise<PagingObject<TrackObject>> => {
  const query = artistName ? `${trackName} artist:${artistName}` : trackName;

  const result = await spotifySearchFetch<{ tracks: PagingObject<TrackObject> }>(
    '/search',
    {
      q: query,
      type: 'track',
      limit: limit.toString(),
    }
  );
  return result.tracks;
};

/**
 * Get specific track by ID
 * Endpoint: GET /v1/tracks/{id}
 *
 * @param trackId - Spotify track ID
 * @returns Track object with album art
 */
export const getTrack = async (trackId: string): Promise<TrackObject> => {
  const accessToken = await getValidAccessToken();
  if (!accessToken) throw new Error('No valid access token');

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
 * @returns Artist object or null if not found
 */
export const fetchArtistByName = async (artistName: string): Promise<ArtistObject | null> => {
  try {
    const results = await searchArtists(artistName, 1);
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
 * @param artistName - Artist name to narrow search
 * @returns Track object or null if not found
 */
export const fetchTrackByName = async (
  trackName: string,
  artistName: string
): Promise<TrackObject | null> => {
  try {
    const results = await searchTracks(trackName, artistName, 1);
    return results.items[0] || null;
  } catch (error) {
    console.error(`Error fetching track "${trackName}" by ${artistName}:`, error);
    return null;
  }
};
