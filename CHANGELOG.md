# Changelog

All notable changes to LifeQuest will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.4-alpha] - 2025-11-22

### Added
- **Complete Duolingo Bubble Design for All Journey Paths**:
  - MentalHealthPath.web.tsx: Full bubble path with LinearGradient, Animated bubbles, purple theme
  - PhysicalHealthPath.web.tsx: Complete path with red theme, 10 foundations
  - NutritionPath.web.tsx: Full nutrition path with green theme, 8 foundations
  - All paths now match the advanced Finance path design

### Changed
- Rewrote Mental, Physical, and Nutrition path screens with rich Duolingo-style bubble design
- All 4 journey paths now have consistent visual design:
  - Animated lesson bubbles with scale effects on tap
  - LinearGradient styling (purple for Mental, red for Physical, green for Nutrition)
  - Pulse rings for current lessons
  - Alternating left/right bubble layout
  - Connection lines between bubbles
  - Lesson info cards with XP and duration
  - "Next Lesson" card with gradient background
  - Foundation headers with progress bars
  - Completion badges for mastered foundations
  - Motivational cards at the bottom

### Technical Details
- Mental: 5 foundations, purple gradient (#CE82FF → #B366FF)
- Physical: 10 foundations, red gradient (#FF6B6B → #FF5252)
- Nutrition: 8 foundations, green gradient (#58CC02 → #7FD633)
- All use Animated.Value for bubble scale animations
- All use LinearGradient for rich visual effects
- Consistent BUBBLE_SIZE = 70, BUBBLE_SPACING = 40

---

## [0.2.3-alpha] - 2025-11-22

### Added
- **Duolingo Bubble Design for All Path Screens**:
  - FinancePathNew.web.tsx: Full bubble path with LinearGradient, animations, 10-step method
  - MentalHealthPath.web.tsx: Full functionality with LessonBubble, StepHeader, ContinueJourneyCard
  - PhysicalHealthPath.web.tsx: Complete path with all foundations and lessons
  - NutritionPath.web.tsx: Full nutrition path with lesson bubbles

### Changed
- Restored advanced Duolingo path versions from commit 06cf197 and 671ddc8
- All 4 journey paths now have rich content with:
  - LessonBubble components (colored states: locked, current, completed)
  - StepHeader/Foundation headers with expand/collapse
  - ContinueJourneyCard for quick access to next lesson
  - Progress tracking with Firebase/AsyncStorage
  - Animated bubble interactions
  - LinearGradient styling (works on web via CSS gradients)

### Technical Details
- Finance: Uses FinanceStep, FinanceLesson types from types/financeNew
- Mental: Uses MentalFoundation, MENTAL_FOUNDATIONS from types/mental
- Physical: Full foundation system with lesson progress
- Nutrition: Complete nutrition path structure
- Components: LessonBubble, StepHeader, ContinueJourneyCard in src/components/paths/
- Database: Supports both .web.ts (AsyncStorage) and regular (SQLite) versions

---

## [0.2.2-alpha] - 2025-11-22

### Changed
- **Journey Path Screens Synchronized** (Native = PWA):
  - Synced FinancePathNew.web.tsx → FinancePathNew.tsx
  - Synced MentalHealthPath.web.tsx → MentalHealthPath.tsx
  - Synced PhysicalHealthPath.web.tsx → PhysicalHealthPath.tsx
  - Synced NutritionPath.web.tsx → NutritionPath.tsx
  - All 4 learning path screens now have same content on web and native

### Technical Details
- Path components available: LessonBubble, StepHeader, ContinueJourneyCard (in src/components/paths/)
- Lesson screens: MentalLessonIntro/Content, PhysicalLessonIntro/Content, NutritionLessonIntro/Content
- Finance path: 10-step method (Marcin Iwuć approach)
- All paths use AsyncStorage for progress tracking

---

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
