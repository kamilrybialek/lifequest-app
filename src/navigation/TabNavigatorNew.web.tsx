import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

// TEMPORARY WORKAROUND: Use PlaceholderScreen on web to bypass bundler infinite loop bug
// Real screens (Dashboard, Tools, Tasks, Journey, Profile) cause stack overflow on web
// TODO: Investigate and fix the webpack/metro bundler configuration issue
import { PlaceholderScreen } from '../screens/PlaceholderScreen';

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
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          minHeight: 100,
          height: 'auto',
          paddingBottom: 32,
          paddingTop: 12,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={PlaceholderScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Tools"
        component={PlaceholderScreen}
        options={{ tabBarLabel: 'Tools' }}
      />
      <Tab.Screen
        name="Tasks"
        component={PlaceholderScreen}
        options={{ tabBarLabel: 'Tasks' }}
      />
      <Tab.Screen
        name="Journey"
        component={PlaceholderScreen}
        options={{ tabBarLabel: 'Journey' }}
      />
      <Tab.Screen
        name="ProfileNew"
        component={PlaceholderScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
