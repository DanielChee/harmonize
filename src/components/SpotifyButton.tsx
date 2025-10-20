// SpotifyButton Component - Connect to Spotify
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '@constants';
import { authorizeWithSpotify, fetchAllSpotifyData, isAuthenticated } from '@services/spotify';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { SpotifyData } from '@types';

interface SpotifyButtonProps {
  onSuccess?: (data: SpotifyData) => void;
  onError?: (error: Error) => void;
  style?: any;
}

export const SpotifyButton: React.FC<SpotifyButtonProps> = ({ onSuccess, onError, style }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await isAuthenticated();
      setIsConnected(authenticated);

      // If already authenticated, fetch and pass data to parent
      if (authenticated && onSuccess) {
        try {
          const spotifyData = await fetchAllSpotifyData();
          onSuccess(spotifyData);
        } catch (err) {
          console.error('Error fetching existing Spotify data:', err);
        }
      }
    } catch (err) {
      console.error('Error checking auth status:', err);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Start OAuth flow
      await authorizeWithSpotify();

      // Fetch user's Spotify data
      const spotifyData = await fetchAllSpotifyData();

      setIsConnected(true);
      onSuccess?.(spotifyData);
    } catch (err) {
      const error = err as Error;
      console.error('Spotify connection error:', error);
      setError(error.message || 'Failed to connect to Spotify');
      onError?.(error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (isConnected) {
    return (
      <View style={[styles.container, styles.connectedContainer, style]}>
        <View style={styles.connectedIndicator} />
        <Text style={styles.connectedText}>Spotify Connected</Text>
      </View>
    );
  }

  return (
    <View style={style}>
      <TouchableOpacity
        style={[styles.button, isConnecting && styles.buttonDisabled]}
        onPress={handleConnect}
        disabled={isConnecting}
        activeOpacity={0.8}
      >
        {isConnecting ? (
          <ActivityIndicator color={COLORS.text.inverse} />
        ) : (
          <>
            <View style={styles.spotifyIcon}>
              <Text style={styles.spotifyIconText}>♫</Text>
            </View>
            <Text style={styles.buttonText}>Connect Spotify</Text>
          </>
        )}
      </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.spotify.green,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.pill,
    gap: SPACING.sm,
    ...SHADOWS.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...TYPOGRAPHY.scale.button,
    color: COLORS.text.inverse,
  },
  spotifyIcon: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.text.inverse,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotifyIconText: {
    fontSize: 16,
    color: COLORS.spotify.green,
    fontWeight: 'bold',
  },
  connectedContainer: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  connectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.circle,
    backgroundColor: COLORS.success,
    marginRight: SPACING.sm,
  },
  connectedText: {
    ...TYPOGRAPHY.scale.body,
    color: COLORS.success,
    fontWeight: '600',
  },
  errorText: {
    ...TYPOGRAPHY.scale.caption,
    color: COLORS.error,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
});
