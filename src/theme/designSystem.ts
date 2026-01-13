/**
 * LifeQuest Design System
 * Inspired by Duolingo - Fun, Colorful, Gamified
 *
 * Official design language for the entire app
 */

export const designSystem = {
  // COLORS - Vibrant gradients for each pillar
  gradients: {
    finance: ['#4A90E2', '#4A90E2'] as const,
    mental: ['#9C27B0', '#BA68C8'] as const,
    physical: ['#FF6B6B', '#FF8787'] as const,
    nutrition: ['#4CAF50', '#66BB6A'] as const,
    gold: ['#FFD700', '#FFA000'] as const,
    success: ['#4CAF50', '#66BB6A'] as const,
    warning: ['#FF9800', '#FFB74D'] as const,
    error: ['#F44336', '#E57373'] as const,
    gray: ['#999999', '#CCCCCC'] as const,
  },

  // SOLID COLORS
  colors: {
    finance: '#4A90E2',
    mental: '#9C27B0',
    physical: '#FF6B6B',
    nutrition: '#4CAF50',
    gold: '#FFD700',
    background: '#F5F8FA',
    cardBackground: '#FFFFFF',
    text: '#1A1A1A',
    textLight: '#666666',
    border: '#E0E0E0',
  },

  // SPACING
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },

  // BORDER RADIUS - Consistent roundness
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 20,
    xxlarge: 24,
    round: 999, // For circular elements
  },

  // SHADOWS - Depth and elevation
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
  },

  // TYPOGRAPHY
  typography: {
    // Headers
    h1: {
      fontSize: 28,
      fontWeight: '800' as const,
      lineHeight: 34,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      lineHeight: 30,
    },
    h3: {
      fontSize: 20,
      fontWeight: '700' as const,
      lineHeight: 26,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 24,
    },

    // Body text
    body: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 24,
    },
    bodyBold: {
      fontSize: 16,
      fontWeight: '700' as const,
      lineHeight: 24,
    },
    small: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
    },
    tiny: {
      fontSize: 12,
      fontWeight: '600' as const,
      lineHeight: 16,
    },

    // Special
    emoji: {
      fontSize: 32,
    },
    emojiLarge: {
      fontSize: 48,
    },
  },

  // CARD STYLES - Reusable card components
  card: {
    default: {
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    gradient: {
      borderRadius: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 6,
    },
  },

  // BUTTON STYLES
  button: {
    primary: {
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    small: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
  },

  // BADGE STYLES
  badge: {
    default: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    small: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
  },

  // ICON SIZES
  iconSize: {
    small: 16,
    medium: 20,
    large: 24,
    xlarge: 32,
    xxlarge: 48,
  },

  // GAMIFICATION ELEMENTS
  gamification: {
    xpBadge: {
      backgroundColor: '#FFD700',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    streakBadge: {
      backgroundColor: '#FF9800',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },
    levelBadge: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
  },
};

export type DesignSystem = typeof designSystem;
