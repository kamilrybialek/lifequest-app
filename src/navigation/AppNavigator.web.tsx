import React, { Suspense, lazy } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

// CRITICAL: Import TabNavigatorNew.web EXPLICITLY for web platform
// This ensures we get the .web version with proper .web screen imports
import { TabNavigatorNew } from './TabNavigatorNew.web';

// Auth screens - these are simple and don't use SQLite directly
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';

// CRITICAL: Use lazy loading for ALL screens that might import SQLite
// This prevents SQLite from being loaded on web until the screen is actually navigated to

// Path screens - lazy loaded
const FinancePathNew = lazy(() => import('../screens/finance/FinancePathNew').then(m => ({ default: m.FinancePathNew })));
const MentalHealthPath = lazy(() => import('../screens/mental/MentalHealthPath').then(m => ({ default: m.MentalHealthPath })));
const PhysicalHealthPath = lazy(() => import('../screens/physical/PhysicalHealthPath').then(m => ({ default: m.PhysicalHealthPath })));
const NutritionPath = lazy(() => import('../screens/nutrition/NutritionPath').then(m => ({ default: m.NutritionPath })));

// Lesson screens - lazy loaded
const MentalLessonIntro = lazy(() => import('../screens/mental/MentalLessonIntro').then(m => ({ default: m.MentalLessonIntro })));
const MentalLessonContent = lazy(() => import('../screens/mental/MentalLessonContent').then(m => ({ default: m.MentalLessonContent })));
const PhysicalLessonIntro = lazy(() => import('../screens/physical/PhysicalLessonIntro').then(m => ({ default: m.PhysicalLessonIntro })));
const PhysicalLessonContent = lazy(() => import('../screens/physical/PhysicalLessonContent').then(m => ({ default: m.PhysicalLessonContent })));
const NutritionLessonIntro = lazy(() => import('../screens/nutrition/NutritionLessonIntro').then(m => ({ default: m.NutritionLessonIntro })));
const NutritionLessonContent = lazy(() => import('../screens/nutrition/NutritionLessonContent').then(m => ({ default: m.NutritionLessonContent })));

// Mental tool screens - lazy loaded
const DopamineDetox = lazy(() => import('../screens/mental/tools/DopamineDetox').then(m => ({ default: m.DopamineDetox })));
const ScreenTimeTracker = lazy(() => import('../screens/mental/tools/ScreenTimeTracker').then(m => ({ default: m.ScreenTimeTracker })));
const MorningRoutine = lazy(() => import('../screens/mental/tools/MorningRoutine').then(m => ({ default: m.MorningRoutine })));
const MeditationTimer = lazy(() => import('../screens/mental/tools/MeditationTimer').then(m => ({ default: m.MeditationTimer })));

// Physical tool screens - lazy loaded
const WorkoutTrackerScreenEnhanced = lazy(() => import('../screens/physical/tools/WorkoutTrackerScreenEnhanced').then(m => ({ default: m.WorkoutTrackerScreenEnhanced })));
const ExerciseLoggerScreen = lazy(() => import('../screens/physical/tools/ExerciseLoggerScreen').then(m => ({ default: m.ExerciseLoggerScreen })));
const SleepTrackerScreen = lazy(() => import('../screens/physical/tools/SleepTrackerScreen').then(m => ({ default: m.SleepTrackerScreen })));
const BodyMeasurementsScreen = lazy(() => import('../screens/physical/tools/BodyMeasurementsScreen').then(m => ({ default: m.BodyMeasurementsScreen })));

// Nutrition tool screens - lazy loaded
const MealLoggerScreen = lazy(() => import('../screens/nutrition/tools/MealLoggerScreen').then(m => ({ default: m.MealLoggerScreen })));
const WaterTrackerScreen = lazy(() => import('../screens/nutrition/tools/WaterTrackerScreen').then(m => ({ default: m.WaterTrackerScreen })));
const CalorieCalculatorScreen = lazy(() => import('../screens/nutrition/tools/CalorieCalculatorScreen').then(m => ({ default: m.CalorieCalculatorScreen })));

// Finance tool screens - lazy loaded (THESE IMPORT SQLite!)
const EmergencyFundScreen = lazy(() => import('../screens/finance/EmergencyFundScreen').then(m => ({ default: m.EmergencyFundScreen })));
const DebtTrackerScreenEnhanced = lazy(() => import('../screens/finance/DebtTrackerScreenEnhanced').then(m => ({ default: m.DebtTrackerScreenEnhanced })));
const ExpenseLoggerScreen = lazy(() => import('../screens/finance/ExpenseLoggerScreen').then(m => ({ default: m.ExpenseLoggerScreen })));
const BudgetManagerScreenEnhanced = lazy(() => import('../screens/finance/BudgetManagerScreenEnhanced').then(m => ({ default: m.BudgetManagerScreenEnhanced })));
const SubscriptionsScreen = lazy(() => import('../screens/finance/SubscriptionsScreen').then(m => ({ default: m.SubscriptionsScreen })));
const SavingsGoalsScreen = lazy(() => import('../screens/finance/SavingsGoalsScreen').then(m => ({ default: m.SavingsGoalsScreen })));
const NetWorthCalculatorScreen = lazy(() => import('../screens/finance/NetWorthCalculatorScreen').then(m => ({ default: m.NetWorthCalculatorScreen })));

import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();

// Loading component for lazy-loaded screens
const ScreenLoader = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#58CC02" />
  </View>
);

