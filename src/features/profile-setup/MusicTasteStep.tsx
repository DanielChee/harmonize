/**
 * Step 2: Music Taste
 * Collects top genres, top artists, and top songs
 * Can auto-populate from Spotify if connected, or allow manual input
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, MUSIC_GENRES } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';
import { SpotifyButton } from '@components/SpotifyButton';
import { fetchAllSpotifyData, searchArtists, searchTracks, isAuthenticated } from '@services/spotify';
import type { SpotifyData } from '@types';
import { Input } from '@components/common/Input';

interface MusicTasteStepProps {
  formData: {
    top_genres: string[];
    top_artists: string[];
    top_songs: string[];
    sprint_5_variant?: 'variant_a' | 'variant_b';
  };
  updateFormData: (updates: Partial<MusicTasteStepProps['formData']>) => void;
}

const MAX_GENRES = 5;
const MAX_ARTISTS = 5;
const MAX_SONGS = 5;

type InputMode = 'manual' | 'spotify';

export const MusicTasteStep: React.FC<MusicTasteStepProps> = ({
  formData,
  updateFormData,
}) => {
  // Initialize input mode based on existing variant, default to manual
  const [inputMode, setInputMode] = useState<InputMode>(
    formData.sprint_5_variant === 'variant_b' ? 'spotify' : 'manual'
  );
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);
  const [isLoadingSpotify, setIsLoadingSpotify] = useState(false);
  const [spotifyData, setSpotifyData] = useState<SpotifyData | null>(null);
  
  // Manual input states
  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    artists: Array<{ id: string; name: string; image_url?: string }>;
    tracks: Array<{ id: string; name: string; artist: string; image_url?: string }>;
  }>({ artists: [], tracks: [] });
  const [isSearching, setIsSearching] = useState(false);
  
  // Store image URLs for artists and songs
  const [artistImages, setArtistImages] = useState<Record<string, string>>({});
  const [songImages, setSongImages] = useState<Record<string, string>>({});

  // Check if Spotify is already connected
  useEffect(() => {
    checkSpotifyConnection();
  }, []);

  const checkSpotifyConnection = async () => {
    try {
      const connected = await isAuthenticated();
      setIsSpotifyConnected(connected);
    } catch (error) {
      setIsSpotifyConnected(false);
    }
  };

  const loadSpotifyData = async () => {
    try {
      setIsLoadingSpotify(true);
      const data = await fetchAllSpotifyData();
      setSpotifyData(data);
      
      // Auto-populate form with Spotify data
      const genresToSet = data.top_genres?.slice(0, MAX_GENRES) || [];
      
      const artists = data.top_artists.slice(0, MAX_ARTISTS);
      const tracks = data.top_tracks.slice(0, MAX_SONGS);
      
      updateFormData({
        top_genres: genresToSet,
        top_artists: artists.map(a => a.name),
        top_songs: tracks.map(t => `${t.name} - ${t.artist}`),
        sprint_5_variant: 'variant_b',
      });
      
      // Store image URLs for artists and songs
      const newArtistImages: Record<string, string> = {};
      artists.forEach(artist => {
        if (artist.image_url) {
          newArtistImages[artist.name] = artist.image_url;
        }
      });
      setArtistImages(newArtistImages);
      
      const newSongImages: Record<string, string> = {};
      tracks.forEach(track => {
        const songString = `${track.name} - ${track.artist}`;
        if (track.image_url) {
          newSongImages[songString] = track.image_url;
        }
      });
      setSongImages(newSongImages);
    } catch (error) {
      setIsSpotifyConnected(false);
    } finally {
      setIsLoadingSpotify(false);
    }
  };

  const handleSpotifySuccess = (data: SpotifyData) => {
    setSpotifyData(data);
    setIsSpotifyConnected(true);
    setInputMode('spotify');
    
    // Clear any existing manual data first to keep variants separate
    // Then auto-populate form with Spotify data
    const genresToSet = data.top_genres?.slice(0, MAX_GENRES) || [];
    
    updateFormData({
      top_genres: genresToSet,
      top_artists: data.top_artists.slice(0, MAX_ARTISTS).map(a => a.name),
      top_songs: data.top_tracks.slice(0, MAX_SONGS).map(t => `${t.name} - ${t.artist}`),
    });
  };

  const handleSpotifyError = (error: Error) => {
    // Handle error silently
  };

  const handleModeSwitch = (mode: InputMode) => {
    // Clear form data when switching modes to keep variants separate
    updateFormData({
      top_genres: [],
      top_artists: [],
      top_songs: [],
      sprint_5_variant: mode === 'manual' ? 'variant_a' : 'variant_b',
    });
    
    // Clear image mappings
    setArtistImages({});
    setSongImages({});
    
    setInputMode(mode);
    
    // If switching to Spotify mode and already connected, load data
    if (mode === 'spotify' && isSpotifyConnected) {
      loadSpotifyData();
    } else if (mode === 'manual') {
      // Clear search results when switching to manual
      setSearchResults({ artists: [], tracks: [] });
      setArtistSearchQuery('');
      setTrackSearchQuery('');
    }
  };

  // Search for artists using Spotify API
  const searchForArtists = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults({ ...searchResults, artists: [] });
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchArtists(query, 10);
      const formattedArtists = results.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        image_url: artist.images[0]?.url,
      }));
      setSearchResults({ ...searchResults, artists: formattedArtists });
    } catch (error) {
      setSearchResults({ ...searchResults, artists: [] });
    } finally {
      setIsSearching(false);
    }
  };

  // Search for tracks using Spotify API
  const searchForTracks = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults({ ...searchResults, tracks: [] });
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchTracks(query, undefined, 10);
      const formattedTracks = results.items.map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0]?.name || 'Unknown Artist',
        image_url: track.album.images[0]?.url,
      }));
      setSearchResults({ ...searchResults, tracks: formattedTracks });
    } catch (error) {
      setSearchResults({ ...searchResults, tracks: [] });
    } finally {
      setIsSearching(false);
    }
  };

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
        sprint_5_variant: inputMode === 'manual' ? 'variant_a' : 'variant_b',
      });
    }
  };

  const addArtist = (artistName: string, imageUrl?: string) => {
    const current = formData.top_artists || [];
    if (!current.includes(artistName) && current.length < MAX_ARTISTS) {
      updateFormData({ 
        top_artists: [...current, artistName],
        sprint_5_variant: inputMode === 'manual' ? 'variant_a' : 'variant_b',
      });
      // Store image URL if provided
      if (imageUrl) {
        setArtistImages(prev => ({ ...prev, [artistName]: imageUrl }));
      }
    }
    setArtistSearchQuery('');
    setSearchResults({ ...searchResults, artists: [] });
  };

  const removeArtist = (artistName: string) => {
    const current = formData.top_artists || [];
    updateFormData({ top_artists: current.filter(a => a !== artistName) });
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
    if (!current.includes(songString) && current.length < MAX_SONGS) {
      updateFormData({ 
        top_songs: [...current, songString],
        sprint_5_variant: inputMode === 'manual' ? 'variant_a' : 'variant_b',
      });
      // Store image URL if provided
      if (imageUrl) {
        setSongImages(prev => ({ ...prev, [songString]: imageUrl }));
      }
    }
    setTrackSearchQuery('');
    setSearchResults({ ...searchResults, tracks: [] });
  };

  const removeSong = (songString: string) => {
    const current = formData.top_songs || [];
    updateFormData({ top_songs: current.filter(s => s !== songString) });
    // Remove image URL
    setSongImages(prev => {
      const updated = { ...prev };
      delete updated[songString];
      return updated;
    });
  };

  // Debounced search - search in both manual and Spotify modes if authenticated
  useEffect(() => {
    if (artistSearchQuery && isSpotifyConnected && (formData.top_artists?.length || 0) < MAX_ARTISTS) {
      const timeout = setTimeout(() => {
        searchForArtists(artistSearchQuery);
      }, 500);
      return () => clearTimeout(timeout);
    } else if ((formData.top_artists?.length || 0) >= MAX_ARTISTS) {
      // Clear search results if max reached
      setSearchResults(prev => ({ ...prev, artists: [] }));
      setArtistSearchQuery('');
    } else {
      // Clear search results if query is empty or not authenticated
      setSearchResults(prev => ({ ...prev, artists: [] }));
    }
  }, [artistSearchQuery, inputMode, isSpotifyConnected, formData.top_artists]);

  useEffect(() => {
    if (trackSearchQuery && isSpotifyConnected && (formData.top_songs?.length || 0) < MAX_SONGS) {
      const timeout = setTimeout(() => {
        searchForTracks(trackSearchQuery);
      }, 500);
      return () => clearTimeout(timeout);
    } else if ((formData.top_songs?.length || 0) >= MAX_SONGS) {
      // Clear search results if max reached
      setSearchResults(prev => ({ ...prev, tracks: [] }));
      setTrackSearchQuery('');
    } else {
      // Clear search results if query is empty or not authenticated
      setSearchResults(prev => ({ ...prev, tracks: [] }));
    }
  }, [trackSearchQuery, inputMode, isSpotifyConnected, formData.top_songs]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.description}>
        Share your music taste to help us match you with people who love the same music!
      </Text>

      {/* Mode Selection */}
      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, inputMode === 'manual' && styles.modeButtonActive]}
          onPress={() => handleModeSwitch('manual')}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name="edit" 
            size={20} 
            color={inputMode === 'manual' ? COLORS.text.inverse : COLORS.text.secondary} 
          />
          <Text style={[styles.modeButtonText, inputMode === 'manual' && styles.modeButtonTextActive]}>
            Variant A
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, inputMode === 'spotify' && styles.modeButtonActive]}
          onPress={() => handleModeSwitch('spotify')}
          activeOpacity={0.7}
        >
          <MaterialIcons 
            name="music-note" 
            size={20} 
            color={inputMode === 'spotify' ? COLORS.text.inverse : COLORS.text.secondary} 
          />
          <Text style={[styles.modeButtonText, inputMode === 'spotify' && styles.modeButtonTextActive]}>
            Variant B
          </Text>
        </TouchableOpacity>
      </View>

      {/* Spotify Mode Content */}
      {inputMode === 'spotify' && (
        <View style={styles.spotifySection}>
          {!isSpotifyConnected ? (
            <>
              <Text style={styles.spotifyDescription}>
                Connect your Spotify account to automatically import your top genres, artists, and songs.
              </Text>
              <SpotifyButton
                onSuccess={handleSpotifySuccess}
                onError={handleSpotifyError}
              />
            </>
          ) : (
            <>
              <View style={styles.connectedHeader}>
                <MaterialIcons name="check-circle" size={20} color={COLORS.success} />
                <Text style={styles.connectedText}>Spotify Connected</Text>
                <TouchableOpacity
                  style={styles.disconnectButton}
                  onPress={() => {
                    setIsSpotifyConnected(false);
                    setSpotifyData(null);
                    updateFormData({
                      top_genres: [],
                      top_artists: [],
                      top_songs: [],
                    });
                    setInputMode('manual');
                  }}
                >
                  <Text style={styles.disconnectText}>Disconnect</Text>
                </TouchableOpacity>
              </View>
              {isLoadingSpotify && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Loading your music data...</Text>
                </View>
              )}
              {spotifyData && !isLoadingSpotify && (
                <View style={styles.spotifyDataInfo}>
                  <Text style={styles.spotifyDataText}>
                    ✓ {spotifyData.top_genres.length} genres, {spotifyData.top_artists.length} artists, and {spotifyData.top_tracks.length} songs imported
                  </Text>
                  <Text style={styles.spotifyNote}>
                    You can still edit your selections below or switch to manual input.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Top Genres */}
      <View style={styles.section}>
        <Text style={styles.label}>
          Top Genres ({formData.top_genres?.length || 0}/{MAX_GENRES})
        </Text>
        <Text style={styles.subLabel}>
          {inputMode === 'spotify' && spotifyData
            ? 'Genres imported from Spotify (read-only)'
            : 'Select up to ' + MAX_GENRES + ' genres'}
        </Text>
        
        {/* Selected Genres from Spotify */}
        {inputMode === 'spotify' && spotifyData && formData.top_genres && formData.top_genres.length > 0 && (
          <View style={styles.importedGenres}>
            <Text style={styles.importedLabel}>Imported from Spotify:</Text>
            <View style={styles.genresGrid}>
              {formData.top_genres.map((genre, index) => {
                const isInPredefinedList = MUSIC_GENRES.some(
                  predefined => predefined.toLowerCase() === genre.toLowerCase()
                );
                return (
                  <View
                    key={`imported-${genre}-${index}`}
                    style={[
                      styles.genreChip,
                      styles.genreChipSelected,
                      !isInPredefinedList && styles.importedGenreChip,
                      styles.genreChipReadOnly
                    ]}
                  >
                    <Text style={[styles.genreChipText, styles.genreChipTextSelected]}>
                      {genre}
                    </Text>
                    <MaterialIcons name="check" size={16} color={COLORS.text.inverse} />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Predefined Genre Chips - Only show in manual mode */}
        {inputMode === 'manual' || !spotifyData ? (
          <View style={styles.genresGrid}>
            {MUSIC_GENRES.map((genre) => {
              // Case-insensitive check for selected
              const selected = formData.top_genres?.some(
                g => g.toLowerCase() === genre.toLowerCase()
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
        ) : null}
      </View>

      {/* Top Artists */}
      <View style={styles.section}>
        <Text style={styles.label}>
          Top Artists ({formData.top_artists?.length || 0}/{MAX_ARTISTS})
        </Text>
        <Text style={styles.subLabel}>
          {inputMode === 'spotify' && spotifyData
            ? 'Artists imported from Spotify (read-only)'
            : 'Add up to ' + MAX_ARTISTS + ' artists'}
        </Text>
        
        {/* Selected Artists */}
        {formData.top_artists && formData.top_artists.length > 0 && (
          <View style={styles.selectedItems}>
            {formData.top_artists.map((artist, index) => {
              // Look up image from stored images, spotifyData, or searchResults
              const artistImage = artistImages[artist] ||
                                  spotifyData?.top_artists?.find(a => a.name === artist)?.image_url ||
                                  searchResults.artists.find(a => a.name === artist)?.image_url;
              
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
                  {inputMode === 'manual' || !spotifyData ? (
                    <TouchableOpacity
                      onPress={() => removeArtist(artist)}
                      style={styles.removeButton}
                    >
                      <MaterialIcons name="close" size={18} color={COLORS.text.secondary} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {/* Artist Search - Only show in manual mode */}
        {inputMode === 'manual' || !spotifyData ? (
          (formData.top_artists?.length || 0) < MAX_ARTISTS ? (
            <View>
              <Input
                placeholder={isSpotifyConnected ? "Search for artists..." : "Enter artist name (press Enter to add)"}
                value={artistSearchQuery}
                onChangeText={setArtistSearchQuery}
                leftIcon={isSpotifyConnected ? <MaterialIcons name="search" size={20} color={COLORS.text.secondary} /> : undefined}
                onSubmitEditing={() => {
                  if (artistSearchQuery.trim() && !isSpotifyConnected) {
                    // Only allow direct add if not authenticated (fallback to manual entry)
                    addArtist(artistSearchQuery.trim());
                  }
                }}
                returnKeyType="done"
              />
              {isSpotifyConnected && isSearching && (
                <ActivityIndicator size="small" color={COLORS.primary} style={styles.searchLoader} />
              )}
              {isSpotifyConnected && searchResults.artists.length > 0 && (
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
          )
        ) : null}
      </View>

      {/* Top Songs */}
      <View style={styles.section}>
        <Text style={styles.label}>
          Top Songs ({formData.top_songs?.length || 0}/{MAX_SONGS})
        </Text>
        <Text style={styles.subLabel}>
          {inputMode === 'spotify' && spotifyData
            ? 'Songs imported from Spotify (read-only)'
            : 'Add up to ' + MAX_SONGS + ' songs'}
        </Text>
        
        {/* Selected Songs */}
        {formData.top_songs && formData.top_songs.length > 0 && (
          <View style={styles.selectedItems}>
            {formData.top_songs.map((song, index) => {
              // Parse song string "Song Name - Artist Name"
              const [songName, artistName] = song.split(' - ');
              
              // Look up image from stored images, spotifyData, or searchResults
              const trackImage = songImages[song] ||
                                 spotifyData?.top_tracks?.find(t => 
                                   t.name === songName && t.artist === artistName
                                 )?.image_url ||
                                 searchResults.tracks.find(t => 
                                   t.name === songName && t.artist === artistName
                                 )?.image_url;
              
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
                  {inputMode === 'manual' || !spotifyData ? (
                    <TouchableOpacity
                      onPress={() => removeSong(song)}
                      style={styles.removeButton}
                    >
                      <MaterialIcons name="close" size={18} color={COLORS.text.secondary} />
                    </TouchableOpacity>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {/* Track Search - Only show in manual mode */}
        {inputMode === 'manual' || !spotifyData ? (
          (formData.top_songs?.length || 0) < MAX_SONGS ? (
            <View>
              <Input
                placeholder={isSpotifyConnected ? "Search for songs..." : "Enter song name - artist (press Enter to add)"}
                value={trackSearchQuery}
                onChangeText={setTrackSearchQuery}
                leftIcon={isSpotifyConnected ? <MaterialIcons name="search" size={20} color={COLORS.text.secondary} /> : undefined}
                onSubmitEditing={() => {
                  if (trackSearchQuery.trim() && !isSpotifyConnected) {
                    // Only allow direct add if not authenticated (fallback to manual entry)
                    addSong(trackSearchQuery.trim(), '');
                  }
                }}
                returnKeyType="done"
              />
              {isSpotifyConnected && isSearching && (
                <ActivityIndicator size="small" color={COLORS.primary} style={styles.searchLoader} />
              )}
              {isSpotifyConnected && searchResults.tracks.length > 0 && (
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
          )
        ) : null}
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

