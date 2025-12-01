// src/lib/__mocks__/secureStore.ts

// Simple in-memory mock for SecureStoreAdapter and Expo SecureStore
const mockStore: Record<string, string> = {};

export const getItemAsync = async (key: string): Promise<string | null> => {
  return mockStore[key] || null;
};

export const setItemAsync = async (key: string, value: string): Promise<void> => {
  mockStore[key] = value;
};

export const deleteItemAsync = async (key: string): Promise<void> => {
  delete mockStore[key];
};

// Keep Adapter for backward compatibility if used elsewhere
export const SecureStoreAdapter = {
  getItem: getItemAsync,
  setItem: setItemAsync,
  removeItem: deleteItemAsync,
};
