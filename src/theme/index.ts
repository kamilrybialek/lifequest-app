/**
 * Structura Unified Design System
 * Single source of truth for all design tokens
 * Inspired by Duolingo - Fun, Colorful, Gamified
 */

// ============================================================================
// COLORS - Duolingo-inspired palette
// ============================================================================

export const colors = {
  // Primary brand colors
  primary: '#58CC02', // Duolingo green
  primaryDark: '#4BA101',
  primaryLight: '#89E219',

  // Pillar colors - Solid
  finance: '#FF9500', // Orange
  mental: '#1CB0F6', // Blue
  physical: '#FF4B4B', // Red
  nutrition: '#CE82FF', // Purple

  // UI colors
  background: '#FFFFFF',
  backgroundGray: '#F7F7F7',
  card: '#FFFFFF',
  border: '#E5E5E5',

  // Text colors
  text: '#3C3C3C',
  textSecondary: '#777777',
  textLight: '#AFAFAF',

  // Status colors
  success: '#58CC02',
  successBackground: '#E8F5E0',
  warning: '#FFC800',
  warningBackground: '#FFF4E0',
  error: '#FF4B4B',
  errorBackground: '#FFE5E5',
  info: '#1CB0F6',

  // Special colors
  streak: '#FF9500',
  xpGold: '#FFC800',

  // Shadows and overlays
  shadow: 'rgba(0, 0, 0, 0.1)',
  overlay: 'rgba(0, 0, 0, 0.3)',
} as const;

// ============================================================================
// GRADIENTS
// ============================================================================

export const gradients = {
  primary: ['#58CC02', '#4BA101'] as const,
  finance: ['#FF9500', '#FF6E00'] as const,
  mental: ['#1CB0F6', '#0E8AC5'] as const,
  physical: ['#FF4B4B', '#E63946'] as const,
  nutrition: ['#CE82FF', '#A855F7'] as const,
  gold: ['#FFD700', '#FFA000'] as const,
  success: ['#58CC02', '#4BA101'] as const,
  warning: ['#FF9800', '#FFB74D'] as const,
  error: ['#F44336', '#E57373'] as const,
  gray: ['#999999', '#CCCCCC'] as const,
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const borderRadius = {
  small: 8,
  medium: 12,
  large: 16,
  xlarge: 20,
  xxlarge: 24,
  round: 999, // For circular elements
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
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
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Headers
  h1: {
    fontSize: 28,
    fontWeight: '800' as const,
    lineHeight: 34,
    color: colors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
    color: colors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 26,
    color: colors.text,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: colors.text,
  },

  // Body text
  body: {
    fontSize: 16,
    fontWeight: '500' as const,
    lineHeight: 24,
    color: colors.text,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 24,
    color: colors.text,
  },
  small: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  tiny: {
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    color: colors.textLight,
  },

  // Special
  emoji: {
    fontSize: 32,
  },
  emojiLarge: {
    fontSize: 48,
  },
} as const;

// ============================================================================
// ICON SIZES
// ============================================================================

export const iconSize = {
  tiny: 12,
  small: 16,
  medium: 20,
  large: 24,
  xlarge: 32,
  xxlarge: 48,
} as const;

// ============================================================================
// COMPONENT STYLES
// ============================================================================

export const card = {
  default: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.large,
    padding: spacing.xl,
    ...shadows.small,
  },
  gradient: {
    borderRadius: borderRadius.xlarge,
    padding: spacing.xl,
    ...shadows.medium,
  },
} as const;

export const button = {
  primary: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: borderRadius.medium,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  small: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: borderRadius.small,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
} as const;

export const badge = {
  default: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.medium,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.small,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
} as const;

// ============================================================================
// GAMIFICATION ELEMENTS
// ============================================================================

export const gamification = {
  xpBadge: {
    backgroundColor: colors.xpGold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.small,
  },
  streakBadge: {
    backgroundColor: colors.streak,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.small,
  },
  levelBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.medium,
  },
} as const;

// ============================================================================
// UNIFIED THEME EXPORT
// ============================================================================

export const theme = {
  colors,
  gradients,
  spacing,
  borderRadius,
  shadows,
  typography,
  iconSize,
  card,
  button,
  badge,
  gamification,
} as const;

// Type export for TypeScript
export type Theme = typeof theme;

// Default export
export default theme;
