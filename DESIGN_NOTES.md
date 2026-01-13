# TimeBloc Design System - To Apply Later

## Design Principles Saved from Current Version
This document preserves the DESIGN ONLY (not content) from DashboardScreenNew and ProfileScreenNew to be reapplied later.

### Color & Theme System
- Uses `timeblocColors`, `timeblocShadows`, `timeblocSpacing`, `timeblocBorderRadius`, `timeblocTypography`, `timeblocGradients`
- Import from: `../../theme/timeblocTheme`
- Soft, premium, minimal aesthetic

### Key Design Elements

#### Gradients
```typescript
import { LinearGradient } from 'expo-linear-gradient';
// Use timeblocGradients.finance, .mental, .physical, .nutrition
// Example: color={timeblocGradients.finance}
```

#### Cards Style
- Rounded corners: `timeblocBorderRadius.xl`
- Soft shadows: `timeblocShadows.medium`
- Padding: `timeblocSpacing.xl`
- Background: `timeblocColors.surface`

#### Typography
- Headers: `timeblocTypography.h1`, `h2`, `h3`
- Body: `timeblocTypography.body`
- Small: `timeblocTypography.caption`

#### Icons
- Use: `@expo/vector-icons` Ionicons
- No lucide-react-native

#### Layout
- `SafeAreaView` from 'react-native-safe-area-context'
- `RefreshControl` for pull-to-refresh
- `ScrollView` with `showsVerticalScrollIndicator={false}`

### Dashboard Design Pattern
1. **Header**: Greeting + user name + level badge in corner
2. **Level Card**: Purple gradient with XP progress bar
3. **Quick Actions**: 2x2 grid with gradient cards (Finance, Mental, Physical, Nutrition)
4. **Stats Grid**: 2x2 stats (Total XP, Best Streak, Achievements, Current Streak)
5. **Streak Cards**: Horizontal scrollable cards for each pillar with progress bars

### Profile Design Pattern
1. **Header**: Back button (left) + "Profile" title (center) + Logout (right)
2. **Level Card**: Soft purple gradient + XP to next level
3. **Stats Grid**: 2x2 (Total XP, Best Streak, Achievements count, Current Streak)
4. **Achievements Preview**: Horizontal scrollable (first 5 unlocked)
5. **Settings Items**: Clean list with icons and chevrons
6. **Modals**: ConfirmModal for logout/reset confirmations

### Key Patterns
- Greeting based on time: Good Morning/Afternoon/Evening
- RPG elements: Level, XP, Achievements, Streaks
- Pillar colors: Finance (orange), Mental (blue), Physical (red), Nutrition (green)
- Soft shadows and generous spacing
- Pull-to-refresh on all screens
- Loading states with ActivityIndicator

## Files with TimeBloc Design (Current)
- `src/screens/Dashboard/DashboardScreenNew.tsx`
- `src/screens/Dashboard/DashboardScreenNew.web.tsx`
- `src/screens/Profile/ProfileScreenNew.tsx`
- `src/screens/Profile/ProfileScreenNew.web.tsx`
- `src/theme/timeblocTheme.ts`
