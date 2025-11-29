
import { supabase } from '../supabase';
import {
  signIn,
  signUp,
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from '../auth';

// Use the manual mock from the __mocks__ directory
jest.mock('../supabase');

// Create a typed version of the mocked supabase client for autocompletion
const mockedSupabase = supabase as jest.Mocked<typeof supabase>;

describe('Auth Service', () => {
  beforeEach(() => {
    // Clears the history of all mocks before each test
    jest.clearAllMocks();
  });

  // --- Validation Functions ---
  describe('Validation Functions', () => {
    it('isValidEmail should validate emails correctly', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
    });

    it('isValidPassword should validate passwords correctly', () => {
      expect(isValidPassword('123456')).toBe(true);
      expect(isValidPassword('short')).toBe(false);
    });

    it('isValidUsername should validate usernames correctly', () => {
      expect(isValidUsername('testuser')).toBe(true);
      expect(isValidUsername('sh')).toBe(false);
      expect(isValidUsername('invalid user')).toBe(false);
    });
  });

  // --- signIn ---
  describe('signIn', () => {
    const signInData = { email: 'test@example.com', password: 'password123' };

    it('should return user and session on successful sign-in', async () => {
      const mockUser = { id: '123', email: signInData.email };
      const mockSession = { access_token: 'abc', refresh_token: 'xyz' };

      (mockedSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      } as any);

      const result = await signIn(signInData);

      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
      expect(mockedSupabase.auth.signInWithPassword).toHaveBeenCalledWith(signInData);
    });

    it('should return an error on failed sign-in', async () => {
      const mockError = { name: 'AuthApiError', message: 'Invalid login credentials' };

      (mockedSupabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        data: { user: null, session: null },
        error: mockError,
      } as any);

      const result = await signIn(signInData);

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  // --- signUp ---
  describe('signUp', () => {
    const signUpData = { email: 'test@example.com', password: 'password123', username: 'testuser' };

    it('should return an error if username is taken', async () => {
      // Arrange: Mock the builder chain for a taken username
      const singleMock = jest.fn().mockResolvedValueOnce({ data: { username: 'testuser' }, error: null });
      const eqMock = jest.fn(() => ({ single: singleMock }));
      const selectMock = jest.fn(() => ({ eq: eqMock }));
      (mockedSupabase.from as jest.Mock).mockReturnValue({ select: selectMock });

      // Act
      const result = await signUp(signUpData);

      // Assert
      expect(result.error?.message).toBe('Username is already taken');
      expect(result.user).toBeNull();
      expect(mockedSupabase.from).toHaveBeenCalledWith('profiles');
      expect(selectMock).toHaveBeenCalledWith('username');
      expect(eqMock).toHaveBeenCalledWith('username', signUpData.username);
      expect(mockedSupabase.auth.signUp).not.toHaveBeenCalled();
    });

    it('should sign up a user successfully if username is available', async () => {
      const mockUser = { id: '123', email: signUpData.email };
      const mockSession = { access_token: 'abc', refresh_token: 'xyz' };

      // Arrange: Mock the builder chain for an available username
      const singleMock = jest.fn().mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
      const eqMock = jest.fn(() => ({ single: singleMock }));
      const selectMock = jest.fn(() => ({ eq: eqMock }));
      (mockedSupabase.from as jest.Mock).mockReturnValueOnce({ select: selectMock });

      // Arrange: Mock the successful auth.signUp call
      (mockedSupabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
        data: { user: mockUser, session: mockSession },
        error: null,
      } as any);

      // Arrange: Mock the profile creation
       (mockedSupabase.from as jest.Mock).mockReturnValueOnce({
        upsert: jest.fn().mockResolvedValueOnce({ error: null })
      });

      // Act
      const result = await signUp(signUpData);

      // Assert
      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(mockedSupabase.auth.signUp).toHaveBeenCalledTimes(1);
      expect(mockedSupabase.from).toHaveBeenCalledWith('profiles'); // Called for profile creation
    });
  });
});
