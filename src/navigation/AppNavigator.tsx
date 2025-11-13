import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import ONLY TabNavigatorNew - this avoids importing all the problematic screens
import { TabNavigatorNew } from './TabNavigatorNew';

// Auth screens - these are simple and don't use expo-file-system
import { LoginScreen } from '../screens/auth/LoginScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';

// Path screens - web versions
import { FinancePathNew } from '../screens/finance/FinancePathNew';
import { MentalHealthPath } from '../screens/mental/MentalHealthPath';
import { PhysicalHealthPath } from '../screens/physical/PhysicalHealthPath';
import { NutritionPath } from '../screens/nutrition/NutritionPath';

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
          <>
            <Stack.Screen name="Main" component={TabNavigatorNew} />

            {/* Path screens - accessible from Journey */}
            <Stack.Screen name="FinancePathNew" component={FinancePathNew} />
            <Stack.Screen name="MentalHealthPath" component={MentalHealthPath} />
            <Stack.Screen name="PhysicalHealthPath" component={PhysicalHealthPath} />
            <Stack.Screen name="NutritionPath" component={NutritionPath} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
