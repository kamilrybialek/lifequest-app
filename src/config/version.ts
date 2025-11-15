/**
 * APP VERSION CONFIGURATION
 *
 * This file exports the current app version from package.json
 * Update package.json version to automatically update version across all screens
 */

// For React Native, we need to manually sync this with package.json
// Update this value whenever you increment package.json version
export const APP_VERSION = '2.1.2';

// Version history:
// 2.1.2 - HOTFIX: Fixed infinite recursion in initializeDefaultLists
// 2.1.1 - FIXED: Tasks not persisting on web (added missing AsyncStorage functions)
// 2.1.0 - NEW DASHBOARD: Activity feed with infinite scroll, quick wins, time-based suggestions
// 2.0.3 - Added Tasks tab (5-tab navigation: Home, Tools, Tasks, Journey, Profile)
// 2.0.2 - Fixed Tools tab on web platform
// 2.0.1 - Added demo account & Tools navigation
// 2.0.0 - Enhanced tools v2.0 (Budget Manager, Debt Tracker, Workout Tracker)
