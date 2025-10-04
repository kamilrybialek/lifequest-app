import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';

// Main screens
import { HomeScreenFlat } from '../screens/HomeScreenFlat';
import { ProfileScreen } from '../screens/ProfileScreen';

// Finance Path & Integrated Tools
import { FinanceScreenPath } from '../screens/finance/FinanceScreenPath';
import { LessonIntroductionScreen } from '../screens/finance/LessonIntroductionScreen';
import { LessonContentScreen } from '../screens/finance/LessonContentScreen';
import { EmergencyFundScreen } from '../screens/finance/EmergencyFundScreen';
import { BudgetManagerScreen } from '../screens/finance/BudgetManagerScreen';
import { DebtTrackerScreen } from '../screens/finance/DebtTrackerScreen';
import { ExpenseLoggerScreen } from '../screens/finance/ExpenseLoggerScreen';

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
import { WorkoutTrackerScreen } from '../screens/physical/tools/WorkoutTrackerScreen';

// Other Paths
import { NutritionScreen } from '../screens/nutrition/NutritionScreen';

// Admin
import { AdminScreen } from '../screens/AdminScreen';

// Achievements
import { AchievementsScreen } from '../screens/AchievementsScreen';

// Task screens
import { TrackExpensesScreen } from '../screens/tasks/TrackExpensesScreen';
import { MorningSunlightScreen } from '../screens/tasks/MorningSunlightScreen';

import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.email === 'kamil.rybialek@gmail.com';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Finance') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Mental') {
            iconName = focused ? 'happy' : 'happy-outline';
          } else if (route.name === 'Physical') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Nutrition') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Admin') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#58CC02',
        tabBarInactiveTintColor: '#AFAFAF',
        tabBarStyle: Platform.OS === 'web'
          ? {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E5E5E5',
              height: 75,
              paddingBottom: 12,
              paddingTop: 8,
            }
          : {
              backgroundColor: '#FFFFFF',
              borderTopWidth: 1,
              borderTopColor: '#E5E5E5',
            },
        tabBarLabelStyle: Platform.OS === 'web'
          ? {
              fontSize: 12,
              fontWeight: '600',
              marginTop: 4,
            }
          : {
              fontSize: 12,
            },
        tabBarIconStyle: Platform.OS === 'web'
          ? {
              marginTop: 2,
            }
          : undefined,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreenFlat} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="Finance" component={FinanceScreenPath} options={{ tabBarLabel: 'Finance' }} />
      <Tab.Screen name="Mental" component={MentalHealthPath} options={{ tabBarLabel: 'Mental' }} />
      <Tab.Screen name="Physical" component={PhysicalHealthPath} options={{ tabBarLabel: 'Physical' }} />
      <Tab.Screen name="Nutrition" component={NutritionScreen} options={{ tabBarLabel: 'Nutrition' }} />

      {/* Admin Tab - Only visible for kamil.rybialek@gmail.com */}
      {isAdmin && (
        <Tab.Screen name="Admin" component={AdminScreen} options={{ tabBarLabel: 'Admin' }} />
      )}

      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

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
            <Stack.Screen name="MainTabs" component={MainTabs} />

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
              component={PhysicalLessonContent}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WorkoutTracker"
              component={WorkoutTrackerScreen}
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

            {/* Achievements Screen */}
            <Stack.Screen
              name="Achievements"
              component={AchievementsScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};