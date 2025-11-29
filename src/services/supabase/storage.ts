import * as FileSystem from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

/**
 * Uploads an image from a remote URL to Supabase Storage.
 * Returns the public URL of the uploaded file.
 * 
 * @param remoteUrl The URL of the image to fetch (e.g., from Spotify)
 * @param userId The user's ID (used for folder organization)
 * @param fileName The desired filename (without extension, which is inferred)
 * @param folder The subfolder ('artists' or 'songs')
 */
export async function uploadRemoteImage(
  remoteUrl: string,
  userId: string,
  fileName: string,
  folder: 'artists' | 'songs'
): Promise<string | null> {
  try {
    if (!remoteUrl) return null;

    // 1. Download the image to a temporary file
    const tempFile = `${FileSystem.cacheDirectory}upload_${Date.now()}.jpg`;
    const downloadRes = await FileSystem.downloadAsync(remoteUrl, tempFile);
    
    if (downloadRes.status !== 200) {
      throw new Error(`Failed to download image from ${remoteUrl}`);
    }

    // 2. Read file as Base64
    const base64 = await FileSystem.readAsStringAsync(tempFile, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 3. Decode to ArrayBuffer
    const arrayBuffer = decode(base64);

    // 4. Generate path: {userId}/{folder}/{fileName}.jpg
    // Sanitize filename to remove special chars
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const filePath = `${userId}/${folder}/${sanitizedFileName}.jpg`;

    // 5. Upload to Supabase
    const { error: uploadError } = await supabase.storage
      .from('spotify-assets')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    // Cleanup temp file
    await FileSystem.deleteAsync(tempFile, { idempotent: true });

    if (uploadError) {
      console.error(`[Storage] Upload failed for ${fileName}:`, uploadError);
      return null;
    }

    // 6. Get Public URL
    const { data } = supabase.storage
      .from('spotify-assets')
      .getPublicUrl(filePath);

    return data.publicUrl;

  } catch (error) {
    console.error(`[Storage] Error processing ${fileName}:`, error);
    return null;
  }
}

/**
 * Batch upload helper
 */
export async function uploadSpotifyImageBatch(
  items: { name: string; url: string }[],
  userId: string,
  folder: 'artists' | 'songs'
): Promise<{ name: string; url: string }[]> {
  const uploadPromises = items.map(async (item) => {
    // Skip if already a Supabase URL or empty
    if (!item.url || item.url.includes('supabase.co')) {
      return item;
    }

    const publicUrl = await uploadRemoteImage(item.url, userId, item.name, folder);
    
    return {
      name: item.name,
      url: publicUrl || item.url // Fallback to original if upload fails
    };
  });

  return Promise.all(uploadPromises);
}
