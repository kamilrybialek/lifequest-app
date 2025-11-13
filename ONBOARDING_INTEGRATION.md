# Onboarding Integration Guide

This document explains how to integrate the onboarding flow into your React Native Web navigation.

## Overview

The onboarding system consists of 8 screens that collect user data, perform assessment, and provide personalized recommendations.

## Files Created

### Screens (src/screens/Onboarding/)
- `WelcomeScreen.web.tsx` - Introduction and onboarding purpose
- `PersonalInfoScreen.web.tsx` - Name, age, gender, height, weight
- `PhysicalHealthScreen.web.tsx` - Exercise, fitness, sleep, health issues
- `MentalHealthScreen.web.tsx` - Stress, overwhelm, meditation, life quality
- `FinanceScreen.web.tsx` - Income, debt, savings, budgeting
- `NutritionScreen.web.tsx` - Meals, fast food, water, diet quality
- `GoalsScreen.web.tsx` - Select 3 goals from 20 options
- `ResultsScreen.web.tsx` - Display assessment results and recommendations

### Supporting Files
- `src/types/onboarding.ts` - TypeScript types
- `src/utils/onboardingAssessment.ts` - Scoring algorithms
- `src/store/onboardingStore.ts` - Zustand state management

## Navigation Setup

### 1. Add Onboarding Stack to Navigator

```typescript
// In your navigation configuration (e.g., src/navigation/AppNavigator.tsx)
import { createStackNavigator } from '@react-navigation/stack';
import {
  WelcomeScreen,
  PersonalInfoScreen,
  PhysicalHealthScreen,
  MentalHealthScreen,
  FinanceScreen,
  NutritionScreen,
  GoalsScreen,
  ResultsScreen,
} from '../screens/Onboarding';

const OnboardingStack = createStackNavigator();

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false, // Screens have their own headers with progress bars
      }}
    >
      <OnboardingStack.Screen name="OnboardingWelcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="OnboardingPersonal" component={PersonalInfoScreen} />
      <OnboardingStack.Screen name="OnboardingPhysical" component={PhysicalHealthScreen} />
      <OnboardingStack.Screen name="OnboardingMental" component={MentalHealthScreen} />
      <OnboardingStack.Screen name="OnboardingFinance" component={FinanceScreen} />
      <OnboardingStack.Screen name="OnboardingNutrition" component={NutritionScreen} />
      <OnboardingStack.Screen name="OnboardingGoals" component={GoalsScreen} />
      <OnboardingStack.Screen name="OnboardingResults" component={ResultsScreen} />
    </OnboardingStack.Navigator>
  );
}
```

### 2. Check Onboarding Status in App.tsx

```typescript
// In App.tsx or your root component
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from './store/authStore';
import { useState, useEffect } from 'react';

function App() {
  const { user, isAuthenticated, loadUser } = useAuthStore();
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      await loadUser();
      const completed = await AsyncStorage.getItem('onboarding_completed');
      setOnboardingCompleted(completed === 'true');
    };
    checkOnboarding();
  }, []);

  // Show loading while checking
  if (onboardingCompleted === null) {
    return <LoadingScreen />;
  }

  // Show appropriate navigator based on auth and onboarding status
  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : !onboardingCompleted ? (
        <OnboardingNavigator />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
}
```

### 3. After Registration Flow

```typescript
// After user registers, redirect to onboarding
const handleRegister = async (email: string, password: string) => {
  await register(email, password);
  // Navigation will automatically show onboarding since onboarding_completed is not set
};
```

## Data Flow

### 1. User Input Collection
Each screen collects specific data and stores it in `onboardingStore`:

```typescript
const { data, updateData, setCurrentStep } = useOnboardingStore();

// Update data
updateData({
  firstName: 'John',
  age: 25,
  // ... other fields
});

// Move to next step
setCurrentStep('physical');
navigation.navigate('OnboardingPhysical');
```

### 2. Assessment Calculation
On the Results screen, assessment is automatically calculated:

```typescript
const { calculateAssessment, assessmentResult } = useOnboardingStore();

useEffect(() => {
  calculateAssessment(); // Runs all scoring algorithms
}, []);
```

