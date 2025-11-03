/**
 * Test Participant Login Screen
 * Allows researchers to identify test participants and toggle dev/tester mode
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@constants';
import { useABTestStore } from '@store';

const STORAGE_KEYS = {
  PARTICIPANT_ID: '@harmonize_participant_id',
  IS_TESTER_MODE: '@harmonize_is_tester_mode',
  FORCE_VARIANT: '@harmonize_force_variant', // Force a specific variant for testing
  HAS_LOGGED_IN: '@harmonize_has_logged_in',
};

export function LoginScreen() {
  const router = useRouter();
  const { initialize } = useABTestStore();

  const [participantId, setParticipantId] = useState('');
  const [isTesterMode, setIsTesterMode] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<'random' | 'A' | 'B'>('random');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    checkExistingLogin();
  }, []);

  const checkExistingLogin = async () => {
    try {
      const hasLoggedIn = await AsyncStorage.getItem(STORAGE_KEYS.HAS_LOGGED_IN);
      const savedParticipantId = await AsyncStorage.getItem(STORAGE_KEYS.PARTICIPANT_ID);
      const savedMode = await AsyncStorage.getItem(STORAGE_KEYS.IS_TESTER_MODE);

      if (hasLoggedIn === 'true' && savedParticipantId) {
        // User is already logged in, navigate to app
        console.log('[Login] Existing session found:', savedParticipantId, 'Mode:', savedMode);
        router.replace('/(tabs)/match');
      }
    } catch (error) {
      console.error('[Login] Error checking existing login:', error);
    }
  };

  const handleLogin = async () => {
    // Validate participant ID
    if (!participantId.trim()) {
      Alert.alert('Required', 'Please enter a participant ID');
      return;
    }

    // Validate format (alphanumeric, 3-20 characters)
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(participantId.trim())) {
      Alert.alert(
        'Invalid ID',
        'Participant ID must be 3-20 characters (letters, numbers, _, -)'
      );
      return;
    }

    setIsLoading(true);

    try {
      const cleanId = participantId.trim();

      // Store participant info
      await AsyncStorage.setItem(STORAGE_KEYS.PARTICIPANT_ID, cleanId);
      await AsyncStorage.setItem(STORAGE_KEYS.IS_TESTER_MODE, isTesterMode.toString());
      await AsyncStorage.setItem(STORAGE_KEYS.FORCE_VARIANT, selectedVariant);
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_LOGGED_IN, 'true');

      console.log('[Login] Participant logged in:', cleanId);
      console.log('[Login] Mode:', isTesterMode ? 'TESTER' : 'DEV');
      console.log('[Login] Variant Selection:', selectedVariant);

      // Initialize A/B test with participant ID
      await initialize(cleanId);

      // Navigate to app
      router.replace('/(tabs)/match');
    } catch (error) {
      console.error('[Login] Error during login:', error);
      Alert.alert('Error', 'Failed to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will log you out and delete all test data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                STORAGE_KEYS.PARTICIPANT_ID,
                STORAGE_KEYS.IS_TESTER_MODE,
                STORAGE_KEYS.FORCE_VARIANT,
                STORAGE_KEYS.HAS_LOGGED_IN,
                '@harmonize_ab_test_assignment',
                '@harmonize_ab_test_interactions',
              ]);
              Alert.alert('Success', 'All data cleared. You can log in again.');
              setParticipantId('');
            } catch (error) {
              console.error('[Login] Error clearing data:', error);
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Harmonize</Text>
          <Text style={styles.subtitle}>User Research Study</Text>
        </View>

        {/* Participant ID Input */}
        <View style={styles.inputSection}>
          <Text style={styles.label}>Participant ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., P001, researcher-1"
            placeholderTextColor={COLORS.text.tertiary}
            value={participantId}
            onChangeText={setParticipantId}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />
          <Text style={styles.hint}>
            Enter your assigned participant ID (3-20 characters)
          </Text>
        </View>

        {/* Variant Selection */}
        <View style={styles.modeSection}>
          <Text style={styles.modeLabel}>A/B Test Variant</Text>
          <View style={styles.variantButtons}>
            <TouchableOpacity
              style={[styles.variantButton, selectedVariant === 'random' && styles.variantButtonActive]}
              onPress={() => setSelectedVariant('random')}
              disabled={isLoading}
            >
              <Text style={[styles.variantButtonText, selectedVariant === 'random' && styles.variantButtonTextActive]}>
                Random
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.variantButton, selectedVariant === 'A' && styles.variantButtonActive]}
              onPress={() => setSelectedVariant('A')}
              disabled={isLoading}
            >
              <Text style={[styles.variantButtonText, selectedVariant === 'A' && styles.variantButtonTextActive]}>
                Variant A
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.variantButton, selectedVariant === 'B' && styles.variantButtonActive]}
              onPress={() => setSelectedVariant('B')}
              disabled={isLoading}
            >
              <Text style={[styles.variantButtonText, selectedVariant === 'B' && styles.variantButtonTextActive]}>
                Variant B
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.modeDescription}>
            {selectedVariant === 'random'
              ? '50/50 random assignment'
              : selectedVariant === 'A'
              ? 'Amazon-style reviews (stars + text)'
              : 'Badge system (visual badges)'}
          </Text>
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeSection}>
          <View style={styles.modeHeader}>
            <View>
              <Text style={styles.modeLabel}>
                {isTesterMode ? 'Tester Mode' : 'Developer Mode'}
              </Text>
              <Text style={styles.modeDescription}>
                {isTesterMode
                  ? 'Clean UI for user research participants'
                  : 'Shows variant info and debug logs'}
              </Text>
            </View>
            <Switch
              value={isTesterMode}
              onValueChange={setIsTesterMode}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.background}
              disabled={isLoading}
            />
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Starting...' : 'Start Session'}
          </Text>
        </TouchableOpacity>

        {/* Clear Data Button (for researchers) */}
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClearData}
          disabled={isLoading}
        >
          <Text style={styles.clearButtonText}>Clear All Data</Text>
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoText}>
            💡 Your interactions will be tracked for research purposes.
          </Text>
          <Text style={styles.infoText}>
            🔒 All data is stored locally and anonymized.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  hint: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  modeSection: {
    marginBottom: SPACING.xl,
  },
  modeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  modeDescription: {
    fontSize: 13,
    color: COLORS.text.secondary,
    maxWidth: '80%',
    marginTop: SPACING.xs,
  },
  variantButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginVertical: SPACING.sm,
  },
  variantButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  variantButtonActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  variantButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  variantButtonTextActive: {
    color: COLORS.primary,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.inverse,
  },
  clearButton: {
    backgroundColor: 'transparent',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
  infoSection: {
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});
