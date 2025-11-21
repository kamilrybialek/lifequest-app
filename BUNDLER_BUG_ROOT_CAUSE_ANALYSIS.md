# CRITICAL BUNDLER BUG INVESTIGATION REPORT
## "Object.get [as DashboardScreenNew]" Infinite Loop on Web Platform

**Date:** 2025-11-21  
**Severity:** CRITICAL  
**Platform:** Web (Expo Web via Metro Bundler)  
**Status:** Root cause identified, workaround in place, fix needed

---

## EXECUTIVE SUMMARY

The web platform fails with a bundler module resolution infinite loop error: `"Object.get [as DashboardScreenNew]"`. This occurs during MODULE INITIALIZATION, not React rendering. The error is caused by a combination of:

1. **Conditional require() that gets evaluated at build time** instead of runtime
2. **Improper platform-specific file resolution** (AppNavigator imports native TabNavigatorNew instead of .web version)
3. **Dynamic require() in appStore** creating circular module dependencies

The root issue is that Metro/Webpack's static analysis evaluates the `require()` statement in TabNavigatorNew.tsx regardless of the Platform.OS check, forcing circular dependencies to be included in the web bundle.

---

## DETAILED FINDINGS

### CRITICAL ISSUE #1: Problematic Conditional require() in TabNavigatorNew.tsx

**Location:** `/home/user/lifequest-app/src/navigation/TabNavigatorNew.tsx` (Lines 7-31)

**Problematic Code:**
```typescript
// Line 7-10: Comments acknowledge this is a workaround
// TEMPORARY WORKAROUND: Use PlaceholderScreen on web to bypass "Object.get [as DashboardScreenNew]" bundler bug
// The real screens cause an infinite loop in the module loader on web
// TODO: Investigate webpack/metro bundler configuration

// Line 10: Imports PlaceholderScreen
import { PlaceholderScreen } from '../screens/PlaceholderScreen';

// Lines 13-15: Conditional require() - THIS IS THE CORE PROBLEM
const DashboardScreenNew = Platform.OS === 'web'
  ? PlaceholderScreen
  : require('../screens/Dashboard/DashboardScreenNew').DashboardScreenNew;  // ← BUNDLER EVALUATES THIS

// Lines 17-31: Same issue repeated for other screens
const ToolsScreen = Platform.OS === 'web'
  ? PlaceholderScreen
  : require('../screens/tools/ToolsScreen').ToolsScreen;

const TasksScreen = Platform.OS === 'web'
  ? PlaceholderScreen
  : require('../screens/tasks/TasksScreen').TasksScreen;

// ... more conditional requires
```

**Why This Breaks:**
- Metro/Webpack performs STATIC code analysis BEFORE runtime
- The `require()` statement is parsed and evaluated during bundling
- The runtime Platform.OS check is meaningless for the bundler
- Webpack creates a dynamic property accessor ("Object.get") to handle the require()
- This creates circular module references

**Bundler Analysis Flow:**
```
1. Bundler encounters: require('../screens/Dashboard/DashboardScreenNew')
2. Bundler loads DashboardScreenNew.tsx
3. DashboardScreenNew.tsx imports useAuthStore (line 29)
4. authStore.ts is loaded
5. authStore imports firebaseUserService
6. appStore.ts ALSO has require('./authStore') at lines 121, 401, 435
7. Webpack tries to resolve circular reference
8. Creates Object.get getter for dynamic require
9. Getter is called recursively → INFINITE LOOP
```

---

### CRITICAL ISSUE #2: Platform-Specific File Resolution Not Being Used

**Location:** `/home/user/lifequest-app/src/navigation/AppNavigator.tsx` (Line 5)

**Problematic Code:**
```typescript
import { TabNavigatorNew } from './TabNavigatorNew';  // ← IMPORTS NATIVE VERSION
```

**The Contradiction:**
```
AppNavigator.tsx imports: './TabNavigatorNew'
  ↓
This resolves to: TabNavigatorNew.tsx (NATIVE VERSION WITH require())
  ↓
But on web, it SHOULD resolve to: TabNavigatorNew.web.tsx (PROPER IMPORTS)
```

**What ALREADY EXISTS:**
```
✓ /home/user/lifequest-app/src/navigation/TabNavigatorNew.web.tsx (CORRECT IMPLEMENTATION)
✓ /home/user/lifequest-app/src/screens/Dashboard/DashboardScreenNew.web.tsx
✓ /home/user/lifequest-app/src/screens/tools/ToolsScreen.web.tsx (or similar)
```

