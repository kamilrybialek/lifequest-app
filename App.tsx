/**
 * LifeQuest V4 - Main App Entry
 * Clean architecture with mode selection, bottom tabs and stack navigation
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Stores
import { useAuthStore } from './src/store/authStore';

// Theme
import { theme } from './src/theme/theme.v4';

// Screens
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { ModeSelectionScreen } from './src/screens/auth/ModeSelectionScreen';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AdminScreen } from './src/screens/Admin/AdminScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [appMode, setAppMode] = useState<'user' | 'admin' | null>(null);
  const loadUser = useAuthStore((state) => state.loadUser);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing LifeQuest V4...');
        await loadUser();
        console.log('User loaded');
      } catch (error) {
        console.error('Init error:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, []);

  // Reset mode when user logs out
  useEffect(() => {
    if (!user) {
      setAppMode(null);
    }
  }, [user]);

  if (isInitializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Not logged in: show login
  if (!user) {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  // Logged in but no mode selected: show mode selection
  if (!appMode) {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <ModeSelectionScreen onSelectMode={setAppMode} />
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  // Admin mode: show full-screen admin panel
  if (appMode === 'admin') {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: theme.colors.background },
            }}
          >
            <Stack.Screen name="AdminFull" component={AdminScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  // User mode: show full app with tabs
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator onSwitchMode={() => setAppMode(null)} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.body,
    marginTop: theme.spacing.md,
  },
});
