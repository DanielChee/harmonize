// SettingsRow component - Based on settings-row.spec.md from Figma
// Reference: C:\Users\perfe\figma_harmonize\extracted\common\settings-row.spec.md

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SPACING } from '@constants';

/**
 * SettingsRow Props Interface
 * Based on Figma SettingsRow spec
 */
interface SettingsRowProps {
  /** Primary label text */
  label: string;

  /** Optional secondary description text */
  description?: string;

  /** Current value to display (right side) */
  value?: string;

  /** Show chevron indicator (defaults to true) */
  showChevron?: boolean;

  /** Custom right-side component (e.g., Switch, Badge) */
  rightComponent?: React.ReactNode;

  /** Press handler */
  onPress?: () => void;

  /** Disabled state */
  disabled?: boolean;

  /** Custom styles */
  style?: ViewStyle;
}

/**
 * SettingsRow Component
 *
 * A horizontal row for settings/profile edit screens with:
 * - Left: Label + optional description (stacked)
 * - Right: Optional value + chevron or custom component
 *
 * TODO: Implement the following based on spec:
 * 1. Two-column layout: label group (left) + value/chevron (right)
 * 2. Label: 14px black text
 * 3. Description: 12px black 50% opacity (if provided)
 * 4. Value: 14px black text (if provided)
 * 5. Chevron: 16x16px, black 80% opacity (if showChevron)
 * 6. Pressed state: #F5F5F5 background, scale 0.99
 * 7. Disabled state: faded text, reduced opacity
 * 8. Touch target: 48px height (exceeds 44px minimum)
 * 9. Haptic feedback on press
 * 10. Optional custom rightComponent (e.g., Switch)
 *
 * Figma Specs:
 * - Height: 48px (h-12)
 * - Width: Full width (320px or self-stretch)
 * - Label: 14px, normal, black
 * - Description: 12px, normal, black 50%
 * - Value: 14px, normal, black
 * - Chevron: 16x16px, black 80%
 * - Gap between value and chevron: 4px
 * - Pressed: #F5F5F5 background, scale 0.99
 */
export const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  description,
  value,
  showChevron = true,
  rightComponent,
  onPress,
  disabled = false,
  style,
}) => {
  // TODO: Implement press handler with haptic feedback
  const handlePress = () => {
    // TODO: Add Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (!disabled && onPress) {
      onPress();
    }
  };

  // TODO: Determine if row is interactive
  const isInteractive = !disabled && !!onPress;

  // TODO: Build container styles
  const containerStyle: ViewStyle[] = [
    styles.container,
    disabled && styles.disabled,
    style,
  ];

  const labelStyle: TextStyle[] = [
    styles.label,
    disabled && styles.textDisabled,
  ];

  const descriptionStyle: TextStyle[] = [
    styles.description,
    disabled && styles.textDisabled,
  ];

  const valueStyle: TextStyle[] = [
    styles.value,
    disabled && styles.textDisabled,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={handlePress}
      disabled={!isInteractive}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={`${label}${value ? `, ${value}` : ''}`}
      accessibilityHint={description}
      accessibilityState={{ disabled }}
    >
      {/* Left side: Label + Description */}
      <View style={styles.leftContent}>
        <Text style={labelStyle} numberOfLines={1}>
          {label}
        </Text>
        {description && (
          <Text style={descriptionStyle} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>

      {/* Right side: Value + Chevron or Custom Component */}
      <View style={styles.rightContent}>
        {/* Custom component takes precedence */}
        {rightComponent ? (
          rightComponent
        ) : (
          <>
            {/* Value text */}
            {value && (
              <Text style={valueStyle} numberOfLines={1}>
                {value}
              </Text>
            )}

            {/* Chevron icon */}
            {showChevron && (
              <MaterialIcons
                name="chevron-right"
                size={16}
                color={disabled ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.8)'}
                style={styles.chevron}
              />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

/**
 * Styles
 *
 * TODO: Complete the following styles based on Figma spec:
 * - Container: 48px height, horizontal layout, space-between
 * - Left content: label + description stacked
 * - Right content: value + chevron horizontal
 * - Text sizes: label 14px, description 12px, value 14px
 * - Colors: label black, description 50% black, value black
 * - Pressed state: light gray background
 */
const styles = StyleSheet.create({
  container: {
    // TODO: Container styles
    // - height: 48px (from Figma)
    // - flexDirection: 'row'
    // - alignItems: 'center'
    // - justifyContent: 'space-between'
    // - paddingHorizontal: SPACING.md (16px)
    // - backgroundColor: 'transparent'
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    backgroundColor: 'transparent',
  },

  disabled: {
    // TODO: Disabled state
    // - opacity: 0.6
    opacity: 0.6,
  },

  leftContent: {
    // TODO: Left side (label + description)
    // - flex: 1 (take available space)
    // - justifyContent: 'center'
    // - gap: 2px (minimal gap between label and description)
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },

  rightContent: {
    // TODO: Right side (value + chevron)
    // - flexDirection: 'row'
    // - alignItems: 'center'
    // - gap: 4px (from Figma spec)
    // - marginLeft: SPACING.sm (8px)
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: SPACING.sm,
  },

  label: {
    // TODO: Label text
    // - fontSize: 14
    // - fontWeight: '400'
    // - color: COLORS.text.primary (#000000)
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text.primary,
  },

  description: {
    // TODO: Description text
    // - fontSize: 12
    // - fontWeight: '400'
    // - color: 'rgba(0, 0, 0, 0.5)'
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(0, 0, 0, 0.5)',
  },

  value: {
    // TODO: Value text
    // - fontSize: 14
    // - fontWeight: '400'
    // - color: COLORS.text.primary (#000000)
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text.primary,
  },

  textDisabled: {
    // TODO: Disabled text
    // - color: 'rgba(0, 0, 0, 0.3)'
    color: 'rgba(0, 0, 0, 0.3)',
  },

  chevron: {
    // TODO: Chevron icon (handled by MaterialIcons size/color props)
    // Additional styles if needed
  },

  // TODO: Add pressed state styles
  // pressed: {
  //   backgroundColor: COLORS.surface (#F5F5F5)
  //   scale: 0.99
  // }
});