**Correct TabNavigatorNew.web.tsx Pattern:**
```typescript
// Lines 1-12: Proper imports with explicit .web.tsx files
import { DashboardScreenNew } from '../screens/Dashboard/DashboardScreenNew.web';
import { ToolsScreen } from '../screens/tools/ToolsScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen.web';
import { JourneyScreen } from '../screens/Journey/JourneyScreen.web';
import { ProfileScreenNew } from '../screens/Profile/ProfileScreenNew.web';

// ✓ NO conditional require()
// ✓ Direct imports only
// ✓ Clean module graph
```

**DashboardScreenNew.web.tsx Pattern:**
```typescript
// Line 2: Correct re-export pattern
export { DashboardScreenNew } from './DashboardScreenNew';
```

---

### CRITICAL ISSUE #3: Dynamic require() in appStore Creates Circular Reference

**Location:** `/home/user/lifequest-app/src/store/appStore.ts` (Lines 121, 401, 435)

**Problematic Code:**
```typescript
// Line 121: Inside loadAppData function
const { useAuthStore } = require('./authStore');  // ← DYNAMIC REQUIRE
const authStore = useAuthStore.getState();
const userId = authStore.user?.id;

// Line 401: Inside updateStreak function
const { useAuthStore } = require('./authStore');  // ← REPEATED DYNAMIC REQUIRE
const authStore = useAuthStore.getState();

// Line 435: Inside addPoints function
const { useAuthStore } = require('./authStore');  // ← REPEATED DYNAMIC REQUIRE
const authStore = useAuthStore.getState();
```

**Why This Is Problematic:**
- Even though require() is inside functions, bundlers still analyze it
- Creates implicit dependency: appStore → authStore
- When combined with TabNavigatorNew's require() (DashboardScreenNew → useAuthStore), creates circular reference:
  ```
  DashboardScreenNew → useAuthStore ↔ authStore ← appStore
                                      ↑__________|
                            (mutual dependency)
  ```

---

### IMPORT CHAIN DIAGRAM: The Full Circular Path

```
App.tsx (index.ts)
├─ imports App from './App'
│
App.tsx
├─ Line 4: import { AppNavigator } from './src/navigation/AppNavigator'
├─ Line 5: import { useAuthStore } from './src/store/authStore' ✓ Direct
├─ Line 6: import { useAppStore } from './src/store/appStore' ✓ Direct
│
└─ AppNavigator.tsx
   └─ Line 5: import { TabNavigatorNew } from './TabNavigatorNew'
      
      TabNavigatorNew.tsx
      ├─ Line 10: import { PlaceholderScreen } from '../screens/PlaceholderScreen'
      │
      └─ Lines 13-15: const DashboardScreenNew = Platform.OS === 'web'
         ? PlaceholderScreen
         : require('../screens/Dashboard/DashboardScreenNew').DashboardScreenNew ← BUNDLER ANALYZES
         
         DashboardScreenNew.tsx (FORCED TO LOAD)
         ├─ Line 29: import { useAuthStore } from '../../store/authStore'
         │   └─ authStore.ts
         │       ├─ Lines 12-15: import { createUserProfile, getUserProfile, ... } from '../services/firebaseUserService'
         │       └─ Firebase initialization
         │
         └─ Line 30: import { getDashboardStats, getDashboardInsights, ... } from '../../services/dashboardService'
             └─ dashboardService.ts
                 ├─ import { getUserTasks } from './firebaseTaskService'
                 └─ import { getFinancialProfile, ... } from './firebaseFinanceService'

CIRCULAR REFERENCE CREATED:
appStore.ts (Lines 121, 401, 435)
├─ require('./authStore') ← BUNDLER CREATES DYNAMIC GETTER
│  └─ authStore.ts
│     └─ imports/exports used by useAuthStore (in DashboardScreenNew context)
│
└─ BUNDLER TRIES TO RESOLVE GETTER
   └─ "Object.get [as DashboardScreenNew]" ← RECURSIVE INFINITE LOOP
```

---

## FILE-BY-FILE BREAKDOWN

### File 1: TabNavigatorNew.tsx (PRIMARY ISSUE)
**Severity:** CRITICAL  
**Path:** `/home/user/lifequest-app/src/navigation/TabNavigatorNew.tsx`

