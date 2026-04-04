import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { lq3 } from '../theme/lifequest3';

// Import LifeQuest 3.0 screens (web)
import { HomeScreen } from '../screens/Home/HomeScreen.web';
import { JourneyScreen } from '../screens/Journey/JourneyScreen.web';
import { LeagueScreen } from '../screens/League/LeagueScreen.web';
import { ToolsScreen } from '../screens/Tools/ToolsScreen.web';
import { ProfileScreenNew } from '../screens/Profile/ProfileScreenNew.web';

const Tab = createBottomTabNavigator();

/**
 * LifeQuest 3.0 Navigation - WEB VERSION
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
          minHeight: 80,
          height: 'auto',
          paddingBottom: 24,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIconStyle: {
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
