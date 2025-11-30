// Public Music Search Service (iTunes API)
// Allows searching for artists and tracks without authentication

export interface PublicSearchResult {
  id: string;
  name: string;
  imageUrl: string;
  artist?: string; // For tracks
}

const ITUNES_API_BASE = 'https://itunes.apple.com/search';

/**
 * Search for artists using iTunes API
 */
export const searchPublicArtists = async (query: string, limit: number = 5): Promise<PublicSearchResult[]> => {
  try {
    const url = `${ITUNES_API_BASE}?term=${encodeURIComponent(query)}&entity=musicArtist&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();

    return data.results.map((item: any) => ({
      id: item.artistId.toString(),
      name: item.artistName,
      // iTunes doesn't always return artist images in this endpoint, we might need to fallback
      // or use a different entity. But often 'artworkUrl100' is present if we search for albums/tracks.
      // For artists, iTunes is tricky. Let's use a simple workaround: search for their top album.
      imageUrl: '', // We'll handle this below
    }));
  } catch (error) {
    console.error('iTunes Artist Search Error:', error);
    return [];
  }
};

/**
 * Search for tracks using iTunes API (Better for images)
 * We can use this for Artists too by taking the artist from the track result.
 */
export const searchPublicMusic = async (query: string, type: 'artist' | 'track', limit: number = 5): Promise<PublicSearchResult[]> => {
  try {
    // We search for 'musicTrack' or 'album' to guarantee artwork
    const entity = type === 'track' ? 'song' : 'album';
    const url = `${ITUNES_API_BASE}?term=${encodeURIComponent(query)}&entity=${entity}&limit=${limit}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (type === 'artist') {
      // Deduplicate by artist name
      const artists = new Map<string, PublicSearchResult>();
      data.results.forEach((item: any) => {
        if (!artists.has(item.artistName)) {
          artists.set(item.artistName, {
            id: item.artistId.toString(),
            name: item.artistName,
            imageUrl: item.artworkUrl100.replace('100x100', '600x600'), // Get higher res
          });
        }
      });
      return Array.from(artists.values()).slice(0, limit);
    } else {
      // Tracks
      return data.results.map((item: any) => ({
        id: item.trackId.toString(),
        name: item.trackName,
        artist: item.artistName,
        imageUrl: item.artworkUrl100.replace('100x100', '600x600'),
      }));
    }
  } catch (error) {
    console.error('iTunes Search Error:', error);
    return [];
  }
};
