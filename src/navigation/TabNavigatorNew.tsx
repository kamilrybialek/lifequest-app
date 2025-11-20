import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

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
        component={DashboardScreenNew}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Tools"
        component={ToolsScreen}
        options={{ tabBarLabel: 'Tools' }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ tabBarLabel: 'Tasks' }}
      />
      <Tab.Screen
        name="Journey"
        component={JourneyScreen}
        options={{ tabBarLabel: 'Journey' }}
      />
      <Tab.Screen
        name="ProfileNew"
        component={ProfileScreenNew}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
