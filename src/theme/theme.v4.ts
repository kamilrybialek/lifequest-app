/**
 * LifeQuest V4 - Clean Theme System
 * No circular dependencies, simple and maintainable
 */

// ============================================================================
// COLORS - Simple, flat structure
// ============================================================================

export const colors = {
  // Brand
  primary: '#58CC02',
  primaryDark: '#4BA101',
  primaryLight: '#89E219',

  // Pillars
  finance: '#FF9500',
  mental: '#1CB0F6',
  physical: '#FF4B4B',
  nutrition: '#CE82FF',

  // Base
  background: '#0F1123',
  surface: '#1A1D35',
  card: '#252941',

  // Text
  text: '#FFFFFF',
  textSecondary: '#A0A3BD',
  textTertiary: '#6E7191',

  // Status
  success: '#58CC02',
  warning: '#FFC800',
  error: '#FF4B4B',
  info: '#1CB0F6',

  // UI
  border: '#2E3148',
  divider: '#252941',
  overlay: 'rgba(0, 0, 0, 0.7)',
} as const;

// ============================================================================
// TYPOGRAPHY - Simple definitions with hardcoded colors
// ============================================================================

export const typography = {
  h1: { fontSize: 32, fontWeight: '800', lineHeight: 40, color: '#FFFFFF' },
  h2: { fontSize: 28, fontWeight: '700', lineHeight: 36, color: '#FFFFFF' },
  h3: { fontSize: 24, fontWeight: '700', lineHeight: 32, color: '#FFFFFF' },
  h4: { fontSize: 20, fontWeight: '600', lineHeight: 28, color: '#FFFFFF' },

  body: { fontSize: 16, fontWeight: '500', lineHeight: 24, color: '#FFFFFF' },
  bodySmall: { fontSize: 14, fontWeight: '500', lineHeight: 20, color: '#A0A3BD' },
  caption: { fontSize: 12, fontWeight: '600', lineHeight: 16, color: '#6E7191' },
} as const;

// ============================================================================
// SPACING - Simple scale
// ============================================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

// ============================================================================
// RADIUS - Consistent rounded corners
// ============================================================================

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

// ============================================================================
// SHADOWS - Subtle depth
// ============================================================================

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ============================================================================
// UNIFIED EXPORT
// ============================================================================

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
} as const;

export default theme;
