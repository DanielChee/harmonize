/**
 * Step 3: Concert Preferences
 * Collects budget, seating preference, and transportation preference
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';

interface ConcertPreferencesStepProps {
  formData: {
    concert_budget: string;
    concert_seating: string;
    concert_transportation: string;
  };
  updateFormData: (updates: Partial<ConcertPreferencesStepProps['formData']>) => void;
}

const BUDGET_OPTIONS = [
  '$0-50',
  '$50-100',
  '$100-200',
  '$200-300',
  '$300+',
];

const SEATING_OPTIONS = [
  'General Admission',
  'Reserved Seating',
  'VIP',
  'Any',
];

const TRANSPORTATION_OPTIONS = [
  'Drive',
  'Public Transit',
  'Rideshare (Uber/Lyft)',
  'Walking',
  'Other',
];

export const ConcertPreferencesStep: React.FC<ConcertPreferencesStepProps> = ({
  formData,
  updateFormData,
}) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.description}>
        Tell us about your concert preferences. This helps us match you with compatible concert buddies!
      </Text>

      {/* Budget */}
      <View style={styles.section}>
        <Text style={styles.label}>Concert Budget *</Text>
        <Text style={styles.subLabel}>How much do you typically spend per concert?</Text>
        <View style={styles.optionsList}>
          {BUDGET_OPTIONS.map((option) => (
            <OptionButton
              key={option}
              label={option}
              selected={formData.concert_budget === option}
              onPress={() => updateFormData({ concert_budget: option })}
            />
          ))}
        </View>
      </View>

      {/* Seating Preference */}
      <View style={styles.section}>
        <Text style={styles.label}>Seating Preference *</Text>
        <Text style={styles.subLabel}>What type of seating do you prefer?</Text>
        <View style={styles.optionsList}>
          {SEATING_OPTIONS.map((option) => (
            <OptionButton
              key={option}
              label={option}
              selected={formData.concert_seating === option}
              onPress={() => updateFormData({ concert_seating: option })}
            />
          ))}
        </View>
      </View>

      {/* Transportation */}
      <View style={styles.section}>
        <Text style={styles.label}>Transportation Preference *</Text>
        <Text style={styles.subLabel}>How do you typically get to concerts?</Text>
        <View style={styles.optionsList}>
          {TRANSPORTATION_OPTIONS.map((option) => (
            <OptionButton
              key={option}
              label={option}
              selected={formData.concert_transportation === option}
              onPress={() => updateFormData({ concert_transportation: option })}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

interface OptionButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

const OptionButton: React.FC<OptionButtonProps> = ({ label, selected, onPress }) => {
  return (
    <TouchableOpacity
      style={[styles.optionButton, selected && styles.optionButtonSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
        {label}
      </Text>
      {selected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  description: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xl,
    lineHeight: 22,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  subLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.md,
  },
  optionsList: {
    gap: SPACING.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  optionTextSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: COLORS.text.inverse,
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
});

