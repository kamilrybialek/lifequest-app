import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import TabNavigatorNew
import { TabNavigatorNew } from './TabNavigatorNew';

// Auth screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';

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
          <Stack.Screen name="Main" component={TabNavigatorNew} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