| Line Range | Issue | Type |
|-----------|-------|------|
| 7-10 | Comments acknowledge bundler bug, uses PlaceholderScreen workaround | Design |
| 13-15 | Conditional require() for DashboardScreenNew | CRITICAL |
| 17-19 | Conditional require() for ToolsScreen | CRITICAL |
| 21-23 | Conditional require() for TasksScreen | CRITICAL |
| 25-27 | Conditional require() for JourneyScreen | CRITICAL |
| 29-31 | Conditional require() for ProfileScreenNew | CRITICAL |

**All require() statements are evaluated by bundler regardless of Platform.OS check**

---

### File 2: AppNavigator.tsx (SECONDARY ISSUE)
**Severity:** HIGH  
**Path:** `/home/user/lifequest-app/src/navigation/AppNavigator.tsx`

| Line | Issue | Impact |
|------|-------|--------|
| 5 | `import { TabNavigatorNew } from './TabNavigatorNew'` | Uses native version instead of .web version |

**Should be:** `import { TabNavigatorNew } from './TabNavigatorNew.web'` on web builds  
**Or:** Should use Platform.select to dynamically choose the right import

---

### File 3: appStore.ts (CONTRIBUTING ISSUE)
**Severity:** MEDIUM  
**Path:** `/home/user/lifequest-app/src/store/appStore.ts`

| Line | Code | Issue |
|------|------|-------|
| 121 | `const { useAuthStore } = require('./authStore');` | Dynamic require in function |
| 401 | `const { useAuthStore } = require('./authStore');` | Repeated dynamic require |
| 435 | `const { useAuthStore } = require('./authStore');` | Repeated dynamic require |

**All three create implicit dependency analyzed by bundler**

---

### File 4: DashboardScreenNew.tsx (IMPORTING CORRECTLY)
**Severity:** LOW (not the issue)  
**Path:** `/home/user/lifequest-app/src/screens/Dashboard/DashboardScreenNew.tsx`

| Line | Code | Status |
|------|------|--------|
| 29 | `import { useAuthStore } from '../../store/authStore'` | ✓ Correct |
| 30 | `import { getDashboardStats, ... } from '../../services/dashboardService'` | ✓ Correct |

**This file imports correctly. The problem is UPSTREAM (TabNavigatorNew forcing its inclusion)**

---

### File 5: DashboardScreenNew.web.tsx (GOOD PATTERN)
**Severity:** N/A  
**Path:** `/home/user/lifequest-app/src/screens/Dashboard/DashboardScreenNew.web.tsx`

```typescript
// Correct pattern - simple re-export
export { DashboardScreenNew } from './DashboardScreenNew';
```

**This is the correct approach for .web.tsx files**

---

### File 6: TabNavigatorNew.web.tsx (GOOD PATTERN)
**Severity:** N/A  
**Path:** `/home/user/lifequest-app/src/navigation/TabNavigatorNew.web.tsx`

```typescript
// Lines 7-8: Correct - explicit imports without require()
import { DashboardScreenNew } from '../screens/Dashboard/DashboardScreenNew.web';

// Lines 16-86: Proper component implementation
export const TabNavigatorNew = () => {
  // No require() calls, clean module graph
```

**This file demonstrates the CORRECT implementation**

---

## ROOT CAUSE SUMMARY

| # | Root Cause | Location | Severity | Type |
|---|-----------|----------|----------|------|
| 1 | Conditional require() evaluated at build time | TabNavigatorNew.tsx: 13-31 | CRITICAL | Bundler Issue |
| 2 | Platform-specific file resolution not used | AppNavigator.tsx: 5 | HIGH | Config Issue |
| 3 | Dynamic require() in store | appStore.ts: 121, 401, 435 | MEDIUM | Pattern Issue |
| 4 | Circular dependency created | Bundle analysis | CRITICAL | Module Graph |

---

## RECOMMENDED FIX (PRIMARY SOLUTION)

### Step 1: Replace AppNavigator Import
**File:** `/home/user/lifequest-app/src/navigation/AppNavigator.tsx`

```typescript
// Current (WRONG):
import { TabNavigatorNew } from './TabNavigatorNew';

// Change to (CORRECT):
import { TabNavigatorNew } from './TabNavigatorNew.web';
// OR
import { Platform } from 'react-native';
import { TabNavigatorNew as TabNavigatorNewWeb } from './TabNavigatorNew.web';
import { TabNavigatorNew as TabNavigatorNewNative } from './TabNavigatorNew';
const TabNavigatorNew = Platform.OS === 'web' ? TabNavigatorNewWeb : TabNavigatorNewNative;
```

