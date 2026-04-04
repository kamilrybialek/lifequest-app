/**
 * LifeQuest 3.0 Design System
 *
 * Hybrid C+D+E: Streak-centric + Seasons + AI Coach
 * Dark-first, vibrant accents, Duolingo-level dopamine
 */

// === COLORS ===
export const lq3 = {
  // Core
  bg: '#0F1123',           // Deep dark blue-black
  bgCard: '#1A1D35',       // Card background
  bgCardHover: '#222645',  // Card hover/pressed
  bgElevated: '#252A4A',   // Modals, elevated surfaces
  bgInput: '#1E2140',      // Input fields

  // Accent - Electric green (Duolingo-inspired but bolder)
  accent: '#58CC02',
  accentDark: '#46A302',
  accentLight: '#7EE832',
  accentGlow: 'rgba(88, 204, 2, 0.15)',

  // Streak Fire
  streakOrange: '#FF9600',
  streakRed: '#FF4B4B',
  streakGlow: 'rgba(255, 150, 0, 0.2)',

  // Pillar Colors (vibrant on dark)
  finance: '#FFB020',      // Gold
  mental: '#5BABFF',       // Blue
  physical: '#FF6B6B',     // Red/coral
  nutrition: '#58CC02',    // Green

  // Pillar Glows
  financeGlow: 'rgba(255, 176, 32, 0.12)',
  mentalGlow: 'rgba(91, 171, 255, 0.12)',
  physicalGlow: 'rgba(255, 107, 107, 0.12)',
  nutritionGlow: 'rgba(88, 204, 2, 0.12)',

  // Text
  text: '#FFFFFF',
  textSecondary: '#8B8FA3',
  textTertiary: '#5A5E75',
  textMuted: '#404460',

  // XP / Gold
  xp: '#A78BFA',          // Purple for XP
  gold: '#FFD700',         // Gold currency

  // League tiers
  leagueBronze: '#CD7F32',
  leagueSilver: '#C0C0C0',
  leagueGold: '#FFD700',
  leagueDiamond: '#B9F2FF',

  // Status
  success: '#58CC02',
  warning: '#FFB020',
  error: '#FF4B4B',
  info: '#5BABFF',

  // Borders
  border: '#2A2E4A',
  borderLight: '#353960',

  // Special
  premium: '#A78BFA',
  chestGlow: '#FFD700',
};

// === GRADIENTS ===
export const lq3Gradients = {
  streak: ['#FF9600', '#FF4B4B'],
  streakBig: ['#FF4B4B', '#FF9600', '#FFD700'],
  accent: ['#46A302', '#58CC02'],
  xp: ['#7C3AED', '#A78BFA'],
  gold: ['#F59E0B', '#FFD700'],
  finance: ['#F59E0B', '#FFB020'],
  mental: ['#3B82F6', '#5BABFF'],
  physical: ['#EF4444', '#FF6B6B'],
  nutrition: ['#22C55E', '#58CC02'],
  card: ['#1A1D35', '#1E2240'],
  premium: ['#7C3AED', '#A78BFA', '#C4B5FD'],
  seasonPass: ['#FF9600', '#FFD700'],
  league: ['#1A1D35', '#252A4A'],
};

// === SPACING ===
export const lq3Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

// === BORDER RADIUS ===
export const lq3Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// === TYPOGRAPHY ===
export const lq3Type = {
  streakHero: {
    fontSize: 72,
    fontWeight: '800' as const,
    lineHeight: 80,
    color: lq3.text,
  },
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
    color: lq3.text,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    color: lq3.text,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: lq3.text,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: lq3.text,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: lq3.text,
  },
  small: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: lq3.textSecondary,
  },
  smallBold: {
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: lq3.text,
  },
  tiny: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    color: lq3.textSecondary,
  },
  label: {
    fontSize: 11,
    fontWeight: '700' as const,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
    color: lq3.textTertiary,
  },
  xpBadge: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: lq3.xp,
  },
};

// === SHADOWS (for web) ===
export const lq3Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
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
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  }),
};

// === PILLAR CONFIG ===
export const PILLAR_CONFIG = {
  finance: {
    label: 'Finance',
    emoji: '💰',
    color: lq3.finance,
    glow: lq3.financeGlow,
    gradient: lq3Gradients.finance,
  },
  mental: {
    label: 'Mental',
    emoji: '🧠',
    color: lq3.mental,
    glow: lq3.mentalGlow,
    gradient: lq3Gradients.mental,
  },
  physical: {
    label: 'Physical',
    emoji: '💪',
    color: lq3.physical,
    glow: lq3.physicalGlow,
    gradient: lq3Gradients.physical,
  },
  nutrition: {
    label: 'Nutrition',
    emoji: '🥗',
    color: lq3.nutrition,
    glow: lq3.nutritionGlow,
    gradient: lq3Gradients.nutrition,
  },
} as const;

// === SEASON CONFIG ===
export const SEASON_DURATION_DAYS = 90;

export const LEAGUE_TIERS = [
  { id: 'bronze', name: 'Bronze', color: lq3.leagueBronze, minXP: 0, icon: '🥉' },
  { id: 'silver', name: 'Silver', color: lq3.leagueSilver, minXP: 500, icon: '🥈' },
  { id: 'gold', name: 'Gold', color: lq3.leagueGold, minXP: 1500, icon: '🥇' },
  { id: 'diamond', name: 'Diamond', color: lq3.leagueDiamond, minXP: 5000, icon: '💎' },
] as const;

// === ACHIEVEMENT REWARDS ===
export const XP_REWARDS = {
  taskComplete: 15,
  lessonComplete: 50,
  streakDay: 5,
  streakWeek: 100,
  streakMonth: 500,
  achievementUnlock: 75,
  allDailyComplete: 50,
  seasonTierUp: 200,
  leaguePromotion: 150,
  weeklyChest: 100,
} as const;
