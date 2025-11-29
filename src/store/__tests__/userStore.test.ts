
import { act, renderHook } from '@testing-library/react-native';
import { useUserStore } from '../userStore';
import * as user_service from '@services/supabase/user';
import * as auth_service from '@services/supabase/auth';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage');

// Mock the services
jest.mock('@services/supabase/user');
jest.mock('@services/supabase/auth');

// Typed mocks for autocompletion
const mockedUserService = user_service as jest.Mocked<typeof user_service>;
const mockedAuthService = auth_service as jest.Mocked<typeof auth_service>;

const mockUser = { id: '1', username: 'test' };
const mockSession = { access_token: 'token', user: { id: '1' } };

describe('Zustand - useUserStore', () => {

    beforeEach(() => {
        // Reset the store to its initial state before each test
        act(() => {
            useUserStore.getState().reset();
        });
        // Clear mock history
        jest.clearAllMocks();
    });

    it('should have the correct initial state', () => {
        const { result } = renderHook(() => useUserStore());

        expect(result.current.currentUser).toBeNull();
        expect(result.current.session).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.isInitialized).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('setCurrentUser should update the user in the store', () => {
        const { result } = renderHook(() => useUserStore());

        act(() => {
            result.current.setCurrentUser(mockUser as any);
        });

        expect(result.current.currentUser).toEqual(mockUser);
        expect(result.current.error).toBeNull();
    });

    it('setSession should update the session in the store', () => {
        const { result } = renderHook(() => useUserStore());

        act(() => {
            result.current.setSession(mockSession as any);
        });

        expect(result.current.session).toEqual(mockSession);
    });

    it('setError should update the error message and stop loading', () => {
        const { result } = renderHook(() => useUserStore());

        act(() => {
            result.current.setLoading(true);
            result.current.setError('An error occurred');
        });

        expect(result.current.error).toBe('An error occurred');
        expect(result.current.isLoading).toBe(false);
    });

    describe('Async Actions', () => {

        it('initializeAuth should fetch session and profile successfully', async () => {
            const { result } = renderHook(() => useUserStore());

            mockedAuthService.getSession.mockResolvedValueOnce(mockSession as any);
            mockedUserService.getUserProfile.mockResolvedValueOnce(mockUser as any);

            await act(async () => {
                await result.current.initializeAuth();
            });

            expect(mockedAuthService.getSession).toHaveBeenCalledTimes(1);
            expect(mockedUserService.getUserProfile).toHaveBeenCalledWith('1');
            expect(result.current.session).toEqual(mockSession);
            expect(result.current.currentUser).toEqual(mockUser);
            expect(result.current.isInitialized).toBe(true);
            expect(result.current.isLoading).toBe(false);
        });

        it('signOut should call authSignOut and reset the store', async () => {
             const { result } = renderHook(() => useUserStore());

            // Set some initial state to ensure it gets cleared
            act(() => {
                result.current.setCurrentUser(mockUser as any);
                result.current.setSession(mockSession as any);
            });

            mockedAuthService.signOut.mockResolvedValueOnce({ error: null });

            await act(async () => {
                await result.current.signOut();
            });

            expect(mockedAuthService.signOut).toHaveBeenCalledTimes(1);
            expect(result.current.currentUser).toBeNull();
            expect(result.current.session).toBeNull();
            expect(result.current.isInitialized).toBe(true);
        });

         it('updateProfile should update user and local state on success', async () => {
            const { result } = renderHook(() => useUserStore());
            const initialUser = { id: '1', username: 'initial' };
            const updates = { username: 'updated' };
            const updatedUser = { ...initialUser, ...updates };

            // Set initial user
             act(() => {
                result.current.setCurrentUser(initialUser as any);
            });

            mockedUserService.updateUserProfile.mockResolvedValueOnce(updatedUser as any);

            await act(async () => {
                await result.current.updateProfile('1', updates);
            });

            expect(mockedUserService.updateUserProfile).toHaveBeenCalledWith('1', updates);
            expect(result.current.currentUser).toEqual(updatedUser);
            expect(result.current.isLoading).toBe(false);
        });
    });
});
