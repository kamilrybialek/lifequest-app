/**
 * React Native Paper Theme Configuration
 * Uses unified theme from ./index.ts
 */

import { MD3LightTheme } from 'react-native-paper';
import { colors, typography, shadows } from './index';

// Re-export unified theme components for backward compatibility
export { colors, typography, shadows };
export * from './index';

// React Native Paper theme configuration
export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.primaryLight,
    background: colors.background,
    surface: colors.card,
    error: colors.error,
  },
  roundness: 16, // Duolingo-style rounded corners
};

// Default export for backward compatibility
export const theme = paperTheme;
