// Card component - Based on info-card.spec.md from Figma
// Reference: C:\Users\perfe\figma_harmonize\extracted\common\info-card.spec.md

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@constants';
import { moderateScale } from '@utils/responsive';

/**
 * Card Props Interface
 * Based on Figma InfoCard spec
 */
interface CardProps {
  /** Child content */
  children: React.ReactNode;

  /** Padding size (defaults to 'md' = 12px from Figma) */
  padding?: keyof typeof SPACING;

  /** Card variant */
  variant?: 'default' | 'elevated' | 'outlined';

  /** Custom styles */
  style?: ViewStyle | ViewStyle[];

  /** Optional left icon (24x24px from Figma spec) */
  icon?: React.ReactNode;

  /** Optional right badge/indicator (20x20px from Figma spec) */
  badge?: React.ReactNode;

  /** Make card pressable */
  onPress?: () => void;
}

/**
 * Card Component
 *
 * A container component with white background, shadow, and optional outline.
 * Based on Figma InfoCard which displays icon, text, and optional badge.
 *
 * Features:
 * - Default variant: white bg, subtle shadow, 1px outline ✓
 * - Elevated variant: stronger shadow, no outline ✓
 * - Outlined variant: border only, no shadow ✓
 * - Responsive padding based on screen size ✓
 * - Icon support (left side, 24x24px) ✓
 * - Badge support (right side, 20x20px) ✓
 *
 * TODO: Implement pressable state with visual feedback
 *
 * Figma Specs:
 * - Background: #FFFFFF (white)
 * - Padding: Scales with screen size using moderateScale
 * - Border: 1px solid outline
 * - Shadow: 0px 2px 8px rgba(0,0,0,0.1)
 * - Border Radius: 16px (lg)
 * - Icon: 24x24px, left side, 16px gap
 * - Badge: 20x20px, right side, 16px gap
 */
export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  variant = 'default',
  style,
  icon,
  badge,
  onPress,
}) => {
  // Apply responsive padding that scales with screen size
  const responsivePadding = moderateScale(SPACING[padding]);

  // Build container styles based on variant
  const containerStyle: ViewStyle[] = [
    styles.base,
    variant === 'default' && styles.default,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    { padding: responsivePadding },
    style,
  ].filter(Boolean) as ViewStyle[];

  // Use horizontal layout if icon or badge is provided
  const hasIconOrBadge = icon || badge;

  return (
    <View style={containerStyle}>
      {hasIconOrBadge ? (
        <View style={styles.contentRow}>
          {/* Icon container (24x24px) */}
          {icon && <View style={styles.iconContainer}>{icon}</View>}

          {/* Main content - flex to fill space */}
          <View style={styles.content}>{children}</View>

          {/* Badge container (20x20px) */}
          {badge && <View style={styles.badgeContainer}>{badge}</View>}
        </View>
      ) : (
        // Simple card without icon/badge
        children
      )}
    </View>
  );
};

/**
 * Card Styles
 * Based on Figma InfoCard specification with responsive padding
 */
const styles = StyleSheet.create({
  base: {
    // Base card appearance
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
  },

  default: {
    // Default variant: subtle shadow + outline
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  elevated: {
    // Elevated variant: stronger shadow, no border
    ...SHADOWS.lg,
  },

  outlined: {
    // Outlined variant: border only, no shadow
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  contentRow: {
    // Horizontal layout for icon/text/badge
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md, // 16px gap between elements
  },

  iconContainer: {
    // Icon container (24x24px from Figma)
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    // Main content - fills remaining space
    flex: 1,
  },

  badgeContainer: {
    // Badge container (20x20px from Figma)
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // TODO: Add pressed state styles when implementing Pressable
  // pressed: {
  //   backgroundColor: COLORS.surface,
  //   transform: [{ scale: 0.99 }],
  // }
});
