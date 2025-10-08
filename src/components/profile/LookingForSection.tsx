// LookingForSection - Concert Buddy Search Card
// Shows current concert interest with event details

import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Card } from '@components';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';

export interface Concert {
  id: string;
  artist: string;
  venue: string;
  date: string;
  image_url?: string;
}

interface LookingForSectionProps {
  concert?: Concert;
  lookingForBuddy?: boolean;
}

/**
 * Looking For Section Component
 *
 * Design from Figma High-Detail Profile:
 * - Highlighted concert card showing current interest
 * - "Looking for a concert buddy" indicator
 * - Artist name, venue, date
 * - Optional artist/event image
 * - Used in High and Mid detail views
 */
export const LookingForSection: React.FC<LookingForSectionProps> = ({
  concert,
  lookingForBuddy = false
}) => {
  if (!concert || !lookingForBuddy) {
    return null;
  }

  return (
    <Card variant="default" style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="confirmation-number" size={24} color={COLORS.primary} />
        <Text style={styles.headerText}>Looking for a concert buddy</Text>
      </View>

      <View style={styles.concertInfo}>
        {concert.image_url && (
          <Image
            source={{ uri: concert.image_url }}
            style={styles.concertImage}
          />
        )}

        <View style={styles.concertDetails}>
          <Text style={styles.artistName}>{concert.artist}</Text>
          <View style={styles.detailRow}>
            <MaterialIcons name="place" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>{concert.venue}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="calendar-today" size={16} color={COLORS.text.secondary} />
            <Text style={styles.detailText}>{concert.date}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.primary}15`, // Light tint of primary color
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  headerText: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
  },
  concertInfo: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  concertImage: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.md,
  },
  concertDetails: {
    flex: 1,
    gap: SPACING.xs,
  },
  artistName: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
});
