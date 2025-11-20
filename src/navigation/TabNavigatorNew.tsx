import React, { Suspense, lazy } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// Use lazy loading ONLY on web to avoid circular dependency issues
const DashboardScreenNew = Platform.OS === 'web'
  ? lazy(() => import('../screens/Dashboard/DashboardScreenNew').then(m => ({ default: m.DashboardScreenNew })))
  : require('../screens/Dashboard/DashboardScreenNew').DashboardScreenNew;

const ToolsScreen = Platform.OS === 'web'
  ? lazy(() => import('../screens/tools/ToolsScreen').then(m => ({ default: m.ToolsScreen })))
  : require('../screens/tools/ToolsScreen').ToolsScreen;

const TasksScreen = Platform.OS === 'web'
  ? lazy(() => import('../screens/tasks/TasksScreen').then(m => ({ default: m.TasksScreen })))
  : require('../screens/tasks/TasksScreen').TasksScreen;

const JourneyScreen = Platform.OS === 'web'
  ? lazy(() => import('../screens/Journey/JourneyScreen').then(m => ({ default: m.JourneyScreen })))
  : require('../screens/Journey/JourneyScreen').JourneyScreen;

const ProfileScreenNew = Platform.OS === 'web'
  ? lazy(() => import('../screens/Profile/ProfileScreenNew').then(m => ({ default: m.ProfileScreenNew })))
  : require('../screens/Profile/ProfileScreenNew').ProfileScreenNew;

// Loading fallback for Suspense
const LoadingFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

// Wrapper components for Suspense (web only)
const DashboardWrapper = (props: any) => (
  Platform.OS === 'web' ? (
    <Suspense fallback={<LoadingFallback />}>
      <DashboardScreenNew {...props} />
    </Suspense>
  ) : <DashboardScreenNew {...props} />
);

const ToolsWrapper = (props: any) => (
  Platform.OS === 'web' ? (
    <Suspense fallback={<LoadingFallback />}>
      <ToolsScreen {...props} />
    </Suspense>
  ) : <ToolsScreen {...props} />
);

const TasksWrapper = (props: any) => (
  Platform.OS === 'web' ? (
    <Suspense fallback={<LoadingFallback />}>
      <TasksScreen {...props} />
    </Suspense>
  ) : <TasksScreen {...props} />
);

const JourneyWrapper = (props: any) => (
  Platform.OS === 'web' ? (
    <Suspense fallback={<LoadingFallback />}>
      <JourneyScreen {...props} />
    </Suspense>
  ) : <JourneyScreen {...props} />
);

const ProfileWrapper = (props: any) => (
  Platform.OS === 'web' ? (
    <Suspense fallback={<LoadingFallback />}>
      <ProfileScreenNew {...props} />
    </Suspense>
  ) : <ProfileScreenNew {...props} />
);

const Tab = createBottomTabNavigator();

// Debug: track TabNavigatorNew renders
let tabNavigatorRenderCount = 0;

export const TabNavigatorNew = () => {
  // Debug: log every render
  tabNavigatorRenderCount++;
  console.log(`📑 TabNavigatorNew render #${tabNavigatorRenderCount}`);

  if (tabNavigatorRenderCount > 100) {
    console.error('🔴 INFINITE RENDER in TabNavigatorNew!');
    throw new Error('Infinite render loop detected in TabNavigatorNew');
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        console.log(`🎨 TabNavigator screenOptions called for route: ${route.name}`);
        return {
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: any;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Tools') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Tasks') {
            iconName = focused ? 'checkbox' : 'checkbox-outline';
          } else if (route.name === 'Journey') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'ProfileNew') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        tabBarStyle: Platform.OS === 'web'
          ? {
              backgroundColor: colors.background,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              minHeight: 100,
              height: 'auto',
              paddingBottom: 32,
              paddingTop: 12,
            }
          : {
              backgroundColor: colors.background,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingTop: 8,
              paddingBottom: 8,
              height: 70,
            },
        tabBarLabelStyle: Platform.OS === 'web'
          ? {
              fontSize: 12,
              fontWeight: '600',
              marginTop: 4,
            }
          : {
              fontSize: 12,
              fontWeight: '600',
              marginTop: 4,
            },
        tabBarIconStyle: Platform.OS === 'web'
          ? {
              marginTop: 2,
            }
          : undefined,
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardWrapper}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Tools"
        component={ToolsWrapper}
        options={{ tabBarLabel: 'Tools' }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksWrapper}
        options={{ tabBarLabel: 'Tasks' }}
      />
      <Tab.Screen
        name="Journey"
        component={JourneyWrapper}
        options={{ tabBarLabel: 'Journey' }}
      />
      <Tab.Screen
        name="ProfileNew"
        component={ProfileWrapper}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
