/**
 * Root Index - Redirects to login screen or main app
 * This is the entry point when app launches
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '@constants';
import { getSession } from '@services/supabase/auth';

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // Check for Supabase session
      const session = await getSession();

      if (session?.user) {
        // User has active session, go to match screen
        console.log('[Index] Session found, redirecting to match');
        router.replace('/(tabs)/match');
      } else {
        // No session, show login screen
        console.log('[Index] No session, redirecting to login');
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
