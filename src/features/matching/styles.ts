import { COLORS, SPACING, TYPOGRAPHY } from "@constants";
import { responsiveSizes } from "@utils/responsive";
import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  viewModeText: {
    ...TYPOGRAPHY.scale.caption,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.medium as any,
  },
  profileCounter: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  counterText: {
    ...TYPOGRAPHY.scale.caption,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium as any,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: 0, // Remove any padding that might cause width issues
    width: '100%', // Ensure full width constraint
    position: 'relative', // Allow absolute positioning of floating buttons
  },
  cardScrollView: {
    flex: 1,
    width: '100%', // Constrain scroll view width
  },
  cardFullScreen: {
    flex: 1,
    width: '100%',
  },
  floatingButtonsContainer: {
    position: 'absolute',
    bottom: SPACING.xl, // Distance from bottom
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl, // Padding from screen edges
    pointerEvents: 'box-none', // Allow touches to pass through container to buttons
  },
  floatingActionButton: {
    width: responsiveSizes.actionButton.width,
    height: responsiveSizes.actionButton.height,
    borderRadius: responsiveSizes.actionButton.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, // Stronger shadow for floating buttons
    shadowRadius: 8,
    elevation: 8, // Higher elevation for floating effect
  },
  // Deprecated - keeping for reference
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    gap: SPACING.xl,
  },
  actionButton: {
    width: responsiveSizes.actionButton.width,
    height: responsiveSizes.actionButton.height,
    borderRadius: responsiveSizes.actionButton.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  passButton: {
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  likeButton: {
    borderWidth: 2,
    borderColor: COLORS.success,
  },
  title: {
    ...TYPOGRAPHY.scale.h2,
    color: COLORS.text.primary,
  },
});
