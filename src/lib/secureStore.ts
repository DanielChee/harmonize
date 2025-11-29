// src/lib/secureStore.ts
import * as SecureStore from 'expo-secure-store';

/**
 * Custom storage adapter for Supabase to use expo-secure-store.
 * This ensures session tokens are stored securely on the device.
 */
export const SecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value;
    } catch (error) {
      console.error('SecureStoreAdapter.getItem error:', error);
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error('SecureStoreAdapter.setItem error:', error);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStoreAdapter.removeItem error:', error);
    }
  },
};
