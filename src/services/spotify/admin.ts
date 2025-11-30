import { searchSpotifyArtistsPublic, searchSpotifyTracksPublic } from './client-credentials';
import { uploadSpotifyImageBatch } from '../supabase/storage';
import type { User } from '@types';

/**
 * Fetches image URLs from Spotify for a user's top artists and songs.
 * Uses the App Token (Client Credentials) so no user login is required.
 * Uploads fetched images to Supabase Storage to prevent link rot.
 * 
 * @param user The user object containing top_artists and top_songs names
 * @returns Object containing artist_images and song_images arrays (Supabase Storage URLs)
 */
export async function syncUserImagesFromSpotify(user: User): Promise<{ artist_images: string[], song_images: string[] }> {
  const artistItems: { name: string; url: string }[] = [];
  const songItems: { name: string; url: string }[] = [];

  // 1. Fetch Artist Images
  if (user.top_artists && user.top_artists.length > 0) {
    for (const artistName of user.top_artists) {
      try {
        const items = await searchSpotifyArtistsPublic(artistName, 1);
        const artist = items[0];
        const url = (artist && artist.images && artist.images.length > 0) ? artist.images[0].url : '';
        artistItems.push({ name: artistName, url });
      } catch (error) {
        console.warn(`[Admin] Failed to find image for artist: ${artistName}`, error);
        artistItems.push({ name: artistName, url: '' });
      }
    }
  }

  // 2. Fetch Song Images
  if (user.top_songs && user.top_songs.length > 0) {
    for (const songString of user.top_songs) {
      try {
        const items = await searchSpotifyTracksPublic(songString, 1);
        const track = items[0];
        const url = (track && track.album && track.album.images && track.album.images.length > 0) ? track.album.images[0].url : '';
        songItems.push({ name: songString, url });
      } catch (error) {
        console.warn(`[Admin] Failed to find image for song: ${songString}`, error);
        songItems.push({ name: songString, url: '' });
      }
    }
  }

  // 3. Batch Upload to Supabase Storage
  // Note: This runs in parallel, which is much faster but respects the await
  const [uploadedArtists, uploadedSongs] = await Promise.all([
    uploadSpotifyImageBatch(artistItems, user.id, 'artists'),
    uploadSpotifyImageBatch(songItems, user.id, 'songs')
  ]);

  return {
    artist_images: uploadedArtists.map(item => item.url),
    song_images: uploadedSongs.map(item => item.url),
  };
}