### Step 2: Remove Conditional require() from TabNavigatorNew.tsx
**File:** `/home/user/lifequest-app/src/navigation/TabNavigatorNew.tsx`

```typescript
// DELETE ALL conditional require() statements (lines 7-31)
// REMOVE:
// - const DashboardScreenNew = Platform.OS === 'web' ? ... : require(...
// - const ToolsScreen = Platform.OS === 'web' ? ... : require(...
// - etc.

// REPLACE WITH PROPER IMPORTS:
import { DashboardScreenNew } from '../screens/Dashboard/DashboardScreenNew';
import { ToolsScreen } from '../screens/tools/ToolsScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { JourneyScreen } from '../screens/Journey/JourneyScreen';
import { ProfileScreenNew } from '../screens/Profile/ProfileScreenNew';
```

### Step 3: Fix appStore.ts Dynamic Require Pattern
**File:** `/home/user/lifequest-app/src/store/appStore.ts`

```typescript
// Add import at top (line 1-24):
import { useAuthStore } from './authStore';  // ← ADD THIS

// Replace all three require() calls:
// OLD (Lines 121, 401, 435):
// const { useAuthStore } = require('./authStore');
// const authStore = useAuthStore.getState();

// NEW:
const authStore = useAuthStore.getState();
```

### Step 4: Create metro.config.js
**Create:** `/home/user/lifequest-app/metro.config.js`

```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure .web.ts/.web.tsx files are properly resolved
config.resolver.sourceExts = ['web.ts', 'web.tsx', 'ts', 'tsx', 'js', 'jsx', 'json'];

module.exports = config;
```

---

## ALTERNATIVE FIX (IF PRIMARY FIX NOT POSSIBLE)

If you cannot modify TabNavigatorNew.tsx, use dynamic import() instead:

```typescript
// Instead of require():
const DashboardScreenNew = Platform.OS === 'web'
  ? PlaceholderScreen
  : React.lazy(() => import('../screens/Dashboard/DashboardScreenNew').then(m => ({ default: m.DashboardScreenNew })));
```

But this still has issues - PRIMARY FIX is recommended.

---

## CURRENT WORKAROUND ANALYSIS

**Current Status:** PlaceholderScreen workaround in TabNavigatorNew.web.tsx

**How It Works:**
- TabNavigatorNew.web.tsx imports DashboardScreenNew.web (simple re-export)
- DashboardScreenNew.web exports a re-export from DashboardScreenNew (would normally cause issue)
- BUT TabNavigatorNew.web is only used on web, so native version's require() is never executed on web
- This AVOIDS the circular dependency by breaking the import chain

**Why This Is Not A Real Fix:**
- Users see PlaceholderScreen instead of real content on web
- The circular dependency STILL EXISTS in TabNavigatorNew.tsx
- TabNavigatorNew.tsx is still evaluated by bundler (even though TabNavigatorNew.web is used)
- Future changes to TabNavigatorNew.tsx could re-trigger the issue
- Webpack/Metro bundler is still trying to resolve the circular getter

---

## VERIFICATION

To verify the fix works:

1. **Build for web:** `npm run web`
2. **Check browser console:** Should NOT see "Object.get [as DashboardScreenNew]" error
3. **Check bundle analysis:** Circular dependency should be resolved
4. **Check functionality:** DashboardScreenNew should render correctly on web

---

## RELATED FILES (NO CHANGES NEEDED)

These files are imports CORRECTLY and don't contribute to the issue:

- `/home/user/lifequest-app/src/services/dashboardService.ts` ✓
- `/home/user/lifequest-app/src/services/firebaseUserService.ts` ✓
- `/home/user/lifequest-app/src/services/firebaseTaskService.ts` ✓
- `/home/user/lifequest-app/src/services/firebaseFinanceService.ts` ✓
- `/home/user/lifequest-app/src/screens/Dashboard/DashboardScreenNew.tsx` ✓
- `/home/user/lifequest-app/App.tsx` ✓

---

## CONCLUSION

The critical bundler bug is caused by:
1. **Primary cause:** Metro/Webpack static analysis evaluates conditional require() at build time
2. **Secondary cause:** Platform-specific file resolution not being used properly
3. **Contributing cause:** Dynamic require() in store creating circular references

The fix is straightforward: use proper platform-specific file resolution and remove conditional require() statements. The .web.tsx files already exist with the correct pattern - just need to ensure they're being used.

---
