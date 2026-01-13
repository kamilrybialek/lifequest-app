# Structura Complete Redesign Plan

## 🎯 Cele Redesignu

1. **Uproszczenie Nawigacji**: 8 tabs → 3 tabs
2. **Component-First Architecture**: Każdy screen max 300 linii
3. **Modern React Native Patterns**: Hooks, Contexts, Best Practices
4. **Lepszy UX**: Bottom bar zawsze widoczny, spójna nawigacja
5. **Maintainability**: Łatwe dodawanie nowych features

---

## 📱 NOWA STRUKTURA NAWIGACJI

### Bottom Tab Navigator (3 TABS)

```
┌─────────────────────────────────────┐
│                                     │
│         CONTENT AREA                │
│                                     │
│                                     │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│  🏠 Dashboard  │  🎯 Journey  │  👤 │
└─────────────────────────────────────┘
```

#### 1. **Dashboard** (🏠)
**Zastępuje:** HomeScreenFlat + TasksScreen

**Sekcje:**
- Header z User Info (Level, XP, Avatar)
- Today's Focus (1 główne zadanie)
- Pillar Progress Grid (2x2)
- Streak Cards (horizontal scroll)
- Quick Actions (2x2 grid)
- Recent Achievements

#### 2. **Journey** (🎯)
**Zastępuje:** 4 osobne tabs (Finance, Mental, Physical, Nutrition)

**Sekcje:**
- Path Selector (4 karty do wyboru)
- Selected Path Content (Duolingo-style progression)
- Path Tools (zintegrowane narzędzia)
- Progress Visualization

#### 3. **Profile** (👤)
**Zastępuje:** ProfileScreen

**Sekcje:**
- User Stats Card
- Achievements Gallery
- Settings
- About

---

## 🗂️ NOWA STRUKTURA FOLDERÓW

```
src/
├── navigation/
│   ├── AppNavigator.tsx              # Root navigator
│   ├── TabNavigator.tsx              # 3-tab bottom navigation
│   └── types.ts                      # Navigation types
│
├── screens/
│   ├── Dashboard/
│   │   ├── DashboardScreen.tsx       # Main dashboard (max 200 lines)
│   │   └── components/               # Dashboard-specific components
│   │       ├── TodaysFocus.tsx
│   │       ├── PillarProgressGrid.tsx
│   │       ├── StreakCards.tsx
│   │       └── QuickActionsGrid.tsx
│   │
│   ├── Journey/
│   │   ├── JourneyScreen.tsx         # Path selector + content
│   │   ├── PathSelector.tsx          # 4 path cards
│   │   └── components/
│   │       ├── PathCard.tsx
│   │       └── PathContent.tsx
│   │
│   ├── Profile/
│   │   ├── ProfileScreen.tsx         # Redesigned profile
│   │   └── components/
│   │       ├── UserStatsCard.tsx
│   │       ├── AchievementsGallery.tsx
│   │       └── SettingsList.tsx
│   │
│   ├── paths/                        # Refactored path screens
│   │   ├── finance/
│   │   │   ├── FinancePath.tsx
│   │   │   └── tools/
│   │   ├── mental/
│   │   │   ├── MentalPath.tsx
│   │   │   └── tools/
│   │   ├── physical/
│   │   │   ├── PhysicalPath.tsx
│   │   │   └── tools/
│   │   └── nutrition/
│   │       ├── NutritionPath.tsx
│   │       └── tools/
│   │
│   └── auth/
│       ├── LoginScreen.tsx
│       └── OnboardingScreen.tsx
│
├── components/                       # Shared reusable components
│   ├── ui/                          # Basic UI components
│   │   ├── Card.tsx
│   │   ├── Button.tsx
│   │   ├── ProgressBar.tsx
│   │   ├── Badge.tsx
│   │   └── Avatar.tsx
│   │
│   ├── pillars/                     # Pillar-related components
│   │   ├── PillarCard.tsx
│   │   ├── PillarIcon.tsx
│   │   └── PillarProgress.tsx
│   │
│   ├── tasks/                       # Task-related components
│   │   ├── TaskCard.tsx
│   │   ├── TaskList.tsx
│   │   └── DailyQuest.tsx
│   │
│   └── achievements/                # Achievement components
│       ├── AchievementCard.tsx
│       └── AchievementBadge.tsx
│
├── hooks/                           # Custom hooks
│   ├── useAppData.ts               # Load app data
│   ├── useUserProgress.ts          # User progress tracking
│   ├── usePillarData.ts            # Pillar-specific data
│   └── useStreaks.ts               # Streak management
│
├── contexts/                        # React contexts
│   ├── AppContext.tsx              # Global app state
│   └── NavigationContext.tsx       # Navigation helpers
│
├── utils/
│   ├── healthCalculations.ts       # BMI, TDEE, etc.
│   ├── dateHelpers.ts              # Date formatting
│   └── taskGenerators.ts           # Generate daily tasks
│
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── shadows.ts
│
├── types/
│   ├── index.ts                    # Global types
│   ├── navigation.ts               # Navigation types
│   ├── user.ts                     # User types
│   └── pillars.ts                  # Pillar types
│
├── database/                        # Existing (no changes)
└── store/                          # Existing (no changes)
```

