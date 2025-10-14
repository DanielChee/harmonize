// Spotify OAuth Authentication with PKCE
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import { API_ENDPOINTS, SPOTIFY_SCOPES } from '@constants';
import type { SpotifyTokenResponse, StoredSpotifyTokens } from '../../types/spotify-types';

// Enable web browser dismissal on Android
WebBrowser.maybeCompleteAuthSession();

// Secure storage keys
const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  EXPIRES_AT: 'spotify_expires_at',
} as const;

/**
 * Get Spotify Client ID from environment
 */
export const getClientId = (): string => {
  const clientId = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID;
  if (!clientId) {
    throw new Error('EXPO_PUBLIC_SPOTIFY_CLIENT_ID is not set in environment variables');
  }
  return clientId;
};

/**
 * Get redirect URI for OAuth flow
 */
export const getRedirectUri = (): string => {
  const envUri = process.env.EXPO_PUBLIC_SPOTIFY_REDIRECT_URI;
  if (envUri) return envUri;

  // Fallback to dynamic generation
  return AuthSession.makeRedirectUri({
    scheme: 'exp',
    path: 'spotify-callback'
  });
};

/**
 * Generate a random code verifier for PKCE
 */
const generateCodeVerifier = (): string => {
  // Generate 32 random bytes and encode as base64url
  const randomBytes = Crypto.getRandomBytes(32);
  return base64URLEncode(randomBytes);
};

/**
 * Generate code challenge from verifier
 */
const generateCodeChallenge = async (verifier: string): Promise<string> => {
  // Hash the verifier with SHA-256
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    verifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );

  // Convert base64 to base64url format
  return digest
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Base64 URL encode (without padding)
 */
const base64URLEncode = (buffer: Uint8Array): string => {
  // Convert Uint8Array to base64
  const bytes = Array.from(buffer);
  const binary = String.fromCharCode(...bytes);
  const base64 = btoa(binary);

  // Convert to base64url format
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Initiate Spotify OAuth flow with PKCE
 */
export const authorizeWithSpotify = async (): Promise<SpotifyTokenResponse> => {
  try {
    const clientId = getClientId();
    const redirectUri = getRedirectUri();
    console.log('🔗 Using redirect URI:', redirectUri);

    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Build authorization URL
    const authUrl = new URL(API_ENDPOINTS.spotify.auth);
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', SPOTIFY_SCOPES.join(' '));
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('state', generateRandomState());

    // Open browser for user authorization
    const result = await WebBrowser.openAuthSessionAsync(
      authUrl.toString(),
      redirectUri
    );

    if (result.type !== 'success') {
      throw new Error('Authorization failed or was cancelled');
    }

    // Extract authorization code from URL
    const url = new URL(result.url);
    const code = url.searchParams.get('code');
    if (!code) {
      throw new Error('No authorization code received');
    }

    // Exchange code for tokens
    const tokenResponse = await exchangeCodeForTokens(code, codeVerifier, redirectUri);

    // Store tokens securely
    await storeTokens(tokenResponse);

    return tokenResponse;
  } catch (error) {
    console.error('Spotify authorization error:', error);
    throw error;
  }
};

/**
 * Exchange authorization code for access and refresh tokens
 */
const exchangeCodeForTokens = async (
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<SpotifyTokenResponse> => {
  const clientId = getClientId();

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  });

  const response = await fetch(API_ENDPOINTS.spotify.token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
  }

  return await response.json();
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string): Promise<SpotifyTokenResponse> => {
  const clientId = getClientId();

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const response = await fetch(API_ENDPOINTS.spotify.token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Token refresh failed: ${errorData.error_description || errorData.error}`);
  }

  const tokenResponse = await response.json();

  // Store updated tokens
  await storeTokens(tokenResponse, refreshToken);

  return tokenResponse;
};

/**
 * Store tokens in secure storage
 */
export const storeTokens = async (
  tokenResponse: SpotifyTokenResponse,
  existingRefreshToken?: string
): Promise<void> => {
  const expiresAt = Date.now() + tokenResponse.expires_in * 1000;

  await SecureStore.setItemAsync(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, tokenResponse.access_token);
  await SecureStore.setItemAsync(TOKEN_STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());

  // Spotify doesn't always return a new refresh token
  const refreshToken = tokenResponse.refresh_token || existingRefreshToken;
  if (refreshToken) {
    await SecureStore.setItemAsync(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
};

/**
 * Get stored tokens from secure storage
 */
export const getStoredTokens = async (): Promise<StoredSpotifyTokens | null> => {
  try {
    const accessToken = await SecureStore.getItemAsync(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = await SecureStore.getItemAsync(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
    const expiresAtStr = await SecureStore.getItemAsync(TOKEN_STORAGE_KEYS.EXPIRES_AT);

    if (!accessToken || !refreshToken || !expiresAtStr) {
      return null;
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: parseInt(expiresAtStr, 10),
    };
  } catch (error) {
    console.error('Error retrieving stored tokens:', error);
    return null;
  }
};

/**
 * Check if access token is expired
 */
export const isTokenExpired = (expiresAt: number): boolean => {
  // Add 5 minute buffer
  return Date.now() >= expiresAt - 5 * 60 * 1000;
};

/**
 * Get valid access token (refresh if needed)
 */
export const getValidAccessToken = async (): Promise<string | null> => {
  const tokens = await getStoredTokens();

  if (!tokens) {
    return null;
  }

  // Check if token is expired
  if (isTokenExpired(tokens.expiresAt)) {
    try {
      const newTokens = await refreshAccessToken(tokens.refreshToken);
      return newTokens.access_token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Clear invalid tokens
      await clearTokens();
      return null;
    }
  }

  return tokens.accessToken;
};

/**
 * Clear all stored tokens
 */
export const clearTokens = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
  await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEYS.EXPIRES_AT);
};

/**
 * Check if user is authenticated with Spotify
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getValidAccessToken();
  return token !== null;
};

/**
 * Generate random state for CSRF protection
 */
const generateRandomState = (): string => {
  const randomBytes = Crypto.getRandomBytes(16);
  return base64URLEncode(randomBytes);
};
