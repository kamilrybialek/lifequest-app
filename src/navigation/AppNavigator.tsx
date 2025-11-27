import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { TabNavigatorNew } from './TabNavigatorNew';

// Auth screens - these are simple and don't use expo-file-system
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OnboardingScreenNew } from '../screens/OnboardingScreenNew';

// Loading screen
import { LoadingScreen } from '../screens/LoadingScreen';

// Path screens - web versions
import { FinancePathNew } from '../screens/finance/FinancePathNew';
import { MentalHealthPath } from '../screens/mental/MentalHealthPath';
import { PhysicalHealthPath } from '../screens/physical/PhysicalHealthPath';
import { NutritionPath } from '../screens/nutrition/NutritionPath';

// Lesson screens
import { FinanceLessonIntro } from '../screens/finance/FinanceLessonIntro';
import { FinanceLessonIntegratedScreen } from '../screens/finance/FinanceLessonIntegratedScreen';
import { FinanceLessonContentScreen } from '../screens/finance/FinanceLessonContentScreen';
import { MentalLessonIntro } from '../screens/mental/MentalLessonIntro';
import { MentalLessonContent } from '../screens/mental/MentalLessonContent';
import { PhysicalLessonIntro } from '../screens/physical/PhysicalLessonIntro';
import { PhysicalLessonContent } from '../screens/physical/PhysicalLessonContent';
import { NutritionLessonIntro } from '../screens/nutrition/NutritionLessonIntro';
import { NutritionLessonContent } from '../screens/nutrition/NutritionLessonContent';

// Mental tool screens
import { DopamineDetox } from '../screens/mental/tools/DopamineDetox';
import { ScreenTimeTracker } from '../screens/mental/tools/ScreenTimeTracker';
import { MorningRoutine } from '../screens/mental/tools/MorningRoutine';
import { MeditationTimer } from '../screens/mental/tools/MeditationTimer';

// Physical tool screens
import { WorkoutTrackerScreenEnhanced } from '../screens/physical/tools/WorkoutTrackerScreenEnhanced';
import { ExerciseLoggerScreen } from '../screens/physical/tools/ExerciseLoggerScreen';
import { SleepTrackerScreen } from '../screens/physical/tools/SleepTrackerScreen';
import { BodyMeasurementsScreen } from '../screens/physical/tools/BodyMeasurementsScreen';

// Nutrition tool screens
import { DietDashboardScreen } from '../screens/nutrition/tools/DietDashboardScreen';
import { MealLoggerScreen } from '../screens/nutrition/tools/MealLoggerScreen';
import { WaterTrackerScreen } from '../screens/nutrition/tools/WaterTrackerScreen';
import { CalorieCalculatorScreen } from '../screens/nutrition/tools/CalorieCalculatorScreen';
import { RecipeFinder } from '../screens/nutrition/RecipeFinder';

// Finance tool screens - ENHANCED VERSIONS
import { FinanceDashboardUnified } from '../screens/finance/FinanceDashboardUnified';
import { EmergencyFundScreen } from '../screens/finance/EmergencyFundScreen';
import { DebtTrackerScreenEnhanced } from '../screens/finance/DebtTrackerScreenEnhanced';
import { ExpenseLoggerScreen } from '../screens/finance/ExpenseLoggerScreen';
import { BudgetManagerScreenEnhanced } from '../screens/finance/BudgetManagerScreenEnhanced';
import { SubscriptionsScreen } from '../screens/finance/SubscriptionsScreen';
import { SavingsGoalsScreen } from '../screens/finance/SavingsGoalsScreen';
import { NetWorthCalculatorScreen } from '../screens/finance/NetWorthCalculatorScreen';

// Admin
import { AdminGuard } from '../screens/admin/AdminGuard';

import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();

// Debug: track AppNavigator renders
let appNavigatorRenderCount = 0;
let previousValues = { isAuth: false, isLoading: true, userId: undefined as string | undefined };

