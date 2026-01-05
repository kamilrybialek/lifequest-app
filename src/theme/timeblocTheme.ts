/**
 * TimeBloc-Inspired Design System
 *
 * Soft, premium, minimal design language
 * - Pastel colors with purple accent
 * - Neumorphic soft shadows
 * - Generous spacing
 * - Rounded corners
 */

export const timeblocColors = {
  // Primary
  primary: '#7C6FE8', // Soft purple
  primaryLight: '#9F8EFF',
  primaryDark: '#6358D3',

  // Background
  background: '#F5F6FA', // Very light gray-blue
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text
  text: '#2D3142', // Dark gray-blue
  textSecondary: '#8F9BB3', // Medium gray
  textTertiary: '#C5CEE0', // Light gray

  // Borders
  border: '#E4E9F2',
  borderLight: '#F0F3F9',

  // Pillar colors (softer versions)
  finance: '#FF9F66', // Soft orange
  mental: '#6FBAFF', // Soft blue
  physical: '#FF8E9E', // Soft red/pink
  nutrition: '#A0D995', // Soft green

  // Status
  success: '#A0D995',
  warning: '#FFB976',
  error: '#FF8E9E',
  info: '#6FBAFF',

  // Special
  premium: '#7C6FE8',
  gold: '#FFD166',
};

export const timeblocShadows = {
  // Soft neumorphic shadows
  soft: {
    shadowColor: '#2D3142',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#2D3142',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  strong: {
    shadowColor: '#2D3142',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
};

export const timeblocSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const timeblocBorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const timeblocTypography = {
  // Headers
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    color: timeblocColors.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    color: timeblocColors.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
    color: timeblocColors.text,
  },

  // Body
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: timeblocColors.text,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: timeblocColors.text,
  },

  // Small
  small: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: timeblocColors.textSecondary,
  },
  smallBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: timeblocColors.text,
  },

  // Tiny
  tiny: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: timeblocColors.textSecondary,
  },

  // Labels
  label: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    color: timeblocColors.textTertiary,
  },
};

export const timeblocGradients = {
  primary: ['#7C6FE8', '#9F8EFF'],
  finance: ['#FF9F66', '#FFB88C'],
  mental: ['#6FBAFF', '#8AC9FF'],
  physical: ['#FF8E9E', '#FFA8B5'],
  nutrition: ['#A0D995', '#B8E5AD'],
};
