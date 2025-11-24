# ⛔ DEPRECATED SCREENS - DO NOT USE

> **CRITICAL WARNING:** This file lists all deprecated, unused, and legacy screen files in this project.
>
> **🚨 DO NOT use any files listed below without explicit user permission! 🚨**
>
> These files are kept for reference only and will be deleted in the future.
> Always use the "Current/Replacement" versions listed for each deprecated file.

**Last Updated:** 2025-01-24
**Total Deprecated Files:** 47

---

## 📋 Quick Reference: Files to NEVER Use

### ❌ Old Dashboard (8 files)

| Deprecated File | Reason | Current Replacement |
|----------------|--------|---------------------|
| `src/screens/Dashboard/DashboardScreen.tsx` | Old architecture | `DashboardScreenNew.tsx` |
| `src/screens/Dashboard/DashboardScreen.web.tsx` | Old web version | `DashboardScreenNew.web.tsx` |
| `src/screens/Dashboard/components/TodaysFocus.tsx` | Only used by old Dashboard | Built into DashboardScreenNew |
| `src/screens/Dashboard/components/TasksPreview.tsx` | Only used by old Dashboard | Built into DashboardScreenNew |
| `src/screens/Dashboard/components/PillarProgressGrid.tsx` | Only used by old Dashboard | Built into DashboardScreenNew |
| `src/screens/Dashboard/components/StreakCards.tsx` | Never integrated | N/A |
| `src/screens/Dashboard/components/QuickActionsGrid.tsx` | Never integrated | N/A |
| `src/screens/Dashboard/components/AchievementsPreview.tsx` | Never integrated | N/A |
| `src/screens/Dashboard/components/ActivityFeed.tsx` | Never integrated | N/A |

### ❌ Legacy Finance Screens (7 files)

| Deprecated File | Reason | Current Replacement |
|----------------|--------|---------------------|
| `src/screens/finance/FinanceScreenPath.tsx` | Old architecture | `FinancePathNew.tsx` |
| `src/screens/finance/FinanceManagerScreen.tsx` | Old architecture | `FinanceDashboardUnified.tsx` |
| `src/screens/finance/LessonIntroductionScreen.tsx` | Old lesson system | `FinanceLessonIntro.tsx` |
| `src/screens/finance/LessonContentScreen.tsx` | Old lesson system | `FinanceLessonContentScreen.tsx` |
| `src/screens/finance/BudgetManagerScreen.tsx` | Non-enhanced version | `BudgetManagerScreenEnhanced.tsx` |
| `src/screens/finance/DebtTrackerScreen.tsx` | Non-enhanced version | `DebtTrackerScreenEnhanced.tsx` |
| `src/screens/finance/FinancialAssessmentScreen.tsx` | Never integrated | N/A |

### ❌ Task Management Screens (9 files)

**Note:** All task management is now handled within `TasksScreen.tsx`. These separate screens are not integrated.

| Deprecated File | Reason | Current Replacement |
|----------------|--------|---------------------|
| `src/screens/tasks/CreateTaskScreen.tsx` | Not integrated | Modal in `TasksScreen.tsx` |
| `src/screens/tasks/CreateListScreen.tsx` | Not integrated | Modal in `TasksScreen.tsx` |
| `src/screens/tasks/CreateTagScreen.tsx` | Not integrated | Modal in `TasksScreen.tsx` |
| `src/screens/tasks/TaskDetailScreen.tsx` | Not integrated | Modal in `TasksScreen.tsx` |
| `src/screens/tasks/TaskListScreen.tsx` | Not integrated | View in `TasksScreen.tsx` |
| `src/screens/tasks/SmartListScreen.tsx` | Not integrated | View in `TasksScreen.tsx` |
| `src/screens/tasks/TaggedTasksScreen.tsx` | Not integrated | View in `TasksScreen.tsx` |
| `src/screens/tasks/MorningSunlightScreen.tsx` | Specific task screen | N/A |
| `src/screens/tasks/TrackExpensesScreen.tsx` | Replaced by finance tools | `ExpenseLoggerScreen.tsx` |

