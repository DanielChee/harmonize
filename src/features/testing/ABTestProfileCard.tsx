/**
 * A/B Test Profile Card Wrapper
 * Displays either ProfileCardA or ProfileCardB based on user's variant
 * Includes silent tracking of user behavior
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import type { TestProfile } from '@types';
import { useABTestStore } from '@store';
import { ProfileCardA } from './ProfileCardA';
import { ProfileCardB } from './ProfileCardB';

interface ABTestProfileCardProps {
  profile: TestProfile;
}

export function ABTestProfileCard({ profile }: ABTestProfileCardProps) {
  const { variant, trackView } = useABTestStore();

  // Track when profile is viewed
  useEffect(() => {
    const startTracking = async () => {
      await trackView(profile.id, profile.profileType);
    };

    startTracking();
  }, [profile.id, profile.profileType, trackView]);

  return (
    <View style={styles.container}>
      {variant === 'A' && <ProfileCardA profile={profile} />}
      {variant === 'B' && (
        <ProfileCardB 
          profile={profile} 
          profilePictureUrl={profile.image}
          topGenres={profile.top_genres}
          topArtists={profile.top_artists}
          topSongs={profile.top_songs}
          concertsAttended={profile.concertsAttended}
        />
      )}
    </View>
  );
}

// Export a hook to access decision tracking from parent
export function useProfileDecisionHandler(
  profileId: string,
  profileType: 'positive' | 'neutral' | 'negative',
  profileLoadTime: number
) {
  const { trackDecision } = useABTestStore();

  return async (decision: 'like' | 'pass' | 'block') => {
    await trackDecision(profileId, profileType, profileLoadTime, decision);
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
