/**
 * Onboarding Navigator - Web Version
 * Routes through 12 step-by-step onboarding screens with smooth animations
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { WelcomeScreen } from '../Onboarding/WelcomeScreen.web';
import { NameScreen } from '../Onboarding/NameScreen.web';
import { AgeScreen } from '../Onboarding/AgeScreen.web';
import { GenderScreen } from '../Onboarding/GenderScreen.web';
import { BodyMeasurementsScreen } from '../Onboarding/BodyMeasurementsScreen.web';
import { PhysicalHealthScreen } from '../Onboarding/PhysicalHealthScreen.web';
import { MentalHealthScreen } from '../Onboarding/MentalHealthScreen.web';
import { FinanceScreen } from '../Onboarding/FinanceScreen.web';
import { NutritionScreen } from '../Onboarding/NutritionScreen.web';
import { GoalsScreen } from '../Onboarding/GoalsScreen.web';
import { ResultsScreen } from '../Onboarding/ResultsScreen.web';

const Stack = createNativeStackNavigator();

export const OnboardingScreen = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 300,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="Age" component={AgeScreen} />
      <Stack.Screen name="Gender" component={GenderScreen} />
      <Stack.Screen name="BodyMeasurements" component={BodyMeasurementsScreen} />
      <Stack.Screen name="PhysicalHealth" component={PhysicalHealthScreen} />
      <Stack.Screen name="MentalHealth" component={MentalHealthScreen} />
      <Stack.Screen name="Finance" component={FinanceScreen} />
      <Stack.Screen name="Nutrition" component={NutritionScreen} />
      <Stack.Screen name="Goals" component={GoalsScreen} />
      <Stack.Screen name="Results" component={ResultsScreen} />
    </Stack.Navigator>
  );
};