### ❌ Old Tool Versions (3 files)

| Deprecated File | Reason | Current Replacement |
|----------------|--------|---------------------|
| `src/screens/physical/tools/WorkoutTrackerScreen.tsx` | Non-enhanced version | `WorkoutTrackerScreenEnhanced.tsx` |
| `src/screens/mental/tools/DopamineDetoxScreen.tsx` | Full implementation (577 lines) replaced by placeholder | `mental/tools/DopamineDetox.tsx` (67 lines placeholder) |
| `src/screens/mental/tools/MorningRoutineScreen.tsx` | Full implementation (440 lines) replaced by placeholder | `mental/tools/MorningRoutine.tsx` (67 lines placeholder) |

**Note on DopamineDetoxScreen & MorningRoutineScreen:** These are complete implementations that were replaced with simple "Coming Soon" placeholders. Decision needed: Delete permanently or restore full versions?

### ❌ Unused Standalone Pillar Screens (3 files)

| Deprecated File | Reason | Current Replacement |
|----------------|--------|---------------------|
| `src/screens/mental/MentalHealthScreen.tsx` | Standalone screen | Integrated into `MentalHealthPath.tsx` |
| `src/screens/nutrition/NutritionScreen.tsx` | Standalone screen | Integrated into `NutritionPath.tsx` |
| `src/screens/physical/PhysicalHealthScreen.tsx` | Standalone screen | Integrated into `PhysicalHealthPath.tsx` |

### ❌ Experimental/Unused Utility Screens (5 files)

| Deprecated File | Reason | Current Replacement |
|----------------|--------|---------------------|
| `src/screens/ProfileScreen.tsx` | Old version | `ProfileScreenNew.tsx` |
| `src/screens/HomeScreenFlat.tsx` | Experimental design | `DashboardScreenNew.tsx` |
| `src/screens/HomeScreenSimple.tsx` | Experimental design | `DashboardScreenNew.tsx` |
| `src/screens/PathsScreen.tsx` | Replaced by Journey | `JourneyScreen.tsx` |
| `src/screens/PlaceholderScreen.tsx` | Generic placeholder | N/A |

### ❌ Settings Screens (2 files - Not Integrated)

| Deprecated File | Reason | Current Replacement |
|----------------|--------|---------------------|
| `src/screens/Settings/NotificationsSettingsScreen.tsx` | Not integrated in current nav | N/A (Could be restored if needed) |
| `src/screens/Settings/AboutScreen.tsx` | Not integrated in current nav | N/A (Could be restored if needed) |

### ❌ Achievement/Streak Screens (2 files - Not Integrated)

| Deprecated File | Reason | Current Replacement |
|----------------|--------|---------------------|
| `src/screens/AchievementsScreen.tsx` | Not integrated in current nav | N/A (Could be restored if needed) |
| `src/screens/StreaksScreen.tsx` | Not integrated in current nav | N/A (Could be restored if needed) |

### ❌ Admin Screen (1 file - Not Integrated)

| Deprecated File | Reason | Current Replacement |
|----------------|--------|---------------------|
| `src/screens/AdminScreen.tsx` | Not integrated in current nav | N/A (Could be restored if needed) |

### ❌ Lesson Variants (1 file)

| Deprecated File | Reason | Current Replacement |
|----------------|--------|---------------------|
| `src/screens/physical/PhysicalLessonDuolingo.tsx` | Alternative design | `PhysicalLessonContent.tsx` |

### ❌ Unused Components (6 files)

