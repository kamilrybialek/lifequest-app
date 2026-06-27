/**
 * LifeQuest V4 - Scandinavian + Hinge Design System
 * Light, minimal, beautiful with generous white space
 */

// ============================================================================
// COLORS - Scandinavian light palette
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
  diet: '#CE82FF',

  // Backgrounds - LIGHT Scandinavian
  background: '#F8F9FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Text - DARK on light
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  textTertiary: '#BDC3C7',

  // Status
  success: '#58CC02',
  warning: '#FFC800',
  error: '#FF4B4B',
  info: '#1CB0F6',

  // UI Elements
  border: '#E8EAED',
  divider: '#F0F2F5',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

// ============================================================================
// TYPOGRAPHY - Clean SF Pro / System font
// ============================================================================

export const typography = {
  h1: { fontSize: 32, fontWeight: '800' as const, lineHeight: 40, color: '#2C3E50' },
  h2: { fontSize: 24, fontWeight: '700' as const, lineHeight: 32, color: '#2C3E50' },
  h3: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28, color: '#2C3E50' },
  h4: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24, color: '#2C3E50' },

  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, color: '#2C3E50' },
  bodySmall: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, color: '#7F8C8D' },
  caption: { fontSize: 12, fontWeight: '500' as const, lineHeight: 16, color: '#BDC3C7' },
} as const;

// ============================================================================
// SPACING - Generous Scandinavian white space
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
// RADIUS - Rounded Hinge-style corners
// ============================================================================

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 999,
} as const;

// ============================================================================
// SHADOWS - Soft, subtle Scandinavian shadows
// ============================================================================

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;

// ============================================================================
// GRADIENTS - Pillar gradient pairs for cards
// ============================================================================

export const gradients = {
  primary: ['#58CC02', '#89E219'] as const,
  finance: ['#FF9500', '#FFB347'] as const,
  mental: ['#1CB0F6', '#64CCFA'] as const,
  physical: ['#FF4B4B', '#FF7B7B'] as const,
  nutrition: ['#CE82FF', '#DDA8FF'] as const,
  greeting: ['#58CC02', '#4BA101'] as const,
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
  gradients,
} as const;

export default theme;
