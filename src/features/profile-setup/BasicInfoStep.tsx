/**
 * Step 1: Basic Information
 * Collects name, location (city), age, MBTI, pronouns, and bio
 */

import { Input } from '@components/common/Input';
import { SearchableDropdown } from '@components/common/SearchableDropdown';
import { COLORS, SPACING, TYPOGRAPHY } from '@constants';
import { MAJOR_CITIES, searchCities } from '@utils/locations';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BasicInfoStepProps {
  formData: {
    display_name: string;
    city: string;
    age: number;
    mbti: string;
    pronouns: string;
    bio: string;
  };
  updateFormData: (updates: Partial<BasicInfoStepProps['formData']>) => void;
  onFieldInteraction?: () => void;
}

const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

const PRONOUNS_OPTIONS = [
  'she/her',
  'he/him',
  'they/them',
];

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formData, updateFormData, onFieldInteraction }) => {
  // City search handler - uses the searchCities utility function
  const handleCitySearch = async (query: string): Promise<string[]> => {
    return await searchCities(query);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.description}>
        Let's start with the basics. This information helps others get to know you.
      </Text>

      {/* Display Name */}
      <Input
        label="Display Name *"
        placeholder="Enter your name"
        value={formData.display_name}
        onChangeText={(text) => updateFormData({ display_name: text })}
        onFocus={onFieldInteraction}
        autoCapitalize="words"
        maxLength={50}
      />

      {/* Location */}
      <SearchableDropdown
        label="City *"
        placeholder="Select city"
        value={formData.city}
        options={MAJOR_CITIES.slice(0, 20)}
        onSelect={(cityWithState) => {
          // Store full "City, State" format in city field
          updateFormData({ 
            city: cityWithState,
          });
        }}
        onSearchChange={handleCitySearch}
        onInteraction={onFieldInteraction}
        searchPlaceholder="Search cities..."
      />

      {/* Age */}
      <Input
        label="Age *"
        placeholder="Enter your age"
        value={formData.age > 0 ? formData.age.toString() : ''}
        onChangeText={(text) => {
          const age = parseInt(text, 10);
          if (!isNaN(age) && age > 0) {
            updateFormData({ age });
          } else if (text === '') {
            updateFormData({ age: 0 });
          }
        }}
        onFocus={onFieldInteraction}
        keyboardType="numeric"
        maxLength={3}
      />

      {/* MBTI */}
      <View style={styles.section}>
        <Text style={styles.label}>MBTI Type</Text>
        <View style={styles.optionsGrid}>
          {MBTI_OPTIONS.map((type) => (
            <OptionButton
              key={type}
              label={type}
              selected={formData.mbti === type}
              onPress={() => updateFormData({ mbti: formData.mbti === type ? '' : type })}
            />
          ))}
        </View>
      </View>

      {/* Pronouns */}
      <View style={styles.section}>
        <Text style={styles.label}>Pronouns *</Text>
        <View style={styles.optionsList}>
          {PRONOUNS_OPTIONS.map((pronoun) => (
            <OptionButton
              key={pronoun}
              label={pronoun}
              selected={formData.pronouns === pronoun}
              onPress={() => updateFormData({ pronouns: pronoun })}
            />
          ))}
        </View>
      </View>

      {/* Bio */}
      <Input
        label="Short Bio *"
        placeholder="Tell us a little about yourself..."
        value={formData.bio}
        onChangeText={(text) => updateFormData({ bio: text })}
        onFocus={onFieldInteraction}
        multiline
        numberOfLines={4}
        maxLength={200}
      />
      <Text style={styles.hint}>
        {formData.bio.length}/200 characters
      </Text>
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
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  optionsList: {
    gap: SPACING.sm,
  },
  optionButton: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  optionTextSelected: {
    color: COLORS.text.inverse,
  },
  hint: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    marginTop: -SPACING.md,
    marginBottom: SPACING.md,
    textAlign: 'right',
  },
});

