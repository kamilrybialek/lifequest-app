import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import ONLY TabNavigatorNew - this avoids importing all the problematic screens
import { TabNavigatorNew } from './TabNavigatorNew';

// Auth screens - these are simple and don't use expo-file-system
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';

// Path screens - web versions
import { FinancePathNew } from '../screens/finance/FinancePathNew';
import { MentalHealthPath } from '../screens/mental/MentalHealthPath';
import { PhysicalHealthPath } from '../screens/physical/PhysicalHealthPath';
import { NutritionPath } from '../screens/nutrition/NutritionPath';

// Lesson screens
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
import { WorkoutTrackerScreen } from '../screens/physical/tools/WorkoutTrackerScreen';
import { ExerciseLoggerScreen } from '../screens/physical/tools/ExerciseLoggerScreen';
import { SleepTrackerScreen } from '../screens/physical/tools/SleepTrackerScreen';
import { BodyMeasurementsScreen } from '../screens/physical/tools/BodyMeasurementsScreen';

// Nutrition tool screens
import { MealLoggerScreen } from '../screens/nutrition/tools/MealLoggerScreen';
import { WaterTrackerScreen } from '../screens/nutrition/tools/WaterTrackerScreen';
import { CalorieCalculatorScreen } from '../screens/nutrition/tools/CalorieCalculatorScreen';

// Finance tool screens
import { EmergencyFundScreen } from '../screens/finance/EmergencyFundScreen';
import { DebtTrackerScreen } from '../screens/finance/DebtTrackerScreen';
import { ExpenseLoggerScreen } from '../screens/finance/ExpenseLoggerScreen';
import { BudgetManagerScreen } from '../screens/finance/BudgetManagerScreen';
import { SubscriptionsScreen } from '../screens/finance/SubscriptionsScreen';
import { SavingsGoalsScreen } from '../screens/finance/SavingsGoalsScreen';

import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();

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

            {/* Path screens - accessible from Journey */}
            <Stack.Screen name="FinancePathNew" component={FinancePathNew} />
            <Stack.Screen name="MentalHealthPath" component={MentalHealthPath} />
            <Stack.Screen name="PhysicalHealthPath" component={PhysicalHealthPath} />
            <Stack.Screen name="NutritionPath" component={NutritionPath} />

            {/* Lesson screens */}
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

            {/* Physical tool screens */}
            <Stack.Screen name="WorkoutTrackerScreen" component={WorkoutTrackerScreen} />
            <Stack.Screen name="ExerciseLoggerScreen" component={ExerciseLoggerScreen} />
            <Stack.Screen name="SleepTrackerScreen" component={SleepTrackerScreen} />
            <Stack.Screen name="BodyMeasurementsScreen" component={BodyMeasurementsScreen} />

            {/* Nutrition tool screens */}
            <Stack.Screen name="MealLoggerScreen" component={MealLoggerScreen} />
            <Stack.Screen name="WaterTrackerScreen" component={WaterTrackerScreen} />
            <Stack.Screen name="CalorieCalculatorScreen" component={CalorieCalculatorScreen} />

            {/* Finance tool screens */}
            <Stack.Screen name="EmergencyFundScreen" component={EmergencyFundScreen} />
            <Stack.Screen name="DebtTrackerScreen" component={DebtTrackerScreen} />
            <Stack.Screen name="ExpenseLoggerScreen" component={ExpenseLoggerScreen} />
            <Stack.Screen name="BudgetManagerScreen" component={BudgetManagerScreen} />
            <Stack.Screen name="SubscriptionsScreen" component={SubscriptionsScreen} />
            <Stack.Screen name="SavingsGoalsScreen" component={SavingsGoalsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
