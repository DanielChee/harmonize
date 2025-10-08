// ConcertInterestPill - Minimal Concert Interest Indicator
// Frosted glass overlay showing concert interest for low-detail swipe cards

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';

interface ConcertInterestPillProps {
  concertName?: string;
  isLookingForBuddy?: boolean;
}

/**
 * Concert Interest Pill Component
 *
 * Design from Figma Low-Detail Profile:
 * - Frosted glass effect overlay
 * - Minimal text: just concert name or "Looking for buddy"
 * - Positioned over profile photo
 * - Tinder/Instagram Story aesthetic
 * - Only shown when user has active concert interest
 */
export const ConcertInterestPill: React.FC<ConcertInterestPillProps> = ({
  concertName,
  isLookingForBuddy = false
}) => {
  if (!concertName || !isLookingForBuddy) {
    return null;
  }

  return (
    <BlurView intensity={80} tint="dark" style={styles.container}>
      <View style={styles.content}>
        <MaterialIcons name="confirmation-number" size={16} color={COLORS.background} />
        <Text style={styles.text} numberOfLines={1}>
          {concertName}
        </Text>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.pill,
    overflow: 'hidden',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  text: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.background,
    fontWeight: TYPOGRAPHY.weights.semibold,
    maxWidth: 200,
  },
});
