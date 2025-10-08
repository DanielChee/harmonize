// Button component - Based on ActionButtonPill.spec.md from Figma
// Reference: C:\Users\perfe\figma_harmonize\extracted\common\ActionButtonPill.spec.md

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants';

/**
 * Button Props Interface
 * Based on Figma ActionButtonPill spec
 */
interface ButtonProps {
  /** Button text */
  title: string;

  /** Press handler */
  onPress: () => void;

  /** Variant: filled (black bg, white text) or outlined (transparent bg, black text) */
  variant?: 'filled' | 'outlined';

  /** Disabled state */
  disabled?: boolean;

  /** Loading state - shows spinner */
  loading?: boolean;

  /** Optional icon (left side) */
  icon?: React.ReactNode;

  /** Full width button */
  fullWidth?: boolean;

  /** Custom styles */
  style?: ViewStyle;
}

/**
 * Button Component
 *
 * A pill-shaped button with two variants:
 * - Filled: Black background, white text (14px)
 * - Outlined: Transparent background, black text (12px), 1px border
 *
 * TODO: Implement the following based on spec:
 * 1. Filled variant styling
 * 2. Outlined variant styling
 * 3. Pressed state (scale 0.98, background change)
 * 4. Disabled state (gray colors, opacity 0.6)
 * 5. Loading state (spinner + disabled interaction)
 * 6. Icon support (left of text, 8px gap)
 * 7. Touch target minimum 44px height
 * 8. Haptic feedback on press (Haptics.impactAsync)
 *
 * Figma Specs:
 * - Border Radius: 30px (pill shape)
 * - Padding: 12px horizontal, 4px vertical (adjust for 44px touch target)
 * - Filled: #000000 bg, #FFFFFF text, 14px
 * - Outlined: transparent bg, #000000 text, 12px, 1px border
 * - Pressed: scale 0.98, filled -> #333333 bg, outlined -> #F5F5F5 bg
 * - Disabled: #CCCCCC colors, 0.6 opacity
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
}) => {
  // TODO: Implement press handler with haptic feedback
  const handlePress = () => {
    // TODO: Add Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (!disabled && !loading) {
      onPress();
    }
  };

  // TODO: Implement variant-specific styles
  const buttonStyle: ViewStyle[] = [
    styles.base,
    variant === 'filled' ? styles.filled : styles.outlined,
    disabled && styles.disabled,
    fullWidth && styles.fullWidth,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.text,
    variant === 'filled' ? styles.textFilled : styles.textOutlined,
    disabled && styles.textDisabled,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {/* TODO: Render icon if provided */}
      {icon && <>{/* Icon goes here with 8px gap */}</>}

      {/* TODO: Show loading spinner or text */}
      {loading ? (
        <ActivityIndicator
          color={variant === 'filled' ? COLORS.text.inverse : COLORS.text.primary}
          size="small"
        />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

/**
 * Styles
 *
 * TODO: Complete the following styles based on Figma spec:
 * - Base: pill shape (borderRadius 30), padding, alignment
 * - Filled: #000000 background, no border
 * - Outlined: transparent background, 1px black border
 * - Text sizes: filled 14px, outlined 12px
 * - Disabled: gray colors, reduced opacity
 * - Touch target: ensure 44px minimum height
 */
const styles = StyleSheet.create({
  base: {
    // TODO: Add base styles
    // - borderRadius: BORDER_RADIUS.pill (30px)
    // - paddingHorizontal: SPACING.md (16px) - Figma says 12px, consider adjusting
    // - paddingVertical: 15px (to reach 44px touch target)
    // - flexDirection: 'row'
    // - alignItems: 'center'
    // - justifyContent: 'center'
    // - gap: 8px (for icon spacing)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: 15, // Adjusted for 44px touch target
    minHeight: 44, // iOS HIG minimum
  },

  filled: {
    // TODO: Filled variant
    // - backgroundColor: '#000000'
    backgroundColor: '#000000',
  },

  outlined: {
    // TODO: Outlined variant
    // - backgroundColor: 'transparent'
    // - borderWidth: 1
    // - borderColor: '#000000'
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
  },

  disabled: {
    // TODO: Disabled state
    // - opacity: 0.6
    // - backgroundColor: '#CCCCCC' (for filled)
    opacity: 0.6,
  },

  fullWidth: {
    // TODO: Full width variant
    // - width: '100%'
    width: '100%',
  },

  text: {
    // TODO: Base text styles
    // - fontWeight: '400'
    // - textAlign: 'center'
    fontWeight: '400',
    textAlign: 'center',
  },

  textFilled: {
    // TODO: Filled text
    // - color: '#FFFFFF'
    // - fontSize: 14
    color: '#FFFFFF',
    fontSize: 14,
  },

  textOutlined: {
    // TODO: Outlined text
    // - color: '#000000'
    // - fontSize: 12
    color: '#000000',
    fontSize: 12,
  },

  textDisabled: {
    // TODO: Disabled text
    // - color: '#CCCCCC'
    color: '#CCCCCC',
  },
});
