/**
 * Supabase Authentication Service
 * Handles user signup, signin, signout with email/password
 */

import { supabase } from "./supabase";
import type { AuthError, User as SupabaseUser, Session } from "@supabase/supabase-js";

export interface AuthResult {
  user: SupabaseUser | null;
  session: Session | null;
  error: AuthError | null;
}

export interface SignUpData {
  email: string;
  password: string;
  username: string;
}

export interface SignInData {
  email: string;
  password: string;
}

/**
 * Sign up a new user with email, password, and username
 * Creates auth user first, then profile is created separately
 */
export async function signUp({ email, password, username }: SignUpData): Promise<AuthResult> {
  // First check if username is available
  const usernameAvailable = await checkUsernameAvailable(username);
  if (!usernameAvailable) {
    return {
      user: null,
      session: null,
      error: {
        name: "AuthApiError",
        message: "Username is already taken",
        status: 400,
      } as AuthError,
    };
  }

  // Create the auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username, // Store username in user metadata
      },
    },
  });

  if (error) {
    console.error("[Auth] Sign up error:", error);
    return { user: null, session: null, error };
  }

  // If signup successful, create the profile linked to auth user
  if (data.user) {
    const profileError = await createUserProfile(data.user.id, email, username);
    if (profileError) {
      console.error("[Auth] Profile creation error:", profileError);
      // Profile creation failed, but auth user was created
      // Return the auth result anyway - user can retry profile creation
    }
  }

  console.log("[Auth] Sign up successful:", data.user?.email);
  return { user: data.user, session: data.session, error: null };
}

/**
 * Sign in existing user with email and password
 */
export async function signIn({ email, password }: SignInData): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("[Auth] Sign in error:", error);
    return { user: null, session: null, error };
  }

  console.log("[Auth] Sign in successful:", data.user?.email);
  return { user: data.user, session: data.session, error: null };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("[Auth] Sign out error:", error);
  } else {
    console.log("[Auth] Sign out successful");
  }

  return { error };
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<SupabaseUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error("[Auth] Get current user error:", error);
    return null;
  }

  return user;
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error("[Auth] Get session error:", error);
    return null;
  }

  return session;
}

/**
 * Check if a username is available
 */
export async function checkUsernameAvailable(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("profiles")
    .select("username")
    .eq("username", username)
    .single();

  if (error && error.code === "PGRST116") {
    // PGRST116 means no rows found - username is available
    return true;
  }

  if (error) {
    console.error("[Auth] Check username error:", error);
    return false; // Assume not available on error to be safe
  }

  // If we got data, username is taken
  return !data;
}

/**
 * Create user profile in the profiles table
 * This links the profile to the auth.users table via foreign key
 */
async function createUserProfile(
  userId: string,
  email: string,
  username: string
): Promise<Error | null> {
  const { error } = await supabase.from("profiles").insert({
    id: userId, // This must match auth.users.id
    email: email,
    username: username,
    display_name: username, // Default display name to username
    bio: "",
    pronouns: "",
    age: 0,
    city: "",
    university: "",
    profile_picture_url: "",
    looking_for: "both",
    is_active: true,
  });

  if (error) {
    console.error("[Auth] Create profile error:", error);
    return new Error(error.message);
  }

  return null;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * At least 6 characters (Supabase minimum)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Validate username format
 * 3-20 characters, alphanumeric, underscores, hyphens
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    console.log("[Auth] Auth state changed:", event);
    callback(event, session);
  });
}
