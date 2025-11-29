import { searchArtists, searchTracks } from './search';
import { uploadSpotifyImageBatch } from '../supabase/storage';
import type { User } from '@types';

/**
 * Fetches image URLs from Spotify for a user's top artists and songs.
 * Uses the current authenticated user's (admin's) Spotify token.
 * Uploads the fetched images to Supabase storage and returns the secure URLs.
 * 
 * @param user The user object containing top_artists and top_songs names
 * @returns Object containing artist_images and song_images arrays (secure URLs)
 */
export async function syncUserImagesFromSpotify(user: User): Promise<{ artist_images: string[], song_images: string[] }> {
  const artistImages: { name: string; url: string }[] = [];
  const songImages: { name: string; url: string }[] = [];

  // 1. Fetch Artist Images
  if (user.top_artists && user.top_artists.length > 0) {
    for (const artistName of user.top_artists) {
      try {
        const results = await searchArtists(artistName, 1);
        const artist = results.items[0];
        if (artist && artist.images && artist.images.length > 0) {
          artistImages.push({ name: artistName, url: artist.images[0].url });
        }
      } catch (error) {
        console.warn(`[Admin] Failed to find image for artist: ${artistName}`, error);
      }
    }
  }

  // 2. Fetch Song Images
  if (user.top_songs && user.top_songs.length > 0) {
    for (const songString of user.top_songs) {
      try {
        // songString is typically "Song Name - Artist Name"
        // Search using the whole string usually works well for Spotify
        const results = await searchTracks(songString, undefined, 1);
        const track = results.items[0];
        if (track && track.album && track.album.images && track.album.images.length > 0) {
          songImages.push({ name: songString, url: track.album.images[0].url });
        }
      } catch (error) {
        console.warn(`[Admin] Failed to find image for song: ${songString}`, error);
      }
    }
  }

  // 3. Upload to Supabase Storage (Secure Batch Upload)
  // This ensures we don't rely on volatile Spotify URLs
  const uploadedArtists = await uploadSpotifyImageBatch(artistImages, user.id, 'artists');
  const uploadedSongs = await uploadSpotifyImageBatch(songImages, user.id, 'songs');

  // 4. Map back to simple string arrays (URLs)
  // We need to maintain the order corresponding to the names, or just return the list
  // The User type expects string[], so we just return the URLs in order of successful fetch
  
  return {
    artist_images: uploadedArtists.map(item => item.url),
    song_images: uploadedSongs.map(item => item.url),
  };
}
