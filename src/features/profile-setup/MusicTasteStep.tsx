/**
 * Step 2: Music Taste
 * Collects top genres, top artists, and top songs
 * Can auto-populate from Spotify if connected, or allow manual input
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, MUSIC_GENRES } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import { SpotifyButton } from '@components/SpotifyButton';
import { fetchAllSpotifyData, searchArtists, searchTracks, isAuthenticated, logoutFromSpotify } from '@services/spotify';
import { useUserStore } from '@store';
import type { SpotifyData } from '@types';
import { Input } from '@components/common/Input';
import { uploadSpotifyImageBatch } from '@services/supabase/storage';

interface MusicTasteStepProps {
  formData: {
    top_genres: string[];
    top_artists: string[];
    top_songs: string[];
    artist_images: { name: string; url: string }[];
    song_images: { name: string; url: string }[];
    sprint_5_variant?: 'variant_a' | 'variant_b';
  };
  updateFormData: (updates: Partial<MusicTasteStepProps['formData']>) => void;
}

const MAX_GENRES = 5;
const MAX_ARTISTS = 5;
const MAX_SONGS = 5;


export const MusicTasteStep: React.FC<MusicTasteStepProps> = ({
  formData,
  updateFormData,
}) => {
  const { session } = useUserStore();
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_spotifyData, _setSpotifyData] = useState<SpotifyData | null>(null);

  // Manual input states
  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    artists: { id: string; name: string; image_url?: string }[];
    tracks: { id: string; name: string; artist: string; image_url?: string }[];
  }>({ artists: [], tracks: [] });
  const [isSearching, setIsSearching] = useState(false);

  const handleSpotifyError = (error: any) => {
    console.error('Spotify connection error:', error);
  };

  // Store image URLs for artists and songs
  // We initialize from formData if available
  const [artistImages, setArtistImages] = useState<Record<string, string>>({});
  const [songImages, setSongImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const images: Record<string, string> = {};
    formData.artist_images?.forEach(img => {
      images[img.name] = img.url;
    });
    setArtistImages(images);
  }, [formData.artist_images]);

  useEffect(() => {
    const images: Record<string, string> = {};
    formData.song_images?.forEach(img => {
      images[img.name] = img.url;
    });
    setSongImages(images);
  }, [formData.song_images]);

  // Check if Spotify is already connected
  useEffect(() => {
    checkSpotifyConnection();
  }, []);

  const checkSpotifyConnection = async () => {
    try {
      const connected = await isAuthenticated();
      setIsSpotifyConnected(connected);
    } catch {
      setIsSpotifyConnected(false);
    }
  };

  const processSpotifyData = useCallback(async (data: SpotifyData) => {
    const userId = session?.user?.id;
    if (!userId) return;

    setIsUploadingImages(true);

    // Auto-populate form with Spotify data
    const genresToSet = data.top_genres?.slice(0, MAX_GENRES) || [];
    const artists = data.top_artists.slice(0, MAX_ARTISTS);
    const tracks = data.top_tracks.slice(0, MAX_SONGS);

    // Prepare items for upload (name, url)
    const artistItems = artists.map(a => ({ name: a.name, url: a.image_url || '' }));
    const songItems = tracks.map(t => ({ name: `${t.name} - ${t.artist}`, url: t.image_url || '' }));

    // VERIFICATION LOG
    console.log(`[UI Verify] Auto-populating from Spotify. Artists: ${artists.length}, Tracks: ${tracks.length}`);
    console.log('[UI Verify] Uploading images to Supabase...');

    // Batch Upload to Supabase Storage
    const [uploadedArtists, uploadedSongs] = await Promise.all([
      uploadSpotifyImageBatch(artistItems, userId, 'artists'),
      uploadSpotifyImageBatch(songItems, userId, 'songs')
    ]);

    console.log('[UI Verify] Upload complete. Updating Form Data with Supabase URLs.');

    // Update Form Data with Supabase URLs
    updateFormData({
      top_genres: genresToSet,
      top_artists: artists.map(a => a.name),
      top_songs: tracks.map(t => `${t.name} - ${t.artist}`),
      artist_images: uploadedArtists, // Use the uploaded URLs
      song_images: uploadedSongs,     // Use the uploaded URLs
      sprint_5_variant: 'variant_b',
    });

    // Update local UI state
    const newArtistImages: Record<string, string> = {};
    uploadedArtists.forEach(item => {
        if (item.url) newArtistImages[item.name] = item.url;
    });
    setArtistImages(newArtistImages);

    const newSongImages: Record<string, string> = {};
    uploadedSongs.forEach(item => {
        if (item.url) newSongImages[item.name] = item.url;
    });
    setSongImages(newSongImages);

    setIsUploadingImages(false);
  }, [session?.user?.id, updateFormData]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadSpotifyData = useCallback(async () => {
    try {
      setIsLoadingSpotify(true);
      const data = await fetchAllSpotifyData();
      _setSpotifyData(data); // Changed from setSpotifyData
      await processSpotifyData(data);

    } catch (error) {
      console.error("Error loading Spotify data:", error);
      setIsSpotifyConnected(false);
    } finally {
      setIsLoadingSpotify(false);
    }
  }, [processSpotifyData]);

  const handleSpotifySuccess = useCallback(async (data: SpotifyData) => {
    _setSpotifyData(data); // Changed from setSpotifyData
    setIsSpotifyConnected(true);
    setIsLoadingSpotify(true); // Show loading while processing/uploading
    
    try {
        await processSpotifyData(data);
    } catch (error) {
        console.error("Error processing Spotify data:", error);
    } finally {
        setIsLoadingSpotify(false);
    }
  }, [processSpotifyData]);

  const handleDisconnect = async () => {
    await logoutFromSpotify();
    setIsSpotifyConnected(false);
    _setSpotifyData(null);
    updateFormData({
      top_genres: [],
      top_artists: [],
      top_songs: [],
      artist_images: [],
      song_images: [],
      sprint_5_variant: 'variant_a',
    });
  };



  // Search for artists using Spotify API
  const searchForArtists = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults(prev => ({ ...prev, artists: [] }));
      return;
    }

    try {
      setIsSearching(true);
      // Use fallback=true to allow public search without user login
      const results = await searchArtists(query, 10, true);
      const formattedArtists = results.items.map(artist => {
        const imgUrl = artist.images?.[0]?.url;
        // VERIFICATION LOG
        console.log(`[UI Verify] Artist Search Result: "${artist.name}" -> Image: ${imgUrl || 'None'}`);
        return {
          id: artist.id,
          name: artist.name,
          image_url: imgUrl,
        };
      });
      setSearchResults(prev => ({ ...prev, artists: formattedArtists }));
    } catch (error) {
      console.error("Error searching artists:", error);
      setSearchResults(prev => ({ ...prev, artists: [] }));
    } finally {
      setIsSearching(false);
    }
  }, [setIsSearching]);

  // Search for tracks using Spotify API
  const searchForTracks = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults(prev => ({ ...prev, tracks: [] }));
      return;
    }

    try {
      setIsSearching(true);
      // Use fallback=true to allow public search without user login
      const results = await searchTracks(query, undefined, 10, true);
      const formattedTracks = results.items.map(track => {
        const imgUrl = track.album?.images?.[0]?.url;
        // VERIFICATION LOG
        console.log(`[UI Verify] Track Search Result: "${track.name}" -> Image: ${imgUrl || 'None'}`);
        return {
          id: track.id,
          name: track.name,
          artist: track.artists[0]?.name || 'Unknown Artist',
          image_url: imgUrl,
        };
      });
      setSearchResults(prev => ({ ...prev, tracks: formattedTracks }));
    } catch (error) {
      console.error("Error searching tracks:", error);
      setSearchResults(prev => ({ ...prev, tracks: [] }));
    } finally {
      setIsSearching(false);
    }
  }, [setIsSearching]);

  const toggleGenre = (genre: string) => {
    const current = formData.top_genres || [];
    // Case-insensitive check for existing genre
    const existingIndex = current.findIndex(g => g.toLowerCase() === genre.toLowerCase());
    if (existingIndex >= 0) {
      // Remove genre (case-insensitive)
      updateFormData({ top_genres: current.filter((_, index) => index !== existingIndex) });
    } else if (current.length < MAX_GENRES) {
      // Add genre (use the exact case from the parameter)
      updateFormData({
        top_genres: [...current, genre],
        sprint_5_variant: 'variant_a',
      });
    }
  };

  const addArtist = (artistName: string, imageUrl?: string) => {
    const current = formData.top_artists || [];
    const currentImages = formData.artist_images || [];

    if (!current.includes(artistName) && current.length < MAX_ARTISTS) {
      updateFormData({
        top_artists: [...current, artistName],
        artist_images: [...currentImages, { name: artistName, url: imageUrl || '' }],
        sprint_5_variant: 'variant_a',
      });
      // Store image URL if provided
      if (imageUrl) {
        setArtistImages(prev => ({ ...prev, [artistName]: imageUrl }));
      }
    }
    setArtistSearchQuery('');
    setSearchResults(prev => ({ ...prev, artists: [] }));
  };

  const removeArtist = (artistName: string) => {
    const current = formData.top_artists || [];
    const currentImages = formData.artist_images || [];

    updateFormData({ 
        top_artists: current.filter(a => a !== artistName),
        artist_images: currentImages.filter(img => img.name !== artistName),
    });
    // Remove image URL
    setArtistImages(prev => {
      const updated = { ...prev };
      delete updated[artistName];
      return updated;
    });
  };

  const addSong = (songName: string, artistName: string, imageUrl?: string) => {
    const songString = `${songName} - ${artistName}`;
    const current = formData.top_songs || [];
    const currentImages = formData.song_images || [];

    if (!current.includes(songString) && current.length < MAX_SONGS) {
      updateFormData({
        top_songs: [...current, songString],
        song_images: [...currentImages, { name: songString, url: imageUrl || '' }],
        sprint_5_variant: 'variant_a',
      });
      // Store image URL if provided
      if (imageUrl) {
        setSongImages(prev => ({ ...prev, [songString]: imageUrl }));
      }
    }
    setTrackSearchQuery('');
    setSearchResults(prev => ({ ...prev, tracks: [] }));
  };

  const removeSong = (songString: string) => {
    const current = formData.top_songs || [];
    const currentImages = formData.song_images || [];

    updateFormData({ 
        top_songs: current.filter(s => s !== songString),
        song_images: currentImages.filter(img => img.name !== songString),
    });
    // Remove image URL
    setSongImages(prev => {
      const updated = { ...prev };
      delete updated[songString];
      return updated;
    });
  };

  // Debounced search - search in both manual and Spotify modes if authenticated
  useEffect(() => {
    if (artistSearchQuery && (formData.top_artists?.length || 0) < MAX_ARTISTS) {
      const timeout = setTimeout(() => {
        searchForArtists(artistSearchQuery);
      }, 500);
      return () => clearTimeout(timeout);
    } else if ((formData.top_artists?.length || 0) >= MAX_ARTISTS) {
      // Clear search results if max reached
      setSearchResults(prev => ({ ...prev, artists: [] }));
      setArtistSearchQuery('');
    }
  }, [artistSearchQuery, formData.top_artists, searchForArtists]);

  useEffect(() => {
    if (trackSearchQuery && (formData.top_songs?.length || 0) < MAX_SONGS) {
      const timeout = setTimeout(() => {
        searchForTracks(trackSearchQuery);
      }, 500);
      return () => clearTimeout(timeout);
    } else if ((formData.top_songs?.length || 0) >= MAX_SONGS) {
      // Clear search results if max reached
      setSearchResults(prev => ({ ...prev, tracks: [] }));
      setTrackSearchQuery('');
    }
  }, [trackSearchQuery, formData.top_songs, searchForTracks]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.description}>
        Share your music taste to help us match you with people who love the same music!
      </Text>

      {/* Spotify Button as an optional action */}
      {!isSpotifyConnected ? (
         <View style={styles.spotifySection}>
            <Text style={styles.spotifyDescription}>
              Optional: Connect your Spotify account to auto-fill this section.
            </Text>
            {isLoadingSpotify ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.loadingText}>
                        {isUploadingImages ? 'Securely saving images...' : 'Connecting to Spotify...'}
                    </Text>
                </View>
            ) : (
                <SpotifyButton
                  onSuccess={handleSpotifySuccess}
                  onError={handleSpotifyError}
                />
            )}
        </View>
      ) : (
        <View style={styles.spotifySection}>
          <View style={styles.connectedHeader}>
            <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
            <Text style={styles.connectedText}>Spotify Connected</Text>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
            >
              <Text style={styles.disconnectText}>Disconnect</Text>
            </TouchableOpacity>
          </View>
          {isUploadingImages && (
             <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Securely saving images...</Text>
             </View>
          )}
        </View>
      )}




      {/* Top Genres */}
      <View style={styles.section}>
        <Text style={styles.label}>
          Top Genres ({formData.top_genres?.length || 0}/{MAX_GENRES})
        </Text>
        <Text style={styles.subLabel}>
          Select up to {MAX_GENRES} genres that best fit your taste.
        </Text>

        <View style={styles.genresGrid}>
          {MUSIC_GENRES.map((genre) => {
            // Case-insensitive check for selected
            const selected = formData.top_genres?.some(
              (g) => g.toLowerCase() === genre.toLowerCase()
            ) || false;
            return (
              <TouchableOpacity
                key={genre}
                style={[styles.genreChip, selected && styles.genreChipSelected]}
                onPress={() => toggleGenre(genre)}
                activeOpacity={0.7}
              >
                <Text style={[styles.genreChipText, selected && styles.genreChipTextSelected]}>
                  {genre}
                </Text>
                {selected && (
                  <MaterialIcons name="check" size={16} color={COLORS.text.inverse} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Top Artists */}
      <View style={styles.section}>
        <Text style={styles.label}>
          Top Artists ({formData.top_artists?.length || 0}/{MAX_ARTISTS})
        </Text>
        <Text style={styles.subLabel}>
          Add up to {MAX_ARTISTS} artists.
        </Text>

        {/* Selected Artists */}
        {formData.top_artists && formData.top_artists.length > 0 && (
          <View style={styles.selectedItems}>
            {formData.top_artists.map((artist, index) => {
              // Look up image from stored images
              const artistImage = artistImages[artist];

              return (
                <View key={index} style={styles.selectedItem}>
                  {artistImage ? (
                    <Image
                      source={{ uri: artistImage }}
                      style={styles.selectedItemImage}
                    />
                  ) : (
                    <MaterialIcons name="person" size={18} color={COLORS.primary} />
                  )}
                  <Text style={styles.selectedItemText}>{artist}</Text>
                  <TouchableOpacity
                    onPress={() => removeArtist(artist)}
                    style={styles.removeButton}
                  >
                    <MaterialIcons name="close" size={18} color={COLORS.text.secondary} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Artist Search */}
        {(formData.top_artists?.length || 0) < MAX_ARTISTS ? (
          <View>
            <Input
              placeholder="Search for artists..."
              value={artistSearchQuery}
              onChangeText={setArtistSearchQuery}
              leftIcon={<MaterialIcons name="search" size={20} color={COLORS.text.secondary} />}
              onSubmitEditing={() => {
                // No manual fallback needed anymore, but keep if search fails?
                // For now, rely on search.
              }}
              returnKeyType="done"
            />
            {isSearching && (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.searchLoader} />
            )}
            {searchResults.artists.length > 0 && (
              <View style={styles.searchResults}>
                {searchResults.artists.slice(0, 5).map((artist) => (
                  <TouchableOpacity
                    key={artist.id}
                    style={styles.searchResultItem}
                    onPress={() => addArtist(artist.name, artist.image_url)}
                  >
                    {artist.image_url && (
                      <Image source={{ uri: artist.image_url }} style={styles.artistImage} />
                    )}
                    <Text style={styles.searchResultText}>{artist.name}</Text>
                    <MaterialIcons name="add-circle" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.maxReachedContainer}>
            <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
            <Text style={styles.maxReachedText}>Maximum artists reached</Text>
          </View>
        )}
      </View>

      {/* Top Songs */}
      <View style={styles.section}>
        <Text style={styles.label}>
          Top Songs ({formData.top_songs?.length || 0}/{MAX_SONGS})
        </Text>
        <Text style={styles.subLabel}>
          Add up to {MAX_SONGS} songs.
        </Text>

        {/* Selected Songs */}
        {formData.top_songs && formData.top_songs.length > 0 && (
          <View style={styles.selectedItems}>
            {formData.top_songs.map((song, index) => {
              // Look up image from stored images
              const trackImage = songImages[song];

              return (
                <View key={index} style={styles.selectedItem}>
                  {trackImage ? (
                    <Image
                      source={{ uri: trackImage }}
                      style={styles.selectedItemImageSquare}
                    />
                  ) : (
                    <MaterialIcons name="music-note" size={18} color={COLORS.primary} />
                  )}
                  <Text style={styles.selectedItemText}>{song}</Text>
                  <TouchableOpacity
                    onPress={() => removeSong(song)}
                    style={styles.removeButton}
                  >
                    <MaterialIcons name="close" size={18} color={COLORS.text.secondary} />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Track Search */}
        {(formData.top_songs?.length || 0) < MAX_SONGS ? (
          <View>
            <Input
              placeholder="Search for songs..."
              value={trackSearchQuery}
              onChangeText={setTrackSearchQuery}
              leftIcon={<MaterialIcons name="search" size={20} color={COLORS.text.secondary} />}
              onSubmitEditing={() => {
                 // No manual fallback needed
              }}
              returnKeyType="done"
            />
            {isSearching && (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.searchLoader} />
            )}
            {searchResults.tracks.length > 0 && (
              <View style={styles.searchResults}>
                {searchResults.tracks.slice(0, 5).map((track) => (
                  <TouchableOpacity
                    key={track.id}
                    style={styles.searchResultItem}
                    onPress={() => addSong(track.name, track.artist, track.image_url)}
                  >
                    {track.image_url && (
                      <Image source={{ uri: track.image_url }} style={styles.trackImage} />
                    )}
                    <View style={styles.trackInfo}>
                      <Text style={styles.searchResultText} numberOfLines={1}>
                        {track.name}
                      </Text>
                      <Text style={styles.trackArtist} numberOfLines={1}>
                        {track.artist}
                      </Text>
                    </View>
                    <MaterialIcons name="add-circle" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.maxReachedContainer}>
            <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
            <Text style={styles.maxReachedText}>Maximum songs reached</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  modeButtonText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  modeButtonTextActive: {
    color: COLORS.text.inverse,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  spotifySection: {
    marginBottom: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  spotifyDescription: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  connectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  connectedText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.semibold,
    flex: 1,
  },
  disconnectButton: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  disconnectText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.error,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  spotifyDataInfo: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  spotifyDataText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.xs,
  },
  spotifyNote: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  importedGenres: {
    marginBottom: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  importedLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginBottom: SPACING.sm,
  },
  importedGenreChip: {
    borderStyle: 'dashed',
  },
  genresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  genreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  genreChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genreChipText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  genreChipTextSelected: {
    color: COLORS.text.inverse,
  },
  genreChipReadOnly: {
    opacity: 0.8,
  },
  selectedItems: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedItemImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  selectedItemImageSquare: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  selectedItemText: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
  },
  removeButton: {
    padding: SPACING.xs,
  },
  searchResults: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
    maxHeight: 200,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  artistImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  trackImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  trackInfo: {
    flex: 1,
  },
  searchResultText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  trackArtist: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  searchLoader: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  maxReachedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.success,
  },
  maxReachedText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.success,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

