import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// New Tab Navigator
import { TabNavigatorNew } from './TabNavigatorNew';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';

// Finance Path & Integrated Tools
import { FinanceScreenPath } from '../screens/finance/FinanceScreenPath';
import { FinancePathNew } from '../screens/finance/FinancePathNew';
import { FinanceLessonContentScreen } from '../screens/finance/FinanceLessonContentScreen';
import { LessonIntroductionScreen } from '../screens/finance/LessonIntroductionScreen';
import { LessonContentScreen } from '../screens/finance/LessonContentScreen';
import { FinanceManagerScreen } from '../screens/finance/FinanceManagerScreen';
import { EmergencyFundScreen } from '../screens/finance/EmergencyFundScreen';
import { BudgetManagerScreen } from '../screens/finance/BudgetManagerScreen';
import { DebtTrackerScreen } from '../screens/finance/DebtTrackerScreen';
import { ExpenseLoggerScreen } from '../screens/finance/ExpenseLoggerScreen';
import { SubscriptionsScreen } from '../screens/finance/SubscriptionsScreen';
import { SavingsGoalsScreen } from '../screens/finance/SavingsGoalsScreen';

// Mental Health Path & Screens
import { MentalHealthPath } from '../screens/mental/MentalHealthPath';
import { MentalLessonIntro } from '../screens/mental/MentalLessonIntro';
import { MentalLessonContent } from '../screens/mental/MentalLessonContent';
import { DopamineDetox } from '../screens/mental/tools/DopamineDetoxScreen';
import { ScreenTimeTracker } from '../screens/mental/tools/ScreenTimeTracker';
import { MorningRoutine } from '../screens/mental/tools/MorningRoutineScreen';
import { MeditationTimer } from '../screens/mental/tools/MeditationTimer';

// Physical Health Path & Screens
import { PhysicalHealthPath } from '../screens/physical/PhysicalHealthPath';
import { PhysicalLessonIntro } from '../screens/physical/PhysicalLessonIntro';
import { PhysicalLessonContent } from '../screens/physical/PhysicalLessonContent';
import { PhysicalLessonDuolingo } from '../screens/physical/PhysicalLessonDuolingo';
import { WorkoutTrackerScreen } from '../screens/physical/tools/WorkoutTrackerScreen';
import { SleepTrackerScreen } from '../screens/physical/tools/SleepTrackerScreen';
import { BodyMeasurementsScreen } from '../screens/physical/tools/BodyMeasurementsScreen';
import { ExerciseLoggerScreen } from '../screens/physical/tools/ExerciseLoggerScreen';

// Nutrition Path & Screens
import { NutritionPath } from '../screens/nutrition/NutritionPath';
import { NutritionLessonIntro } from '../screens/nutrition/NutritionLessonIntro';
import { NutritionLessonContent } from '../screens/nutrition/NutritionLessonContent';
import { DietDashboardScreen } from '../screens/nutrition/tools/DietDashboardScreen';
import { MealLoggerScreen } from '../screens/nutrition/tools/MealLoggerScreen';
import { WaterTrackerScreen } from '../screens/nutrition/tools/WaterTrackerScreen';
import { CalorieCalculatorScreen } from '../screens/nutrition/tools/CalorieCalculatorScreen';

// Admin
import { AdminScreen } from '../screens/AdminScreen';

// Achievements
import { AchievementsScreen } from '../screens/AchievementsScreen';

// Streaks
import { StreaksScreen } from '../screens/StreaksScreen';

// Task screens
import { TrackExpensesScreen } from '../screens/tasks/TrackExpensesScreen';
import { MorningSunlightScreen } from '../screens/tasks/MorningSunlightScreen';

// TODO System Screens
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { CreateTaskScreen } from '../screens/tasks/CreateTaskScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { SmartListScreen } from '../screens/tasks/SmartListScreen';
import { TaskListScreen } from '../screens/tasks/TaskListScreen';
import { TaggedTasksScreen } from '../screens/tasks/TaggedTasksScreen';
import { CreateListScreen } from '../screens/tasks/CreateListScreen';
import { CreateTagScreen } from '../screens/tasks/CreateTagScreen';

