/**
 * Authentication Login Screen
 * Handles user signup and signin with email/password and username
 */

import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  signUp,
  signIn,
  signOut,
  getSession,
  isValidEmail,
  isValidPassword,
  isValidUsername,
  checkUsernameAvailable,
} from '@services/supabase/auth';
import { useUserStore } from '@store';
import { getUserProfile, isProfileComplete } from '@services/supabase/user';
import type { Session } from '@supabase/supabase-js';

export function LoginScreen() {
  const router = useRouter();
  const { setCurrentUser, setSession, reset: resetUserStore } = useUserStore();

  // Form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession();
  }, []);

  // Debounced username availability check
  useEffect(() => {
    if (!isSignUp || !username || username.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    if (!isValidUsername(username)) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');
    const timeout = setTimeout(async () => {
      const available = await checkUsernameAvailable(username);
      setUsernameStatus(available ? 'available' : 'taken');
    }, 500);

    return () => clearTimeout(timeout);
  }, [username, isSignUp]);

  const checkExistingSession = async () => {
    try {
      const existingSession = await getSession();
      if (existingSession?.user) {
        console.log('[Login] Existing session found:', existingSession.user.email);
        // Store session in Zustand
        setSession(existingSession);
        // Load user profile
        const profile = await getUserProfile(existingSession.user.id);
        if (profile) {
          setCurrentUser(profile);
        }
        // Check if profile is complete - redirect to profile setup if not
        if (!profile || !isProfileComplete(profile)) {
          router.replace('/profile-setup');
        } else {
          router.replace('/(tabs)/match');
        }
      }
    } catch (error) {
      console.error('[Login] Error checking session:', error);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const validateForm = (): string | null => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!isValidEmail(email.trim())) {
      return 'Please enter a valid email address';
    }
    if (!password) {
      return 'Password is required';
    }
    if (!isValidPassword(password)) {
      return 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!username.trim()) {
        return 'Username is required';
      }
      if (!isValidUsername(username.trim())) {
        return 'Username must be 3-20 characters (letters, numbers, _, -)';
      }
      if (usernameStatus === 'taken') {
        return 'Username is already taken';
      }
      if (password !== confirmPassword) {
        return 'Passwords do not match';
      }
    }

    return null;
  };

  const handleSignUp = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsLoading(true);
    try {
      const { user, session: newSession, error } = await signUp({
        email: email.trim(),
        password,
        username: username.trim(),
      });

      if (error) {
        Alert.alert('Sign Up Failed', error.message);
        return;
      }

      if (user && !newSession) {
        // User created but no session - email confirmation might be required
        // In our setup, this shouldn't happen, but handle it gracefully
        Alert.alert(
          'Account Created',
          'Your account has been created. If email confirmation is required, please check your email then sign in.',
          [{ text: 'OK', onPress: () => setIsSignUp(false) }]
        );
        return;
      }

      if (user && newSession) {
        // Store session in Zustand
        setSession(newSession as Session);
        // Load the created profile
        const profile = await getUserProfile(user.id);
        if (profile) {
          setCurrentUser(profile);
        }
        // Redirect to profile setup for new users
        router.replace('/profile-setup');
      }
    } catch (error) {
      console.error('[Login] Sign up error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsLoading(true);
    try {
      const { user, session: newSession, error } = await signIn({
        email: email.trim(),
        password,
      });

      if (error) {
        Alert.alert('Sign In Failed', error.message);
        return;
      }

      if (user && newSession) {
        // Store session in Zustand
        setSession(newSession as Session);
        // Load user profile
        const profile = await getUserProfile(user.id);
        if (profile) {
          setCurrentUser(profile);
        }
        // Check if profile is complete - redirect to profile setup if not
        if (!profile || !isProfileComplete(profile)) {
          router.replace('/profile-setup');
        } else {
          router.replace('/(tabs)/match');
        }
      }
    } catch (error) {
      console.error('[Login] Sign in error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          setIsLoading(true);
          try {
            await signOut();
            resetUserStore();
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setUsername('');
            Alert.alert('Success', 'You have been signed out');
          } catch (error) {
            console.error('[Login] Sign out error:', error);
            Alert.alert('Error', 'Failed to sign out');
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setPassword('');
    setConfirmPassword('');
    setUsernameStatus('idle');
  };

  if (isCheckingSession) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Checking session...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Harmonize</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.text.tertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              editable={!isLoading}
            />
          </View>

          {/* Username Input (Sign Up only) */}
          {isSignUp && (
            <View style={styles.inputSection}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWithStatus}>
                <TextInput
                  style={[styles.input, styles.inputFlex]}
                  placeholder="your_username"
                  placeholderTextColor={COLORS.text.tertiary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {usernameStatus === 'checking' && (
                  <ActivityIndicator size="small" color={COLORS.primary} style={styles.statusIcon} />
                )}
                {usernameStatus === 'available' && (
                  <Text style={[styles.statusIcon, styles.statusAvailable]}>✓</Text>
                )}
                {usernameStatus === 'taken' && (
                  <Text style={[styles.statusIcon, styles.statusTaken]}>✗</Text>
                )}
              </View>
              <Text style={styles.hint}>
                3-20 characters (letters, numbers, _, -)
              </Text>
              {usernameStatus === 'taken' && (
                <Text style={styles.errorHint}>Username is already taken</Text>
              )}
            </View>
          )}

          {/* Password Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.text.tertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              editable={!isLoading}
            />
            {isSignUp && (
              <Text style={styles.hint}>At least 6 characters</Text>
            )}
          </View>

          {/* Confirm Password (Sign Up only) */}
          {isSignUp && (
            <View style={styles.inputSection}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.text.tertiary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!isLoading}
              />
            </View>
          )}

          {/* Primary Action Button */}
          <TouchableOpacity
            style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={isSignUp ? handleSignUp : handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.text.inverse} />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Mode */}
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleMode}
            disabled={isLoading}
          >
            <Text style={styles.toggleButtonText}>
              {isSignUp
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          {/* Sign Out Button (for testing) */}
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={isLoading}
          >
            <Text style={styles.signOutButtonText}>Sign Out Current Session</Text>
          </TouchableOpacity>

          {/* Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              🔒 Your data is secured with Supabase authentication
            </Text>
            <Text style={styles.infoText}>
              🎵 Connect with concert buddies who share your music taste
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  title: {
    fontSize: TYPOGRAPHY.sizes['5xl'],
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  inputSection: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
  },
  inputWithStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFlex: {
    flex: 1,
  },
  statusIcon: {
    marginLeft: SPACING.sm,
    fontSize: TYPOGRAPHY.sizes.xl,
  },
  statusAvailable: {
    color: COLORS.success,
  },
  statusTaken: {
    color: COLORS.error,
  },
  hint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
  errorHint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.inverse,
  },
  toggleButton: {
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  toggleButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  signOutButton: {
    backgroundColor: 'transparent',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
    marginTop: SPACING.lg,
  },
  signOutButtonText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.error,
  },
  infoSection: {
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});
