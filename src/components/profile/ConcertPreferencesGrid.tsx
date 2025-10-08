// ConcertPreferencesGrid - Concert Matching Preferences
// Shows budget, seating, transport, and matching preferences in a 2x2 grid

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from '@constants';
import { MaterialIcons } from '@expo/vector-icons';

export type BudgetPreference = 'budget-friendly' | 'mid-range' | 'premium' | 'any';
export type SeatingPreference = 'seated' | 'standing' | 'pit' | 'any';
export type TransportPreference = 'can-drive' | 'need-ride' | 'public-transport' | 'any';
export type MatchingPreference = 'group' | 'partner' | 'flexible';

interface ConcertPreferencesGridProps {
  budget?: BudgetPreference;
  seating?: SeatingPreference;
  transport?: TransportPreference;
  matching?: MatchingPreference;
}

/**
 * Concert Preferences Grid Component
 *
 * Design from Figma Mid-Detail Profile:
 * - 2x2 grid of preference cards
 * - Icon + text for each preference
 * - Budget, Seating, Transport, Matching style
 * - Compact display optimized for quick scanning
 */
export const ConcertPreferencesGrid: React.FC<ConcertPreferencesGridProps> = ({
  budget = 'any',
  seating = 'any',
  transport = 'any',
  matching = 'flexible'
}) => {
  const preferences = [
    {
      icon: 'attach-money',
      label: getBudgetLabel(budget),
      value: budget
    },
    {
      icon: 'airline-seat-recline-normal',
      label: getSeatingLabel(seating),
      value: seating
    },
    {
      icon: 'directions-car',
      label: getTransportLabel(transport),
      value: transport
    },
    {
      icon: 'people',
      label: getMatchingLabel(matching),
      value: matching
    }
  ];

  return (
    <View style={styles.grid}>
      {preferences.map((pref, index) => (
        <View key={index} style={styles.preferenceCard}>
          <MaterialIcons
            name={pref.icon as any}
            size={24}
            color={COLORS.primary}
          />
          <Text style={styles.preferenceLabel}>{pref.label}</Text>
        </View>
      ))}
    </View>
  );
};

// Helper functions to get readable labels
function getBudgetLabel(budget: BudgetPreference): string {
  switch (budget) {
    case 'budget-friendly': return 'Budget-friendly';
    case 'mid-range': return 'Mid-range';
    case 'premium': return 'Premium';
    case 'any': return 'Any budget';
    default: return 'Any budget';
  }
}

function getSeatingLabel(seating: SeatingPreference): string {
  switch (seating) {
    case 'seated': return 'Seated';
    case 'standing': return 'Standing';
    case 'pit': return 'Mosh pit';
    case 'any': return 'Any seating';
    default: return 'Any seating';
  }
}

function getTransportLabel(transport: TransportPreference): string {
  switch (transport) {
    case 'can-drive': return 'Can drive';
    case 'need-ride': return 'Need ride';
    case 'public-transport': return 'Public transit';
    case 'any': return 'Flexible';
    default: return 'Flexible';
  }
}

function getMatchingLabel(matching: MatchingPreference): string {
  switch (matching) {
    case 'group': return 'Group';
    case 'partner': return '1-on-1';
    case 'flexible': return 'Flexible';
    default: return 'Flexible';
  }
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  preferenceCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.xs,
  },
  preferenceLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
    textAlign: 'center',
  },
});