// Settings screens
import { NotificationsSettingsScreen } from '../screens/Settings/NotificationsSettingsScreen';
import { AboutScreen } from '../screens/Settings/AboutScreen';

import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();

export const AppNavigator = () => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null; // Or a loading screen
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
            <Stack.Screen name="MainTabs" component={TabNavigatorNew} />

            {/* Pillar Paths - Accessible from Paths screen */}
            <Stack.Screen
              name="Finance"
              component={FinancePathNew}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Mental"
              component={MentalHealthPath}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Physical"
              component={PhysicalHealthPath}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Nutrition"
              component={NutritionPath}
              options={{ headerShown: false }}
            />

            {/* Finance Lessons & Tools */}
            <Stack.Screen
              name="LessonIntroduction"
              component={LessonIntroductionScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LessonContent"
              component={LessonContentScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FinanceLessonContent"
              component={FinanceLessonContentScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="FinanceManager"
              component={FinanceManagerScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EmergencyFund"
              component={EmergencyFundScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BudgetManager"
              component={BudgetManagerScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DebtTracker"
              component={DebtTrackerScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ExpenseLogger"
              component={ExpenseLoggerScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Subscriptions"
              component={SubscriptionsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SavingsGoals"
              component={SavingsGoalsScreen}
              options={{ headerShown: false }}
            />

            {/* Mental Health Lessons & Tools */}
            <Stack.Screen
              name="MentalLessonIntro"
              component={MentalLessonIntro}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MentalLessonContent"
              component={MentalLessonContent}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DopamineDetox"
              component={DopamineDetox}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ScreenTimeTracker"
              component={ScreenTimeTracker}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MorningRoutine"
              component={MorningRoutine}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MeditationTimer"
              component={MeditationTimer}
              options={{ headerShown: false }}
            />

            {/* Physical Health Lessons & Tools */}
            <Stack.Screen
              name="PhysicalLessonIntro"
              component={PhysicalLessonIntro}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PhysicalLessonContent"
              component={PhysicalLessonDuolingo}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WorkoutTracker"
              component={WorkoutTrackerScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SleepTracker"
              component={SleepTrackerScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BodyMeasurements"
              component={BodyMeasurementsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ExerciseLogger"
              component={ExerciseLoggerScreen}
              options={{ headerShown: false }}
            />

            {/* Nutrition Lessons & Tools */}
            <Stack.Screen
              name="NutritionLessonIntro"
              component={NutritionLessonIntro}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="NutritionLessonContent"
              component={NutritionLessonContent}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="DietDashboardScreen"
              component={DietDashboardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MealLogger"
              component={MealLoggerScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WaterTracker"
              component={WaterTrackerScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CalorieCounter"
              component={CalorieCalculatorScreen}
              options={{ headerShown: false }}
            />

            {/* Task Screens */}
            <Stack.Screen
              name="TrackExpenses"
              component={TrackExpensesScreen}
              options={{ headerShown: true, title: 'Track Expenses' }}
            />
            <Stack.Screen
              name="MorningSunlight"
              component={MorningSunlightScreen}
              options={{ headerShown: true, title: 'Morning Sunlight' }}
            />

            {/* TODO System Screens */}
            <Stack.Screen
              name="Tasks"
              component={TasksScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateTask"
              component={CreateTaskScreen}
              options={{
                headerShown: false,
                presentation: 'modal'
              }}
            />
            <Stack.Screen
              name="TaskDetail"
              component={TaskDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SmartList"
              component={SmartListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TaskList"
              component={TaskListScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TaggedTasks"
              component={TaggedTasksScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateList"
              component={CreateListScreen}
              options={{
                headerShown: false,
                presentation: 'modal'
              }}
            />
            <Stack.Screen
              name="CreateTag"
              component={CreateTagScreen}
              options={{
                headerShown: false,
                presentation: 'modal'
              }}
            />

            {/* Settings Screens */}
            <Stack.Screen
              name="NotificationsSettings"
              component={NotificationsSettingsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{ headerShown: false }}
            />

            {/* Achievements Screen */}
            <Stack.Screen
              name="Achievements"
              component={AchievementsScreen}
              options={{ headerShown: false }}
            />

            {/* Streaks Screen */}
            <Stack.Screen
              name="Streaks"
              component={StreaksScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};