| Deprecated File | Reason | Current Replacement |
|----------------|--------|---------------------|
| `src/screens/Journey/components/PathSelector.tsx` | Component not used | N/A |
| `src/screens/Dashboard/components/StreakCards.tsx` | Never integrated | N/A |
| `src/screens/Dashboard/components/QuickActionsGrid.tsx` | Never integrated | N/A |
| `src/screens/Dashboard/components/AchievementsPreview.tsx` | Never integrated | N/A |
| `src/screens/Dashboard/components/ActivityFeed.tsx` | Never integrated | N/A |
| `src/screens/Dashboard/components/TodaysFocus.tsx` | Old Dashboard only | Built into DashboardScreenNew |

---

## ✅ SAFE TO USE: Current Active Screens

### Main Navigation Screens (Currently Registered in AppNavigator.tsx)

#### Auth & Onboarding
- ✅ `src/screens/auth/LoginScreen.tsx`
- ✅ `src/screens/auth/OnboardingScreen.tsx`
- ✅ `src/screens/auth/OnboardingScreen.web.tsx`

#### Tab Screens (Main Navigation)
- ✅ `src/screens/Dashboard/DashboardScreenNew.tsx`
- ✅ `src/screens/Dashboard/DashboardScreenNew.web.tsx`
- ✅ `src/screens/tools/ToolsScreen.tsx`
- ✅ `src/screens/tasks/TasksScreen.tsx`
- ✅ `src/screens/tasks/TasksScreen.web.tsx`
- ✅ `src/screens/Journey/JourneyScreen.tsx`
- ✅ `src/screens/Journey/JourneyScreen.web.tsx`
- ✅ `src/screens/Profile/ProfileScreenNew.tsx`
- ✅ `src/screens/Profile/ProfileScreenNew.web.tsx`

#### Path Screens
- ✅ `src/screens/finance/FinancePathNew.tsx`
- ✅ `src/screens/finance/FinancePathNew.web.tsx`
- ✅ `src/screens/mental/MentalHealthPath.tsx`
- ✅ `src/screens/mental/MentalHealthPath.web.tsx`
- ✅ `src/screens/physical/PhysicalHealthPath.tsx`
- ✅ `src/screens/physical/PhysicalHealthPath.web.tsx`
- ✅ `src/screens/nutrition/NutritionPath.tsx`
- ✅ `src/screens/nutrition/NutritionPath.web.tsx`

#### Finance Lesson Screens
- ✅ `src/screens/finance/FinanceLessonIntro.tsx`
- ✅ `src/screens/finance/FinanceLessonIntro.web.tsx`
- ✅ `src/screens/finance/FinanceLessonIntegratedScreen.tsx`
- ✅ `src/screens/finance/FinanceLessonContentScreen.tsx`
- ✅ `src/screens/finance/FinanceLessonContentScreen.web.tsx`

#### Mental Lesson Screens
- ✅ `src/screens/mental/MentalLessonIntro.tsx`
- ✅ `src/screens/mental/MentalLessonContent.tsx`

#### Physical Lesson Screens
- ✅ `src/screens/physical/PhysicalLessonIntro.tsx`
- ✅ `src/screens/physical/PhysicalLessonContent.tsx`

#### Nutrition Lesson Screens
- ✅ `src/screens/nutrition/NutritionLessonIntro.tsx`
- ✅ `src/screens/nutrition/NutritionLessonContent.tsx`

#### Mental Tools
- ✅ `src/screens/mental/tools/DopamineDetox.tsx` (Placeholder)
- ✅ `src/screens/mental/tools/ScreenTimeTracker.tsx`
- ✅ `src/screens/mental/tools/MorningRoutine.tsx` (Placeholder)
- ✅ `src/screens/mental/tools/MeditationTimer.tsx`

#### Physical Tools
- ✅ `src/screens/physical/tools/WorkoutTrackerScreenEnhanced.tsx`
- ✅ `src/screens/physical/tools/ExerciseLoggerScreen.tsx`
- ✅ `src/screens/physical/tools/SleepTrackerScreen.tsx`
- ✅ `src/screens/physical/tools/BodyMeasurementsScreen.tsx`

