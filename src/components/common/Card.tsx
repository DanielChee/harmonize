// Card component - Based on info-card.spec.md from Figma
// Reference: C:\Users\perfe\figma_harmonize\extracted\common\info-card.spec.md

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '@constants';

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
  style?: ViewStyle;

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
 * TODO: Implement the following based on spec:
 * 1. Default variant: white bg, subtle shadow, 1px outline
 * 2. Elevated variant: stronger shadow, no outline
 * 3. Outlined variant: border only, no shadow
 * 4. Dynamic padding based on prop
 * 5. Icon support (left side, 24x24px)
 * 6. Badge support (right side, 20x20px)
 * 7. Pressable state (if onPress provided)
 * 8. Pressed state: lighter bg (#F5F5F5), reduced shadow, scale 0.99
 *
 * Figma Specs:
 * - Background: #FFFFFF (white)
 * - Padding: 12px all sides (p-3)
 * - Border: 1px solid outline
 * - Shadow: 0px 2px 8px rgba(0,0,0,0.1)
 * - Border Radius: Inferred as 16px (medium)
 * - Icon: 24x24px, left side, 12px gap
 * - Badge: 20x20px, right side, 12px gap
 * - Pressed: #F5F5F5 bg, reduced shadow, scale 0.99
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
  // TODO: Implement container styles based on variant
  const containerStyle: ViewStyle[] = [
    styles.base,
    variant === 'default' && styles.default,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    { padding: SPACING[padding] },
    style,
  ];

  // TODO: If icon or badge provided, use horizontal layout
  const hasIconOrBadge = icon || badge;

  return (
    <View style={containerStyle}>
      {/* TODO: Render with proper layout if icon/badge present */}
      {hasIconOrBadge ? (
        <View style={styles.contentRow}>
          {/* TODO: Icon container (24x24px) */}
          {icon && <View style={styles.iconContainer}>{icon}</View>}

          {/* Main content - flex to fill space */}
          <View style={styles.content}>{children}</View>

          {/* TODO: Badge container (20x20px) */}
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
 * Styles
 *
 * TODO: Complete the following styles based on Figma spec:
 * - Base: borderRadius, white background, alignment
 * - Default: subtle shadow + 1px outline (from Figma)
 * - Elevated: stronger shadow, no outline
 * - Outlined: border only, no shadow
 * - Icon/badge containers: proper sizing and spacing
 */
const styles = StyleSheet.create({
  base: {
    // TODO: Base card styles
    // - backgroundColor: COLORS.background (#FFFFFF)
    // - borderRadius: BORDER_RADIUS.lg (16px - inferred from design)
    // - width: '100%' (self-stretch from Figma)
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
  },

  default: {
    // TODO: Default variant (Figma InfoCard style)
    // - Apply SHADOWS.card
    // - borderWidth: 1
    // - borderColor: COLORS.border
    ...SHADOWS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  elevated: {
    // TODO: Elevated variant
    // - Apply SHADOWS.lg (stronger shadow)
    // - No border
    ...SHADOWS.lg,
  },

  outlined: {
    // TODO: Outlined variant
    // - borderWidth: 1
    // - borderColor: COLORS.border
    // - No shadow
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  contentRow: {
    // TODO: Horizontal layout for icon/text/badge
    // - flexDirection: 'row'
    // - alignItems: 'center'
    // - gap: 12px (from Figma spec)
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md, // 16px - Figma says 12px, consider adjusting
  },

  iconContainer: {
    // TODO: Icon container
    // - width: 24px (from Figma spec)
    // - height: 24px
    // - justifyContent: 'center'
    // - alignItems: 'center'
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    // TODO: Content container
    // - flex: 1 (fill remaining space)
    flex: 1,
  },

  badgeContainer: {
    // TODO: Badge container
    // - width: 20px (from Figma spec)
    // - height: 20px
    // - justifyContent: 'center'
    // - alignItems: 'center'
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // TODO: Add pressed state styles
  // pressed: {
  //   backgroundColor: COLORS.surface (lighter gray)
  //   scale: 0.99
  //   Reduced shadow
  // }
});
