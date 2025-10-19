// Responsive scaling utilities for React Native
// Based on guideline base size of iPhone SE (320x568) - smallest modern iPhone

import { Dimensions, PixelRatio } from 'react-native';

// Guideline sizes are based on iPhone SE (smallest modern iPhone)
// This ensures all devices scale UP, not down
const guidelineBaseWidth = 320;
const guidelineBaseHeight = 568;

/**
 * Get current window dimensions
 * Note: Using Dimensions.get('window') for initial setup
 * Components should use useWindowDimensions hook for reactive updates
 */
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Horizontal scale - scales based on screen width
 * Use for: widths, horizontal margins/padding, border radius
 * @param size - The size from design (based on 320px width - iPhone SE)
 * @returns Scaled size for current screen width
 */
export const scale = (size: number): number => {
  return (SCREEN_WIDTH / guidelineBaseWidth) * size;
};

/**
 * Vertical scale - scales based on screen height
 * Use for: heights, vertical margins/padding
 * @param size - The size from design (based on 568px height - iPhone SE)
 * @returns Scaled size for current screen height
 */
export const verticalScale = (size: number): number => {
  return (SCREEN_HEIGHT / guidelineBaseHeight) * size;
};

/**
 * Moderate scale - scales less aggressively than linear scale
 * Use for: font sizes, icons, elements that shouldn't scale dramatically
 * @param size - The size from design
 * @param factor - Resize factor (0 = no scaling, 1 = full scaling). Default 0.5
 * @returns Moderately scaled size
 */
export const moderateScale = (size: number, factor: number = 0.5): number => {
  return size + (scale(size) - size) * factor;
};

/**
 * Device type detection
 * @returns Object with device type flags
 */
export const getDeviceType = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;

  // Tablet detection based on pixel density and adjusted dimensions
  const isTablet =
    (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) ||
    (pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920));

  return {
    isPhone: !isTablet && SCREEN_WIDTH < 600,
    isTablet,
    isSmallPhone: SCREEN_WIDTH <= 320, // iPhone SE 1st/2nd gen
    isLargePhone: SCREEN_WIDTH > 320 && SCREEN_WIDTH < 600,
  };
};

/**
 * Breakpoint-based responsive values
 * @param phone - Value for phones
 * @param tablet - Value for tablets
 * @returns Appropriate value based on device type
 */
export const responsive = <T,>(phone: T, tablet: T): T => {
  const { isTablet } = getDeviceType();
  return isTablet ? tablet : phone;
};

/**
 * Get responsive dimensions for common UI elements
 */
export const responsiveSizes = {
  // Action buttons (Match screen)
  actionButton: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
  },

  // Profile card avatars
  avatar: {
    large: moderateScale(100), // ProfileCardHigh
    medium: moderateScale(80), // ProfileCardMid
    small: moderateScale(50), // ProfileCardLow
  },

  // Artist/Track images
  artistImage: {
    large: moderateScale(100), // ProfileCardHigh artists
    medium: moderateScale(80), // ProfileCardMid artists
    small: moderateScale(70), // ProfileCardMid tracks
    tiny: moderateScale(50), // ProfileCardHigh tracks
  },

  // Reviews and social proof
  reviewAvatar: moderateScale(36),

  // Concert images
  concertImage: moderateScale(48),

  // Vouch icons
  vouchIcon: moderateScale(60),

  // Featured song section
  featuredSongHeight: verticalScale(200),

  // Waveform
  waveformBarWidth: scale(3),
  waveformBarHeight: moderateScale(32),

  // Icon sizes
  icon: {
    small: moderateScale(16),
    medium: moderateScale(20),
    large: moderateScale(24),
    xlarge: moderateScale(32),
  },
};

/**
 * Hook for reactive responsive sizing in components
 * Import useWindowDimensions from react-native in your component
 * and recalculate these values when dimensions change
 */
export const createResponsiveSizes = (width: number, height: number) => {
  const scaleWidth = width / guidelineBaseWidth;
  const scaleHeight = height / guidelineBaseHeight;

  const calcScale = (size: number) => scaleWidth * size;
  const calcVerticalScale = (size: number) => scaleHeight * size;
  const calcModerateScale = (size: number, factor: number = 0.5) =>
    size + (calcScale(size) - size) * factor;

  return {
    // Action buttons (Match screen)
    actionButton: {
      width: calcModerateScale(64),
      height: calcModerateScale(64),
      borderRadius: calcModerateScale(32),
    },

    // Profile card avatars
    avatar: {
      large: calcModerateScale(100),
      medium: calcModerateScale(80),
      small: calcModerateScale(50),
    },

    // Artist/Track images
    artistImage: {
      large: calcModerateScale(100),
      medium: calcModerateScale(80),
      small: calcModerateScale(70),
      tiny: calcModerateScale(50),
    },

    // Reviews and social proof
    reviewAvatar: calcModerateScale(36),

    // Concert images
    concertImage: calcModerateScale(48),

    // Vouch icons
    vouchIcon: calcModerateScale(60),

    // Featured song section
    featuredSongHeight: calcVerticalScale(200),

    // Waveform
    waveformBarWidth: calcScale(3),
    waveformBarHeight: calcModerateScale(32),

    // Icon sizes
    icon: {
      small: calcModerateScale(16),
      medium: calcModerateScale(20),
      large: calcModerateScale(24),
      xlarge: calcModerateScale(32),
    },
  };
};

// Export screen dimensions for direct use if needed
export { SCREEN_WIDTH, SCREEN_HEIGHT };
