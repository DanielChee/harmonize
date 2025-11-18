/**
 * Step 3: Concert Preferences
 * Collects budget, seating preference, and transportation preference
 */

import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConcertPreferencesStepProps {
  formData: {
    concert_budget: string;
    concert_seating: string;
    concert_transportation: string;
  };
  updateFormData: (updates: Partial<ConcertPreferencesStepProps['formData']>) => void;
}

// Budget options - values match ConcertPreferencesGrid types
const BUDGET_OPTIONS = [
  { value: 'budget-friendly', label: '$0-100 (Budget-friendly)' },
  { value: 'mid-range', label: '$100-300 (Mid-range)' },
  { value: 'premium', label: '$300+ (Premium)' },
  { value: 'any', label: 'Any budget' },
];

// Seating options - values match ConcertPreferencesGrid types
const SEATING_OPTIONS = [
  { value: 'standing', label: 'Standing' },
  { value: 'seated', label: 'Seated' },
  { value: 'pit', label: 'Pit' },
  { value: 'any', label: 'Any seating' },
];

// Transportation options - values match ConcertPreferencesGrid types
const TRANSPORTATION_OPTIONS = [
  { value: 'can-drive', label: 'I can drive' },
  { value: 'public-transport', label: 'Public Transit' },
  { value: 'need-ride', label: 'Need a ride / Rideshare' },
  { value: 'any', label: 'Flexible' },
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
              key={option.value}
              label={option.label}
              selected={formData.concert_budget === option.value}
              onPress={() => updateFormData({ concert_budget: option.value })}
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
              key={option.value}
              label={option.label}
              selected={formData.concert_seating === option.value}
              onPress={() => updateFormData({ concert_seating: option.value })}
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
              key={option.value}
              label={option.label}
              selected={formData.concert_transportation === option.value}
              onPress={() => updateFormData({ concert_transportation: option.value })}
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

