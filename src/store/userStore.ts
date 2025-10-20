// User Store - Zustand state management for user profile and Spotify data
import { create } from 'zustand';
import type { User } from '@types';
import type { SpotifyData } from '../types/spotify-types';
import { updateUserProfile } from '@services/supabase/user';

interface UserStore {
  // State
  currentUser: User | null;
  spotifyData: SpotifyData | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setCurrentUser: (user: User | null) => void;
  setSpotifyData: (data: SpotifyData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  currentUser: null,
  spotifyData: null,
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserStore>((set, get) => ({
  ...initialState,

  // Set current user
  setCurrentUser: (user) => {
    set({ currentUser: user, error: null });
  },

  // Set Spotify data
  setSpotifyData: (data) => {
    set({ spotifyData: data, error: null });
  },

  // Set loading state
  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // Set error message
  setError: (error) => {
    set({ error, isLoading: false });
  },

  // Update user profile in Supabase and local state
  updateProfile: async (userId, updates) => {
    const { setLoading, setError, currentUser } = get();

    try {
      setLoading(true);
      setError(null);

      // Update in Supabase
      const updatedUser = await updateUserProfile(userId, updates);

      // Update local state with merged data
      if (updatedUser && currentUser) {
        set({
          currentUser: { ...currentUser, ...updatedUser },
          isLoading: false,
          error: null,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw err;
    }
  },

  // Clear error message
  clearError: () => {
    set({ error: null });
  },

  // Reset store to initial state
  reset: () => {
    set(initialState);
  },
}));

// Selectors for optimized component re-renders
export const selectCurrentUser = (state: UserStore) => state.currentUser;
export const selectSpotifyData = (state: UserStore) => state.spotifyData;
export const selectIsLoading = (state: UserStore) => state.isLoading;
export const selectError = (state: UserStore) => state.error;