---

## 🎨 DESIGN SYSTEM

### Color Palette
```typescript
const colors = {
  // Primary
  primary: '#58CC02',      // Duolingo green
  primaryDark: '#46A302',
  primaryLight: '#7EDD3D',

  // Pillars
  finance: '#FFC800',      // Gold
  mental: '#CE82FF',       // Purple
  physical: '#FF6B6B',     // Red
  nutrition: '#58CC02',    // Green

  // UI
  background: '#FFFFFF',
  backgroundGray: '#F7F7F7',
  text: '#3C3C3C',
  textSecondary: '#777777',
  textLight: '#AFAFAF',
  border: '#E5E5E5',

  // Status
  success: '#58CC02',
  error: '#FF4B4B',
  warning: '#FFC800',
  info: '#1CB0F6',
};
```

### Typography
```typescript
const typography = {
  h1: { fontSize: 32, fontWeight: '800' },
  h2: { fontSize: 24, fontWeight: '700' },
  h3: { fontSize: 20, fontWeight: '700' },
  h4: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  bodyBold: { fontSize: 16, fontWeight: '600' },
  caption: { fontSize: 14, fontWeight: '400' },
  small: { fontSize: 12, fontWeight: '400' },
};
```

### Spacing
```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

---

## 📋 IMPLEMENTATION PHASES

### Phase 1: Foundation (Day 1 Morning)
- [x] Create new folder structure
- [ ] Build reusable UI components (Card, Button, etc.)
- [ ] Setup custom hooks
- [ ] Create design system files (spacing, typography)

### Phase 2: Dashboard Screen (Day 1 Afternoon)
- [ ] Build DashboardScreen.tsx (max 200 lines)
- [ ] Create TodaysFocus component
- [ ] Create PillarProgressGrid component
- [ ] Create StreakCards component
- [ ] Create QuickActionsGrid component

### Phase 3: Journey Screen (Day 2 Morning)
- [ ] Build JourneyScreen.tsx
- [ ] Create PathSelector component
- [ ] Create PathCard component
- [ ] Integrate with existing path screens
- [ ] Bottom bar always visible

### Phase 4: Profile Screen (Day 2 Afternoon)
- [ ] Redesign ProfileScreen
- [ ] Create UserStatsCard component
- [ ] Create AchievementsGallery component
- [ ] Create SettingsList component

### Phase 5: Navigation (Day 3 Morning)
- [ ] Create new TabNavigator (3 tabs)
- [ ] Update AppNavigator
- [ ] Remove old TasksScreen
- [ ] Test navigation flows
- [ ] Ensure bottom bar always visible

### Phase 6: Path Screens Refactor (Day 3 Afternoon)
- [ ] Refactor FinancePath to work with Journey
- [ ] Refactor MentalPath to work with Journey
- [ ] Refactor PhysicalPath to work with Journey
- [ ] Refactor NutritionPath to work with Journey

### Phase 7: Testing & Polish (Day 4)
- [ ] Test all user flows
- [ ] Fix regressions
- [ ] Optimize performance
- [ ] Test on web and mobile
- [ ] Deploy to Vercel

---

## 🎯 KEY PRINCIPLES

1. **Component Size**: Max 300 lines per file
2. **Single Responsibility**: Each component does one thing
3. **Composition over Inheritance**: Build complex UIs from simple components
4. **Props over State**: Prefer controlled components
5. **Custom Hooks**: Extract logic into reusable hooks
6. **TypeScript**: Full type safety
7. **Performance**: Use React.memo, useMemo, useCallback wisely

---

## ✅ SUCCESS METRICS

- [ ] Reduced from 8 tabs to 3 tabs
- [ ] HomeScreenFlat (1478 lines) → DashboardScreen (<300 lines)
- [ ] Bottom bar always visible in main screens
- [ ] Clear, intuitive navigation
- [ ] Faster load times
- [ ] Better code organization
- [ ] Easier to add new features
- [ ] Successful Vercel deployment

---

## 🚨 MIGRATION STRATEGY

1. **Keep Old Code**: Don't delete old screens immediately
2. **Branch Strategy**: Work on `redesign` branch
3. **Incremental Testing**: Test after each phase
4. **Rollback Plan**: Can revert to old version if needed
5. **Data Migration**: No database changes needed (compatible)

---

## 📝 NOTES

- Zachowujemy całą istniejącą funkcjonalność
- Tylko zmiana UI/UX i architektury
- Istniejące database schemas bez zmian
- Istniejące stores (Zustand) bez zmian
- Focus na lepszą organizację kodu i nawigację
