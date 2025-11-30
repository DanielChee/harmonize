import { API_ENDPOINTS } from '@constants';
import * as SecureStore from 'expo-secure-store';

const CLIENT_ID = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
// WARNING: In a production app, the Client Secret should NEVER be stored on the client.
// It should be behind a backend proxy (e.g., Supabase Edge Function).
// For this MVP/Admin dashboard, we assume it's provided in the env.
const CLIENT_SECRET = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET;

const TOKEN_KEY = 'spotify_app_token';
const TOKEN_EXPIRY_KEY = 'spotify_app_token_expiry';

interface AppTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Get a valid App Access Token (Client Credentials Flow)
 */
export const getAppToken = async (): Promise<string | null> => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('Missing Spotify Client ID or Secret for Client Credentials Flow');
    return null;
  }

  // Check cache
  const cachedToken = await SecureStore.getItemAsync(TOKEN_KEY);
  const expiry = await SecureStore.getItemAsync(TOKEN_EXPIRY_KEY);

  if (cachedToken && expiry && Date.now() < parseInt(expiry, 10)) {
    return cachedToken;
  }

  // Fetch new token
  try {
    const credentials = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const response = await fetch(API_ENDPOINTS.spotify.token, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data: AppTokenResponse = await response.json();

    if (!response.ok) {
      throw new Error('Failed to fetch app token');
    }

    // Cache token
    const expiresAt = Date.now() + data.expires_in * 1000 - 60000; // 1 min buffer
    await SecureStore.setItemAsync(TOKEN_KEY, data.access_token);
    await SecureStore.setItemAsync(TOKEN_EXPIRY_KEY, expiresAt.toString());

    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify App Token:', error);
    return null;
  }
};

/**
 * Public Search for Artists (Images included)
 */
export const searchSpotifyArtistsPublic = async (query: string, limit = 5) => {
  const token = await getAppToken();
  if (!token) return [];

  try {
    const response = await fetch(
      `${API_ENDPOINTS.spotify.base}/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();
    
    // VERIFICATION LOG: Public Artist Search
    const items = data.artists?.items || [];
    console.log(`[Spotify Verify Public] searchSpotifyArtistsPublic query="${query}" found ${items.length} items. Connection Successful.`);
    items.slice(0, 3).forEach((artist: any, i: number) => {
      const imgUrl = artist.images?.[0]?.url || 'No image';
      console.log(`[Spotify Verify Public] Artist ${i+1}: "${artist.name}" -> Image: ${imgUrl}`);
    });

    return items;
  } catch (error) {
    console.error('Public Artist Search Error:', error);
    return [];
  }
};

/**
 * Public Search for Tracks (Images included)
 */
export const searchSpotifyTracksPublic = async (query: string, limit = 5) => {
  const token = await getAppToken();
  if (!token) return [];

  try {
    const response = await fetch(
      `${API_ENDPOINTS.spotify.base}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await response.json();

    // VERIFICATION LOG: Public Track Search
    const items = data.tracks?.items || [];
    console.log(`[Spotify Verify Public] searchSpotifyTracksPublic query="${query}" found ${items.length} items. Connection Successful.`);
    items.slice(0, 3).forEach((track: any, i: number) => {
      const imgUrl = track.album?.images?.[0]?.url || 'No image';
      console.log(`[Spotify Verify Public] Track ${i+1}: "${track.name}" -> Album Image: ${imgUrl}`);
    });

    return items;
  } catch (error) {
    console.error('Public Track Search Error:', error);
    return [];
  }
};
