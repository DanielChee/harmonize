/**
 * Root Index - Redirects to login screen or main app
 * This is the entry point when app launches
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '@constants';

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const hasLoggedIn = await AsyncStorage.getItem('@harmonize_has_logged_in');

      if (hasLoggedIn === 'true') {
        // User is logged in, go to match screen
        router.replace('/(tabs)/match');
      } else {
        // User not logged in, show login screen
        router.replace('/login');
      }
    } catch (error) {
      console.error('[Index] Error checking login status:', error);
      // Default to login screen on error
      router.replace('/login');
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return null;
}