// Wrapper for lazy-loaded screens to add Suspense
const LazyScreen = ({ component: Component }: any) => (
  <Suspense fallback={<ScreenLoader />}>
    <Component />
  </Suspense>
);

export const AppNavigator = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : !user?.onboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigatorNew} />

            {/* Path screens - lazy loaded to avoid SQLite imports */}
            <Stack.Screen name="FinancePathNew">{(props) => <LazyScreen component={() => <FinancePathNew {...props} />} />}</Stack.Screen>
            <Stack.Screen name="MentalHealthPath">{(props) => <LazyScreen component={() => <MentalHealthPath {...props} />} />}</Stack.Screen>
            <Stack.Screen name="PhysicalHealthPath">{(props) => <LazyScreen component={() => <PhysicalHealthPath {...props} />} />}</Stack.Screen>
            <Stack.Screen name="NutritionPath">{(props) => <LazyScreen component={() => <NutritionPath {...props} />} />}</Stack.Screen>

            {/* Lesson screens - lazy loaded */}
            <Stack.Screen name="MentalLessonIntro">{(props) => <LazyScreen component={() => <MentalLessonIntro {...props} />} />}</Stack.Screen>
            <Stack.Screen name="MentalLessonContent">{(props) => <LazyScreen component={() => <MentalLessonContent {...props} />} />}</Stack.Screen>
            <Stack.Screen name="PhysicalLessonIntro">{(props) => <LazyScreen component={() => <PhysicalLessonIntro {...props} />} />}</Stack.Screen>
            <Stack.Screen name="PhysicalLessonContent">{(props) => <LazyScreen component={() => <PhysicalLessonContent {...props} />} />}</Stack.Screen>
            <Stack.Screen name="NutritionLessonIntro">{(props) => <LazyScreen component={() => <NutritionLessonIntro {...props} />} />}</Stack.Screen>
            <Stack.Screen name="NutritionLessonContent">{(props) => <LazyScreen component={() => <NutritionLessonContent {...props} />} />}</Stack.Screen>

            {/* Mental tool screens - lazy loaded */}
            <Stack.Screen name="DopamineDetox">{(props) => <LazyScreen component={() => <DopamineDetox {...props} />} />}</Stack.Screen>
            <Stack.Screen name="ScreenTimeTracker">{(props) => <LazyScreen component={() => <ScreenTimeTracker {...props} />} />}</Stack.Screen>
            <Stack.Screen name="MorningRoutine">{(props) => <LazyScreen component={() => <MorningRoutine {...props} />} />}</Stack.Screen>
            <Stack.Screen name="MeditationTimer">{(props) => <LazyScreen component={() => <MeditationTimer {...props} />} />}</Stack.Screen>

            {/* Physical tool screens - lazy loaded */}
            <Stack.Screen name="WorkoutTrackerScreen">{(props) => <LazyScreen component={() => <WorkoutTrackerScreenEnhanced {...props} />} />}</Stack.Screen>
            <Stack.Screen name="ExerciseLoggerScreen">{(props) => <LazyScreen component={() => <ExerciseLoggerScreen {...props} />} />}</Stack.Screen>
            <Stack.Screen name="SleepTrackerScreen">{(props) => <LazyScreen component={() => <SleepTrackerScreen {...props} />} />}</Stack.Screen>
            <Stack.Screen name="BodyMeasurementsScreen">{(props) => <LazyScreen component={() => <BodyMeasurementsScreen {...props} />} />}</Stack.Screen>

            {/* Nutrition tool screens - lazy loaded */}
            <Stack.Screen name="MealLoggerScreen">{(props) => <LazyScreen component={() => <MealLoggerScreen {...props} />} />}</Stack.Screen>
            <Stack.Screen name="WaterTrackerScreen">{(props) => <LazyScreen component={() => <WaterTrackerScreen {...props} />} />}</Stack.Screen>
            <Stack.Screen name="CalorieCalculatorScreen">{(props) => <LazyScreen component={() => <CalorieCalculatorScreen {...props} />} />}</Stack.Screen>

            {/* Finance tool screens - lazy loaded (CRITICAL: these import SQLite!) */}
            <Stack.Screen name="EmergencyFundScreen">{(props) => <LazyScreen component={() => <EmergencyFundScreen {...props} />} />}</Stack.Screen>
            <Stack.Screen name="DebtTrackerScreen">{(props) => <LazyScreen component={() => <DebtTrackerScreenEnhanced {...props} />} />}</Stack.Screen>
            <Stack.Screen name="ExpenseLoggerScreen">{(props) => <LazyScreen component={() => <ExpenseLoggerScreen {...props} />} />}</Stack.Screen>
            <Stack.Screen name="BudgetManagerScreen">{(props) => <LazyScreen component={() => <BudgetManagerScreenEnhanced {...props} />} />}</Stack.Screen>
            <Stack.Screen name="SubscriptionsScreen">{(props) => <LazyScreen component={() => <SubscriptionsScreen {...props} />} />}</Stack.Screen>
            <Stack.Screen name="SavingsGoalsScreen">{(props) => <LazyScreen component={() => <SavingsGoalsScreen {...props} />} />}</Stack.Screen>
            <Stack.Screen name="NetWorthCalculatorScreen">{(props) => <LazyScreen component={() => <NetWorthCalculatorScreen {...props} />} />}</Stack.Screen>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