### 3. Completion and Storage
When user clicks "Start Your Journey":

```typescript
const { completeOnboarding } = useOnboardingStore();

await completeOnboarding(); // Saves to AsyncStorage
// Sets onboarding_completed = 'true'
// Navigation will redirect to MainNavigator
```

## Scoring System

### Physical Health (0-100)
- Exercise frequency: 25%
- Fitness level: 25%
- Sleep quality: 25%
- Health issues: 25%

### Mental Health (0-100)
- Stress level (inverted): 30%
- Overwhelmed frequency (inverted): 30%
- Meditation practice: 20%
- Life quality: 20%

### Finance (0-100)
- Income level: 25%
- Debt level (inverted): 25%
- Savings level: 25%
- Budgeting practice: 25%

### Nutrition (0-100)
- Meals per day: 20%
- Fast food frequency (inverted): 30%
- Water intake: 20%
- Diet quality: 30%

### Overall Score
Average of all 4 pillar scores

## Path Placement Logic

Based on pillar score:
- **0-40**: Foundation 1, Lesson 1 (Beginner)
- **41-55**: Foundation 2, Lesson 11 (Early Intermediate)
- **56-70**: Foundation 3, Lesson 21 (Intermediate)
- **71-85**: Foundation 4, Lesson 31 (Advanced)
- **86-100**: Foundation 5, Lesson 41 (Expert)

## Immediate Actions Algorithm

The system selects top 3 priority actions based on:
1. Lowest component scores in each pillar
2. Most critical issues identified
3. Quick wins that provide immediate value

Example priorities:
- Physical: Low exercise → "Start Moving: 10-minute daily walks"
- Mental: High stress → "Reduce Stress: 5-minute breathing exercise"
- Finance: High debt → "Tackle Debt: Snowball method"
- Nutrition: Low water → "Hydrate More: 1 glass before each meal"

## Developer Tools

### Reset Database
Added to Profile screen → Settings → "Reset Database (Dev)"

Clears ALL data including:
- User authentication
- Onboarding data
- Progress and achievements
- Tasks and streaks

Use this for testing the onboarding flow multiple times.

### Logout
Profile screen → Header → Logout button

Properly clears user session and returns to login screen.

## Testing Checklist

- [ ] New user registration redirects to onboarding
- [ ] All 7 screens flow correctly with back buttons
- [ ] Form validation works (required fields)
- [ ] Sliders and radio buttons update correctly
- [ ] Goals selection limits to 3
- [ ] Assessment calculates correctly
- [ ] Results screen shows all data
- [ ] "Start Your Journey" navigates to main app
- [ ] Onboarding doesn't show again after completion
- [ ] Reset Database clears everything
- [ ] Logout works correctly

## Future Enhancements

1. **Database Integration**
   - Save onboarding_data to SQLite
   - Store assessment results
   - Link to user profile

2. **Path Placement**
   - Actually set starting foundation/lesson in database
   - Update progress tables with placement

3. **Re-assessment**
   - Allow periodic re-assessment (e.g., every 30 days)
   - Show progress over time
   - Adjust path placement based on improvement

4. **Export Results**
   - Generate PDF report
   - Share results with friends
   - Email assessment to user

## Troubleshooting

### Onboarding shows again after completion
Check if `onboarding_completed` is properly set in AsyncStorage:
```typescript
const completed = await AsyncStorage.getItem('onboarding_completed');
console.log('Onboarding completed:', completed); // Should be 'true'
```

### Assessment not calculating
Ensure all required fields are filled:
- firstName, age, heightCm, weightKg
- exerciseFrequency (0-3)
- All other numeric fields have valid values

### Navigation not working
Verify navigation prop is passed correctly:
```typescript
export const WelcomeScreen = ({ navigation }: any) => {
  // navigation should be available
  navigation.navigate('OnboardingPersonal');
};
```

## Support

For questions or issues, refer to:
- `ONBOARDING_DESIGN.md` - Complete specification
- `src/utils/onboardingAssessment.ts` - Scoring algorithms
- `src/store/onboardingStore.ts` - State management logic
