import { useState, useEffect } from 'react';
import { searchSpotifyArtistsPublic, searchSpotifyTracksPublic } from '@services/spotify/client-credentials';

/**
 * Custom hook to resolve a Spotify image URL with robust fallback.
 * 
 * Strategy:
 * 1. Check if `storedUrl` is provided and valid.
 * 2. If valid, use it.
 * 3. If invalid/missing, search Spotify Web API using `itemName`.
 * 4. If search result has image, use it.
 * 5. If all else fails, return null (caller should handle placeholder).
 * 
 * @param itemName Name of the artist or track (e.g. "Muse" or "Kyoto - Phoebe Bridgers")
 * @param storedUrl The URL stored in the database (optional)
 * @param type 'artist' | 'track'
 */
export function useResolvedSpotifyImage(
  itemName: string,
  storedUrl: string | undefined | null,
  type: 'artist' | 'track'
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper to validate URLs
  const isValid = (url: string | undefined | null): boolean => {
    return !!url && typeof url === 'string' && url.length > 0 && (url.startsWith('http') || url.startsWith('file://'));
  };

  useEffect(() => {
    let isMounted = true;

    const resolveImage = async () => {
      // 1. Check stored URL
      if (isValid(storedUrl)) {
        setImageUrl(storedUrl!);
        return;
      }

      if (!itemName) return;

      setIsLoading(true);
      try {
        // 2. Fallback: Search Spotify
        let resultUrl: string | null = null;

        if (type === 'artist') {
          const results = await searchSpotifyArtistsPublic(itemName, 1);
          if (results && results.length > 0 && results[0].images && results[0].images.length > 0) {
            resultUrl = results[0].images[0].url;
          }
        } else {
          // For tracks, we might need to parse "Song - Artist" if provided in that format
          // But searchSpotifyTracksPublic handles the query string directly
          const results = await searchSpotifyTracksPublic(itemName, 1);
          if (results && results.length > 0 && results[0].album && results[0].album.images && results[0].album.images.length > 0) {
            resultUrl = results[0].album.images[0].url;
          }
        }

        if (isMounted && resultUrl) {
          console.log(`[Image Fallback] Resolved missing image for ${itemName} -> ${resultUrl}`);
          setImageUrl(resultUrl);
        }
      } catch (err) {
        console.warn(`[Image Fallback] Failed to resolve image for ${itemName}`, err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    resolveImage();

    return () => {
      isMounted = false;
    };
  }, [itemName, storedUrl, type]);

  return { imageUrl, isLoading };
}
