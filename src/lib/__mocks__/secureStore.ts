// src/lib/__mocks__/secureStore.ts

// Simple in-memory mock for SecureStoreAdapter
const mockStore: Record<string, string> = {};

export const SecureStoreAdapter = {
  async getItem(key: string): Promise<string | null> {
    return mockStore[key] || null;
  },
  async setItem(key: string, value: string): Promise<void> {
    mockStore[key] = value;
  },
  async removeItem(key: string): Promise<void> {
    delete mockStore[key];
  },
};
