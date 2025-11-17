import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// New screens
import { DashboardScreenNew } from '../screens/Dashboard/DashboardScreenNew';
import { ToolsScreen } from '../screens/tools/ToolsScreen';
import { TasksScreenNew } from '../screens/tasks/TasksScreenNew';
import { JourneyScreen } from '../screens/Journey/JourneyScreen';
import { ProfileScreenNew } from '../screens/Profile/ProfileScreenNew';

const Tab = createBottomTabNavigator();

export const TabNavigatorNew = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
        component={TasksScreenNew}
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
