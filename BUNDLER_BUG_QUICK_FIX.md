# QUICK FIX CHECKLIST - "Object.get [as DashboardScreenNew]" Bundler Bug

## ISSUE AT A GLANCE
- Error: `Object.get [as DashboardScreenNew]` infinite loop on web
- Cause: Conditional require() in TabNavigatorNew.tsx evaluated at build time
- Result: Circular module dependency in Metro/Webpack bundler
- Current Status: Workaround in place, real fix needed

---

## FILES REQUIRING CHANGES

### 1. AppNavigator.tsx - FIX LINE 5
**Priority:** HIGH  
**File:** `/home/user/lifequest-app/src/navigation/AppNavigator.tsx`

**BEFORE (Line 5):**
```typescript
import { TabNavigatorNew } from './TabNavigatorNew';
```

**AFTER (Line 5):**
```typescript
// Option A: Direct import of web version
import { TabNavigatorNew } from './TabNavigatorNew.web';

// Option B: Platform-aware import
import { Platform } from 'react-native';
import { TabNavigatorNew as TabNavigatorNewWeb } from './TabNavigatorNew.web';
import { TabNavigatorNew as TabNavigatorNewNative } from './TabNavigatorNew';
const TabNavigatorNew = Platform.OS === 'web' ? TabNavigatorNewWeb : TabNavigatorNewNative;
```

**Status:** READY TO FIX

---

### 2. TabNavigatorNew.tsx - DELETE/REPLACE LINES 7-31
**Priority:** CRITICAL  
**File:** `/home/user/lifequest-app/src/navigation/TabNavigatorNew.tsx`

**BEFORE (Lines 7-31):**
```typescript
// TEMPORARY WORKAROUND: Use PlaceholderScreen on web to bypass "Object.get [as DashboardScreenNew]" bundler bug
// The real screens cause an infinite loop in the module loader on web
// TODO: Investigate webpack/metro bundler configuration
import { PlaceholderScreen } from '../screens/PlaceholderScreen';

// On native, use real screens (they work fine there)
const DashboardScreenNew = Platform.OS === 'web'
  ? PlaceholderScreen
  : require('../screens/Dashboard/DashboardScreenNew').DashboardScreenNew;

const ToolsScreen = Platform.OS === 'web'
  ? PlaceholderScreen
  : require('../screens/tools/ToolsScreen').ToolsScreen;

const TasksScreen = Platform.OS === 'web'
  ? PlaceholderScreen
  : require('../screens/tasks/TasksScreen').TasksScreen;

const JourneyScreen = Platform.OS === 'web'
  ? PlaceholderScreen
  : require('../screens/Journey/JourneyScreen').JourneyScreen;

const ProfileScreenNew = Platform.OS === 'web'
  ? PlaceholderScreen
  : require('../screens/Profile/ProfileScreenNew').ProfileScreenNew;
```

**AFTER (Lines 7-13):**
```typescript
import { DashboardScreenNew } from '../screens/Dashboard/DashboardScreenNew';
import { ToolsScreen } from '../screens/tools/ToolsScreen';
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { JourneyScreen } from '../screens/Journey/JourneyScreen';
import { ProfileScreenNew } from '../screens/Profile/ProfileScreenNew';

// No conditional require() - clean imports only
```

**Status:** READY TO FIX

---

### 3. appStore.ts - FIX LINES 121, 401, 435
**Priority:** MEDIUM  
**File:** `/home/user/lifequest-app/src/store/appStore.ts`

**ADD AT TOP (after line 23):**
```typescript
import { useAuthStore } from './authStore';  // ← ADD THIS IMPORT
```

**BEFORE (Lines 121, 401, 435 - EACH OCCURRENCE):**
```typescript
const { useAuthStore } = require('./authStore');
const authStore = useAuthStore.getState();
```

**AFTER:**
```typescript
const authStore = useAuthStore.getState();
```

**Locations to fix:**
- Line 121 in loadAppData() function
- Line 401 in updateStreak() function  
- Line 435 in addPoints() function

**Status:** READY TO FIX

---

### 4. metro.config.js - CREATE NEW FILE
**Priority:** LOW  
**File:** `/home/user/lifequest-app/metro.config.js` (NEW FILE)

**CREATE:**
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure .web.ts/.web.tsx files are properly resolved
config.resolver.sourceExts = ['web.ts', 'web.tsx', 'ts', 'tsx', 'js', 'jsx', 'json'];

module.exports = config;
```

**Status:** READY TO CREATE

---

## DEPENDENCY VERIFICATION

### Files that are CORRECT (no changes needed):
- [ ] DashboardScreenNew.tsx (imports are fine - it's the upstream cause that's wrong)
- [ ] DashboardScreenNew.web.tsx (correct re-export pattern)
- [ ] TabNavigatorNew.web.tsx (correct implementation)
- [ ] All service files (dashboardService, firebaseUserService, etc.)
- [ ] authStore.ts (direct imports are fine)
- [ ] App.tsx (imports are fine)

### Files that MUST BE CHANGED:
- [ ] AppNavigator.tsx (Line 5)
- [ ] TabNavigatorNew.tsx (Lines 7-31)
- [ ] appStore.ts (Lines 121, 401, 435 + new import)

---

## IMPLEMENTATION ORDER

1. **First:** appStore.ts (lowest risk, enables other fixes)
   - Add import at top
   - Remove 3x require() calls inside functions

2. **Second:** TabNavigatorNew.tsx (critical fix)
   - Delete all conditional require() statements
   - Replace with direct imports

3. **Third:** AppNavigator.tsx (enables web resolution)
   - Change import to use .web version

4. **Optional:** metro.config.js (optimization)
   - Create config file for explicit platform resolution

---

## TESTING AFTER FIX

```bash
# 1. Install dependencies (if metro.config.js added)
npm install

# 2. Build web version
npm run web

# 3. Check for error
# Should NOT see: "Object.get [as DashboardScreenNew]"

# 4. Verify functionality
# Should see: DashboardScreenNew component rendering (not PlaceholderScreen)

# 5. Test native builds (ensure no regression)
npm run android
npm run ios
```

---

## ROLLBACK PLAN (if needed)

If fixes cause issues, revert to current working state:

```bash
git checkout -- src/navigation/AppNavigator.tsx
git checkout -- src/navigation/TabNavigatorNew.tsx
git checkout -- src/store/appStore.ts
rm metro.config.js
```

The PlaceholderScreen workaround will continue working.

---

## EXPECTED OUTCOME

**After Fixes:**
- No "Object.get" bundler error on web build
- DashboardScreenNew renders actual content (not PlaceholderScreen)
- Web and native builds both work correctly
- Circular dependency resolved in module graph

**Timeline:** All changes are simple and should take < 30 minutes

---
