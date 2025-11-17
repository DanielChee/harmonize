// User Store - Zustand state management for user profile and Spotify data
import { create } from 'zustand';
import type { User } from '@types';
import type { SpotifyData } from '../types/spotify-types';
import { updateUserProfile, getUserProfile } from '@services/supabase/user';
import { getSession, onAuthStateChange, signOut as authSignOut } from '@services/supabase/auth';
import type { Session } from '@supabase/supabase-js';

interface UserStore {
  // State
  currentUser: User | null;
  session: Session | null;
  spotifyData: SpotifyData | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  setCurrentUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setSpotifyData: (data: SpotifyData | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  initializeAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const initialState = {
  currentUser: null,
  session: null,
  spotifyData: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

export const useUserStore = create<UserStore>((set, get) => ({
  ...initialState,

  // Set current user
  setCurrentUser: (user) => {
    set({ currentUser: user, error: null });
  },

  // Set session
  setSession: (session) => {
    set({ session });
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

  // Initialize auth state from Supabase
  initializeAuth: async () => {
    const { setLoading, setError, setSession, setCurrentUser } = get();

    try {
      setLoading(true);

      // Get current session
      const session = await getSession();
      setSession(session);

      // If there's a session, load the user profile
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        if (profile) {
          setCurrentUser(profile);
        }
      }

      // Listen for auth state changes
      onAuthStateChange(async (event, newSession) => {
        console.log('[UserStore] Auth state changed:', event);
        setSession(newSession);

        if (newSession?.user) {
          const profile = await getUserProfile(newSession.user.id);
          if (profile) {
            setCurrentUser(profile);
          }
        } else {
          setCurrentUser(null);
        }
      });

      set({ isInitialized: true, isLoading: false });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize auth';
      setError(errorMessage);
      set({ isInitialized: true });
    }
  },

  // Sign out user
  signOut: async () => {
    const { setLoading, setError } = get();

    try {
      setLoading(true);
      await authSignOut();
      set({
        ...initialState,
        isInitialized: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      setError(errorMessage);
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
export const selectSession = (state: UserStore) => state.session;
export const selectSpotifyData = (state: UserStore) => state.spotifyData;
export const selectIsLoading = (state: UserStore) => state.isLoading;
export const selectIsInitialized = (state: UserStore) => state.isInitialized;
export const selectError = (state: UserStore) => state.error;
export const selectIsAuthenticated = (state: UserStore) => !!state.session;
