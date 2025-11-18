/**
 * APP VERSION CONFIGURATION
 *
 * This file exports the current app version from package.json
 * Update package.json version to automatically update version across all screens
 */

// For React Native, we need to manually sync this with package.json
// Update this value whenever you increment package.json version
export const APP_VERSION = 'alpha 0.2.0';

// Version history:
// alpha 0.2.0 - Official Duolingo Design System applied across app
// alpha 0.1.9 - Design System established! Official Duolingo-style language + Login screen redesign
// alpha 0.1.8 - Duolingo-style redesign: colorful Journey selector & Finance Path with bubbles
// alpha 0.1.7 - Finance Journey integration: interactive lessons save data to Firebase
// alpha 0.1.6 - Combined old & new Dashboard: visual feed + real data integration
// alpha 0.1.5 - Fixed Dashboard stats layout to proper 2x2 grid
// alpha 0.1.4 - Dashboard now displays real user data from all pillars with insights
// alpha 0.1.3 - Added Dashboard data integration service for real-time stats
// alpha 0.1.2 - Minimized Tasks screen header to absolute minimum height
// alpha 0.1.1 - Login loading animation, optimized Tasks filter chips, unified Finance Dashboard
// 2.2.0 - NEW: Firebase Tasks integration with tags (Apple Reminders-style), Demo mode fully offline
// 2.1.2 - HOTFIX: Fixed infinite recursion in initializeDefaultLists
// 2.1.1 - FIXED: Tasks not persisting on web (added missing AsyncStorage functions)
// 2.1.0 - NEW DASHBOARD: Activity feed with infinite scroll, quick wins, time-based suggestions
// 2.0.3 - Added Tasks tab (5-tab navigation: Home, Tools, Tasks, Journey, Profile)
// 2.0.2 - Fixed Tools tab on web platform
// 2.0.1 - Added demo account & Tools navigation
// 2.0.0 - Enhanced tools v2.0 (Budget Manager, Debt Tracker, Workout Tracker)