#### Nutrition Tools
- ✅ `src/screens/nutrition/tools/MealLoggerScreen.tsx`
- ✅ `src/screens/nutrition/tools/WaterTrackerScreen.tsx`
- ✅ `src/screens/nutrition/tools/CalorieCalculatorScreen.tsx`

#### Finance Tools
- ✅ `src/screens/finance/FinanceDashboardUnified.tsx`
- ✅ `src/screens/finance/EmergencyFundScreen.tsx`
- ✅ `src/screens/finance/DebtTrackerScreenEnhanced.tsx`
- ✅ `src/screens/finance/ExpenseLoggerScreen.tsx`
- ✅ `src/screens/finance/BudgetManagerScreenEnhanced.tsx`
- ✅ `src/screens/finance/SubscriptionsScreen.tsx`
- ✅ `src/screens/finance/SavingsGoalsScreen.tsx`
- ✅ `src/screens/finance/NetWorthCalculatorScreen.tsx`

#### Onboarding Screens (Web-only)
- ✅ `src/screens/Onboarding/WelcomeScreen.web.tsx`
- ✅ `src/screens/Onboarding/NameScreen.web.tsx`
- ✅ `src/screens/Onboarding/AgeScreen.web.tsx`
- ✅ `src/screens/Onboarding/GenderScreen.web.tsx`
- ✅ `src/screens/Onboarding/BodyMeasurementsScreen.web.tsx`
- ✅ `src/screens/Onboarding/PhysicalHealthScreen.web.tsx`
- ✅ `src/screens/Onboarding/MentalHealthScreen.web.tsx`
- ✅ `src/screens/Onboarding/FinanceScreen.web.tsx`
- ✅ `src/screens/Onboarding/NutritionScreen.web.tsx`
- ✅ `src/screens/Onboarding/GoalsScreen.web.tsx`
- ✅ `src/screens/Onboarding/ResultsScreen.web.tsx`
- ✅ `src/screens/Onboarding/PersonalInfoScreen.web.tsx`

#### Active Components
- ✅ `src/screens/Dashboard/components/StatsCard.tsx` (Used by PhysicalHealthPath)

---

## 🔍 How to Use This File

### For Development:
1. **Before using any screen file**, check this list first
2. If the file is in the "❌ DEPRECATED" section → **DO NOT USE** without explicit permission
3. If the file is in the "✅ SAFE TO USE" section → Go ahead!
4. When in doubt, ask the user or check `src/navigation/AppNavigator.tsx`

### For Future Cleanup:
1. All files in the deprecated sections can be safely deleted
2. Before deletion, ensure backups exist (AppNavigator.full.tsx contains many of these)
3. Consider user's decision on DopamineDetoxScreen & MorningRoutineScreen (restore full versions or keep placeholders?)

---

## 📝 Notes

### Platform-Specific Files (.web.tsx)
**IMPORTANT:** Files ending in `.web.tsx` are platform-specific implementations for web. React Native automatically uses the `.web.tsx` version when running on web. **NEVER delete .web.tsx files** unless also deleting their `.tsx` counterparts!

### AppNavigator.full.tsx
This file contains the "full" navigation with all screens (active + deprecated). It serves as a backup/reference but is **not used in production**. The current production navigator is `AppNavigator.tsx`.

### Decision Needed
**DopamineDetoxScreen.tsx (577 lines) vs DopamineDetox.tsx (67 lines placeholder)**
- The full implementation exists but is not integrated
- Currently using simple "Coming Soon" placeholder
- Same situation for MorningRoutineScreen.tsx (440 lines) vs MorningRoutine.tsx (67 lines)
- **Question:** Delete full implementations or restore them?

---

## 🚨 FINAL WARNING

**DO NOT use files from the deprecated list above without explicit user permission!**

These files represent old architecture, abandoned features, or replaced implementations. Using them will cause:
- Inconsistent user experience
- Bugs from outdated patterns
- Navigation issues
- Wasted development time

Always prefer the "Current Replacement" versions listed above.

---

**End of Document**
