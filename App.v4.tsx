/**
 * LifeQuest V4 - Fresh Start
 * Minimal, clean implementation
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import existing auth store (keeping your data!)
import { useAuthStore } from './src/store/authStore';

// Import theme
import { theme } from './src/theme/theme.v4';

// Temporary minimal screens (we'll build proper ones next)
import { LoginScreen } from './src/screens/auth/LoginScreen';

const Stack = createNativeStackNavigator();

// Minimal Home Screen (temporary)
const HomeScreen = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 LifeQuest V4</Text>
      <Text style={styles.subtitle}>Welcome back!</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <Text style={styles.button} onPress={logout}>
        Logout
      </Text>
    </View>
  );
};

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const loadUser = useAuthStore((state) => state.loadUser);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('🚀 Initializing LifeQuest V4...');
        await loadUser();
        console.log('✅ User loaded');
      } catch (error) {
        console.error('❌ Init error:', error);
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, []);

  if (isInitializing) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background },
          }}
        >
          {user ? (
            <Stack.Screen name="Home" component={HomeScreen} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
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
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.h3,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  email: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
  },
  button: {
    ...theme.typography.h4,
    color: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
  },
});
