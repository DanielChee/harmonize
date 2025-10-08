// Tag component - Based on genre-tag.spec.md from Figma
// Reference: C:\Users\perfe\figma_harmonize\extracted\common\genre-tag.spec.md

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '@constants';

/**
 * Tag Props Interface
 * Based on Figma GenreTag spec
 */
interface TagProps {
  /** Tag label text */
  label: string;

  /** Selected state (green background) */
  selected?: boolean;

  /** Press handler - if provided, tag is interactive */
  onPress?: () => void;

  /** Disabled state */
  disabled?: boolean;

  /** Read-only variant (light gray, non-interactive) */
  readOnly?: boolean;

  /** Custom styles */
  style?: ViewStyle;
}

/**
 * Tag Component
 *
 * A rectangular tag with rounded corners for displaying genres, categories, or filters.
 * Features two main states: unselected (outlined) and selected (filled green).
 *
 * TODO: Implement the following based on spec:
 * 1. Unselected state: transparent bg, black text, black 50% border
 * 2. Selected state: Spotify green bg, white text, green border
 * 3. Pressed states: lighter/darker backgrounds, scale 0.99
 * 4. Disabled state: faded colors, reduced opacity
 * 5. Read-only variant: light gray bg, non-interactive
 * 6. Toggle animation: 200ms color transition
 * 7. Haptic feedback on toggle
 * 8. Text truncation with ellipsis
 *
 * Figma Specs:
 * - Height: 40px
 * - Border Radius: 5px
 * - Padding: 12px horizontal, 10px vertical
 * - Font: 14px, weight 400, black/white
 * - Unselected: transparent bg, rgba(0,0,0,0.5) border
 * - Selected: #1DB954 bg, white text
 * - Pressed (unselected): #F5F5F5 bg
 * - Pressed (selected): #17A348 bg (darker green)
 */
export const Tag: React.FC<TagProps> = ({
  label,
  selected = false,
  onPress,
  disabled = false,
  readOnly = false,
  style,
}) => {
  // TODO: Implement press handler with haptic feedback
  const handlePress = () => {
    // TODO: Add Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    if (!disabled && !readOnly && onPress) {
      onPress();
    }
  };

  // TODO: Determine if tag is interactive
  const isInteractive = !disabled && !readOnly && !!onPress;

  // TODO: Build container styles based on state
  const containerStyle: ViewStyle[] = [
    styles.base,
    selected ? styles.selected : styles.unselected,
    readOnly && styles.readOnly,
    disabled && styles.disabled,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.text,
    selected ? styles.textSelected : styles.textUnselected,
    disabled && styles.textDisabled,
  ].filter(Boolean) as TextStyle[];

  // Render as TouchableOpacity if interactive, View if not
  const Component = isInteractive ? TouchableOpacity : ({ children, ...props }: any) => (
    <TouchableOpacity {...props} activeOpacity={1}>
      {children}
    </TouchableOpacity>
  );

  return (
    <Component
      style={containerStyle}
      onPress={handlePress}
      disabled={!isInteractive}
      activeOpacity={0.8}
      accessibilityRole={isInteractive ? 'button' : 'text'}
      accessibilityLabel={label}
      accessibilityState={{ selected, disabled }}
    >
      <Text style={textStyle} numberOfLines={1} ellipsizeMode="tail">
        {label}
      </Text>
    </Component>
  );
};

/**
 * Styles
 *
 * TODO: Complete the following styles based on Figma spec:
 * - Base: 40px height, 5px radius, padding
 * - Unselected: transparent bg, black 50% border
 * - Selected: Spotify green bg, white text, green border
 * - Read-only: light gray bg, gray border
 * - Disabled: faded colors, reduced opacity
 * - Text: 14px, proper alignment
 */
const styles = StyleSheet.create({
  base: {
    // TODO: Base tag styles
    // - height: 40px (from Figma)
    // - borderRadius: 5px (BORDER_RADIUS.sm)
    // - paddingHorizontal: 12px
    // - paddingVertical: 10px
    // - justifyContent: 'center'
    // - alignItems: 'center'
    // - borderWidth: 1
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.md, // 16px - Figma says 12px
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  unselected: {
    // TODO: Unselected state (outlined)
    // - backgroundColor: 'transparent'
    // - borderColor: 'rgba(0, 0, 0, 0.5)'
    backgroundColor: 'transparent',
    borderColor: 'rgba(0, 0, 0, 0.5)',
  },

  selected: {
    // TODO: Selected state (filled green)
    // - backgroundColor: COLORS.primary (#1DB954)
    // - borderColor: COLORS.primary
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  readOnly: {
    // TODO: Read-only variant
    // - backgroundColor: COLORS.surface (#F5F5F5)
    // - borderColor: COLORS.border
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },

  disabled: {
    // TODO: Disabled state
    // - opacity: 0.5
    // - borderColor: 'rgba(0, 0, 0, 0.2)'
    opacity: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },

  text: {
    // TODO: Base text styles
    // - fontSize: 14
    // - fontWeight: '400'
    fontSize: 14,
    fontWeight: '400',
  },

  textUnselected: {
    // TODO: Unselected text
    // - color: COLORS.text.primary (#000000)
    color: COLORS.text.primary,
  },

  textSelected: {
    // TODO: Selected text
    // - color: COLORS.text.inverse (#FFFFFF)
    color: COLORS.text.inverse,
  },

  textDisabled: {
    // TODO: Disabled text
    // - color: 'rgba(0, 0, 0, 0.3)'
    color: 'rgba(0, 0, 0, 0.3)',
  },

  // TODO: Add pressed state styles
  // pressedUnselected: {
  //   backgroundColor: COLORS.surface (#F5F5F5)
  //   scale: 0.99
  // }
  // pressedSelected: {
  //   backgroundColor: COLORS.primaryDark (#17A348 or #1AA34A)
  //   scale: 0.99
  // }
});
