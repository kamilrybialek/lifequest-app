/**
 * LifeQuest V4 - App Navigator (Scandinavian + Hinge Redesign)
 * Bottom tabs + Stack navigation
 * Light theme tab bar, clean icons
 */

import React, { createContext, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { theme } from '../theme/theme.v4';

// Tab Screens
import { HomeScreen } from '../screens/Home/HomeScreen';
import { PathsScreen } from '../screens/Paths/PathsScreen';
import { ToolsScreen } from '../screens/Tools/ToolsScreen';
import { LeagueScreen } from '../screens/League/LeagueScreen';
import { ProfileScreen } from '../screens/Profile/ProfileScreen';

// Stack Screens
import { LessonScreen } from '../screens/Paths/LessonScreen';
import { ToolDetailScreen } from '../screens/Tools/ToolDetailScreen';
import { DietPlannerScreen } from '../screens/Tools/DietPlannerScreen';
import { AdminScreen } from '../screens/Admin/AdminScreen';

// Finance Tool Screens
import { BudgetManagerScreen } from '../screens/finance/BudgetManagerScreen';
import { ExpenseLoggerScreen } from '../screens/finance/ExpenseLoggerScreen';
import { SavingsGoalsScreen } from '../screens/finance/SavingsGoalsScreen';
import { DebtTrackerScreen } from '../screens/finance/DebtTrackerScreen';
import { NetWorthCalculatorScreen } from '../screens/finance/NetWorthCalculatorScreen';
import { EmergencyFundScreen } from '../screens/finance/EmergencyFundScreen';

// Task Screens
import { TasksScreen } from '../screens/tasks/TasksScreen';
import { TaskDetailScreen } from '../screens/tasks/TaskDetailScreen';
import { CreateTaskScreen } from '../screens/tasks/CreateTaskScreen';
import { TaskListScreen } from '../screens/tasks/TaskListScreen';
import { TaskPlannerScreen } from '../screens/tasks/TaskPlannerScreen';

// Context for mode switching
export const AppModeContext = createContext<{ onSwitchMode?: () => void }>({});
export const useAppMode = () => useContext(AppModeContext);

// Types
export type RootTabParamList = {
  HomeTab: undefined;
  PathsTab: undefined;
  ToolsTab: undefined;
  LeagueTab: undefined;
  ProfileTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Lesson: {
    pillar: string;
    lessonId: string;
    lessonTitle: string;
    unitIndex: number;
    lessonIndex: number;
  };
  ToolDetail: {
    toolId: string;
    toolTitle: string;
    pillar: string;
  };
  DietPlanner: undefined;
  Admin: undefined;
  // Finance tools
  BudgetManager: undefined;
  ExpenseLogger: undefined;
  SavingsGoals: undefined;
  DebtTracker: undefined;
  NetWorthCalculator: undefined;
  EmergencyFund: undefined;
  // Tasks
  Tasks: undefined;
  TaskDetail: { taskId: string };
  CreateTask: undefined;
  TaskList: undefined;
  TaskPlanner: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Tab icon component - Scandinavian minimal
const TabIcon = ({ name, focused }: { name: string; focused: boolean }) => {
  const labels: Record<string, string> = {
    home: 'H',
    paths: 'P',
    tools: 'T',
    league: 'L',
    profile: 'U',
  };

  return (
    <View style={[iconStyles.container, focused && iconStyles.containerActive]}>
      <Text style={[
        iconStyles.icon,
        { color: focused ? theme.colors.primary : theme.colors.textTertiary },
      ]}>
        {labels[name]}
      </Text>
    </View>
  );
};

const iconStyles = StyleSheet.create({
  container: {
    width: 36,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  containerActive: {
    backgroundColor: theme.colors.primary + '12',
  },
  icon: {
    fontSize: 16,
    fontWeight: '800',
  },
});

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="PathsTab"
        component={PathsScreen}
        options={{
          tabBarLabel: 'Paths',
          tabBarIcon: ({ focused }) => <TabIcon name="paths" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ToolsTab"
        component={ToolsScreen}
        options={{
          tabBarLabel: 'Tools',
          tabBarIcon: ({ focused }) => <TabIcon name="tools" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="LeagueTab"
        component={LeagueScreen}
        options={{
          tabBarLabel: 'League',
          tabBarIcon: ({ focused }) => <TabIcon name="league" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator({ onSwitchMode }: { onSwitchMode?: () => void }) {
  return (
    <AppModeContext.Provider value={{ onSwitchMode }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen
          name="Lesson"
          component={LessonScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ToolDetail"
          component={ToolDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="DietPlanner"
          component={DietPlannerScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Admin"
          component={AdminScreen}
          options={{ animation: 'slide_from_right' }}
        />
        {/* Finance Tools */}
        <Stack.Screen
          name="BudgetManager"
          component={BudgetManagerScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ExpenseLogger"
          component={ExpenseLoggerScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="SavingsGoals"
          component={SavingsGoalsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="DebtTracker"
          component={DebtTrackerScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="NetWorthCalculator"
          component={NetWorthCalculatorScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="EmergencyFund"
          component={EmergencyFundScreen}
          options={{ animation: 'slide_from_right' }}
        />
        {/* Tasks */}
        <Stack.Screen
          name="Tasks"
          component={TasksScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="TaskDetail"
          component={TaskDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="CreateTask"
          component={CreateTaskScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="TaskList"
          component={TaskListScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="TaskPlanner"
          component={TaskPlannerScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </AppModeContext.Provider>
  );
}
