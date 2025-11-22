# Changelog

All notable changes to LifeQuest will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1-alpha] - 2025-11-22

### ✨ BASELINE STABLE VERSION
This is the reference version for all future development. From this point forward, version numbers will increment with each update.

### Added
- **Duolingo-style Design System** across all screens (PWA & Native)
  - Blue theme (#4A90E2) for headers
  - Stats bars with dividers overlapping headers
  - Consistent spacing and shadows

- **PWA Screens** (Full Featured):
  - Dashboard with real Firebase data
  - Apple Reminders-style Tasks screen with lists, tags, priorities
  - Journey screen with 4 learning paths (Finance, Mental, Physical, Nutrition)
  - Profile screen with stats, level card, achievements, pillar streaks
  - Tools screen with Finance Dashboard (8 tabs: Overview, Budget, Expenses, Income, Debt, Savings, Subscriptions, Net Worth)

- **Native iOS/Android Screens** (Synchronized with PWA):
  - All screens now match PWA design exactly
  - Same Duolingo aesthetic on native platforms
  - Firebase Auth with AsyncStorage persistence for native

- **Demo Login Functionality**:
  - Working demo login with Firebase
  - Proper Firestore security rules
  - Handles both old (`auth/user-not-found`) and new (`auth/invalid-credential`) Firebase error codes

### Fixed
- Fixed circular dependencies causing white screen on web
- Fixed syntax error in TabNavigatorNew for iOS compatibility
- Fixed stats bar layering (moved header inside ScrollView)
- Fixed invalid icon name "brain" → "bulb" in JourneyScreen
- Fixed Firebase Auth persistence warning on React Native
- Fixed getReactNativePersistence error on web platform
- Fixed FinanceDashboard navigation (registered in AppNavigator)

### Changed
- Platform-specific Firebase Auth initialization:
  - Web: uses `getAuth()` with localStorage
  - Native: uses `initializeAuth()` with AsyncStorage persistence
- Unified screen imports using React Native's automatic `.web.tsx` resolution
- Simplified TabNavigatorNew screenOptions (implicit return)

### Technical Details
- **Branch**: `claude/fix-demo-login-0125WrSVu7TwCJ7QdfNyPRTs`
- **Release Branch**: `release/v0.2.1-alpha`
- **Commit**: `258c7d9`
- **Firebase Auth**: Platform-specific persistence
- **Design System**: Duolingo-inspired blue theme
- **Screens**: 5 main tabs (Dashboard, Tools, Tasks, Journey, Profile)
- **Tools**: 12 total tools across 4 pillars

---

## Version History Reference

When referencing "previous version" or "last stable version", this refers to **v0.2.1-alpha**.

Future versions will be documented above this line.