export const AppNavigator = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Debug: log every render
  appNavigatorRenderCount++;
  const changed: string[] = [];
  if (previousValues.isAuth !== isAuthenticated) changed.push(`isAuth: ${previousValues.isAuth} → ${isAuthenticated}`);
  if (previousValues.isLoading !== isLoading) changed.push(`isLoading: ${previousValues.isLoading} → ${isLoading}`);
  if (previousValues.userId !== user?.id) changed.push(`userId: ${previousValues.userId} → ${user?.id}`);

  console.log(`📱 AppNavigator render #${appNavigatorRenderCount}, isAuth: ${isAuthenticated}, isLoading: ${isLoading}, user: ${user?.id}${changed.length > 0 ? ` [CHANGED: ${changed.join(', ')}]` : ' [NO CHANGE!]'}`);

  previousValues = { isAuth: isAuthenticated, isLoading: isLoading, userId: user?.id };

  if (appNavigatorRenderCount > 100) {
    console.error('🔴 INFINITE RENDER in AppNavigator!');
    throw new Error('Infinite render loop detected in AppNavigator');
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  // TEMPORARY DEBUG: Log before returning JSX
  console.log(`📱 About to return JSX, branch: ${!isAuthenticated ? 'Login' : !user?.onboarded ? 'Onboarding' : 'Main'}`);

  // Web linking configuration
  const linking = {
    prefixes: ['http://localhost:8081', 'https://lifequest-app.web.app'],
    config: {
      screens: {
        Login: 'login',
        Onboarding: 'onboarding',
        Main: '',
        Admin: 'admin',
      },
    },
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : !user?.onboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreenNew} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigatorNew} />

            {/* TEMPORARY: Comment out all other screens for debugging */}
            {/* Path screens - accessible from Journey */}
            <Stack.Screen name="FinancePathNew" component={FinancePathNew} />
            <Stack.Screen name="MentalHealthPath" component={MentalHealthPath} />
            <Stack.Screen name="PhysicalHealthPath" component={PhysicalHealthPath} />
            <Stack.Screen name="NutritionPath" component={NutritionPath} />

            {/* Lesson screens */}
            <Stack.Screen name="FinanceLessonIntro" component={FinanceLessonIntro} />
            <Stack.Screen name="FinanceLessonIntegrated" component={FinanceLessonIntegratedScreen} />
            <Stack.Screen name="FinanceLessonContent" component={FinanceLessonContentScreen} />
            <Stack.Screen name="MentalLessonIntro" component={MentalLessonIntro} />
            <Stack.Screen name="MentalLessonContent" component={MentalLessonContent} />
            <Stack.Screen name="PhysicalLessonIntro" component={PhysicalLessonIntro} />
            <Stack.Screen name="PhysicalLessonContent" component={PhysicalLessonContent} />
            <Stack.Screen name="NutritionLessonIntro" component={NutritionLessonIntro} />
            <Stack.Screen name="NutritionLessonContent" component={NutritionLessonContent} />

            {/* Mental tool screens */}
            <Stack.Screen name="DopamineDetox" component={DopamineDetox} />
            <Stack.Screen name="ScreenTimeTracker" component={ScreenTimeTracker} />
            <Stack.Screen name="MorningRoutine" component={MorningRoutine} />
            <Stack.Screen name="MeditationTimer" component={MeditationTimer} />

            {/* Physical tool screens - ENHANCED */}
            <Stack.Screen name="WorkoutTrackerScreen" component={WorkoutTrackerScreenEnhanced} />
            <Stack.Screen name="ExerciseLoggerScreen" component={ExerciseLoggerScreen} />
            <Stack.Screen name="SleepTrackerScreen" component={SleepTrackerScreen} />
            <Stack.Screen name="BodyMeasurementsScreen" component={BodyMeasurementsScreen} />

            {/* Nutrition tool screens */}
            <Stack.Screen name="DietDashboardScreen" component={DietDashboardScreen} />
            <Stack.Screen name="MealLoggerScreen" component={MealLoggerScreen} />
            <Stack.Screen name="WaterTrackerScreen" component={WaterTrackerScreen} />
            <Stack.Screen name="CalorieCalculatorScreen" component={CalorieCalculatorScreen} />
            <Stack.Screen name="RecipeFinder" component={RecipeFinder} />

            {/* Finance tool screens - ENHANCED */}
            <Stack.Screen name="FinanceDashboard" component={FinanceDashboardUnified} />
            <Stack.Screen name="EmergencyFundScreen" component={EmergencyFundScreen} />
            <Stack.Screen name="DebtTrackerScreen" component={DebtTrackerScreenEnhanced} />
            <Stack.Screen name="ExpenseLoggerScreen" component={ExpenseLoggerScreen} />
            <Stack.Screen name="BudgetManagerScreen" component={BudgetManagerScreenEnhanced} />
            <Stack.Screen name="SubscriptionsScreen" component={SubscriptionsScreen} />
            <Stack.Screen name="SavingsGoalsScreen" component={SavingsGoalsScreen} />
            <Stack.Screen name="NetWorthCalculatorScreen" component={NetWorthCalculatorScreen} />

            {/* Admin Panel */}
            <Stack.Screen name="Admin" component={AdminGuard} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
