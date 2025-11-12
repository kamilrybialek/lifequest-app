import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Temporary test screens to isolate which one crashes
const TestLoginScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Login Screen Test</Text>
    <Text style={styles.text}>This is a placeholder</Text>
  </View>
);

const TestTabNavigator = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Tab Navigator Test</Text>
    <Text style={styles.text}>This is a placeholder</Text>
  </View>
);

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
          <Stack.Screen name="Login" component={TestLoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={TestTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#58CC02',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: '#333333',
  },
});
