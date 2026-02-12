import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { lq3 } from '../theme/lifequest3';

// Import LifeQuest 3.0 screens (native)
import { HomeScreen } from '../screens/Home/HomeScreen';
import { JourneyScreen } from '../screens/Journey/JourneyScreen';
import { LeagueScreen } from '../screens/League/LeagueScreen';
import { ToolsScreen } from '../screens/Tools/ToolsScreen';
import { ProfileScreenNew } from '../screens/Profile/ProfileScreenNew';

const Tab = createBottomTabNavigator();

/**
 * LifeQuest 3.0 Navigation - NATIVE VERSION
 *
 * 5 Tabs (Hybrid C+D+E):
 * - Home: Streak-centric dashboard with daily quests
 * - Paths: Duolingo-style learning paths
 * - Arena: League rankings + Season Pass + Weekly Chest
 * - Tools: All life management tools
 * - Profile: Stats, achievements, settings
 */
export const TabNavigatorNew = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'Home') {
            iconName = focused ? 'flame' : 'flame-outline';
          } else if (route.name === 'Paths') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Arena') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Tools') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'ProfileNew') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: lq3.accent,
        tabBarInactiveTintColor: lq3.textTertiary,
        tabBarStyle: {
          backgroundColor: lq3.bgCard,
          borderTopWidth: 1,
          borderTopColor: lq3.border,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Paths"
        component={JourneyScreen}
        options={{ tabBarLabel: 'Paths' }}
      />
      <Tab.Screen
        name="Arena"
        component={LeagueScreen}
        options={{ tabBarLabel: 'Arena' }}
      />
      <Tab.Screen
        name="Tools"
        component={ToolsScreen}
        options={{ tabBarLabel: 'Tools' }}
      />
      <Tab.Screen
        name="ProfileNew"
        component={ProfileScreenNew}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
