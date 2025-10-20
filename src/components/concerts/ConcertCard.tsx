// ConcertCard - Concert listing card component
// Based on Figma concert-card-large design

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@constants';
import type { MockConcert } from '@utils/mockConcerts';

interface ConcertCardProps {
  concert: MockConcert;
  onPress?: () => void;
  onSaveToggle?: () => void;
}

export const ConcertCard: React.FC<ConcertCardProps> = ({
  concert,
  onPress,
  onSaveToggle,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Concert Image */}
        <Image
          source={{ uri: concert.image }}
          style={styles.concertImage}
        />

        {/* Date Badge */}
        <View style={styles.dateBadge}>
          <Text style={styles.dateMonth}>{concert.month}</Text>
          <Text style={styles.dateDay}>{concert.day}</Text>
        </View>
      </View>

      {/* Concert Info */}
      <View style={styles.infoRow}>
        <View style={styles.infoContent}>
          <Text style={styles.artistName} numberOfLines={1}>
            {concert.artist}
          </Text>
          <Text style={styles.venueText} numberOfLines={1}>
            {concert.venue}, {concert.city}
          </Text>
        </View>

        {/* Save/Bookmark Button */}
        <TouchableOpacity
          onPress={onSaveToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons
            name={concert.isSaved ? 'bookmark' : 'bookmark-border'}
            size={24}
            color={concert.isSaved ? COLORS.primary : COLORS.text.secondary}
          />
        </TouchableOpacity>
      </View>

      {/* Sold Out Badge (if applicable) */}
      {!concert.ticketsAvailable && (
        <View style={styles.soldOutBadge}>
          <Text style={styles.soldOutText}>SOLD OUT</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  cardContent: {
    position: 'relative',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  concertImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
  },
  dateBadge: {
    position: 'absolute',
    top: SPACING.md,
    left: SPACING.md,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    minWidth: 50,
  },
  dateMonth: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    textTransform: 'uppercase',
  },
  dateDay: {
    fontSize: TYPOGRAPHY.sizes.lg,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  infoContent: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  artistName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  venueText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
  },
  soldOutBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.error,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  soldOutText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.inverse,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});
