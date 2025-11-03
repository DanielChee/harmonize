/**
 * A/B Test Profile Card Wrapper
 * Displays either ProfileCardA or ProfileCardB based on user's variant
 * Includes silent tracking of user behavior
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import type { TestProfile } from '@types';
import { useABTestStore } from '@store';
import { ProfileCardA } from './ProfileCardA';
import { ProfileCardB } from './ProfileCardB';

interface ABTestProfileCardProps {
  profile: TestProfile;
  onDecision?: (decision: 'like' | 'pass' | 'block') => void;
}

export function ABTestProfileCard({ profile, onDecision }: ABTestProfileCardProps) {
  const { variant, trackView, trackDecision } = useABTestStore();
  const [profileLoadTime, setProfileLoadTime] = useState<number>(0);

  // Track when profile is viewed
  useEffect(() => {
    const startTracking = async () => {
      const loadTime = await trackView(profile.id, profile.profileType);
      setProfileLoadTime(loadTime);
    };

    startTracking();
  }, [profile.id]);

  // Handle user decision (like/pass/block)
  const handleDecision = async (decision: 'like' | 'pass' | 'block') => {
    // Track the decision
    await trackDecision(profile.id, profile.profileType, profileLoadTime, decision);

    // Call parent handler if provided
    if (onDecision) {
      onDecision(decision);
    }
  };

  // Expose decision handler to parent via ref or context if needed
  // For now, parent can pass onDecision callback

  return (
    <View style={styles.container}>
      {variant === 'A' && <ProfileCardA profile={profile} />}
      {variant === 'B' && <ProfileCardB profile={profile} />}
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
