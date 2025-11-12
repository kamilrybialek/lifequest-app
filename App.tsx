import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { useAppStore } from './src/store/appStore';
import { theme } from './src/theme/theme';
import { initDatabase } from './src/database/init';
import { initializeNotifications } from './src/utils/notifications';
import Toast from 'react-native-toast-message';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const loadUser = useAuthStore((state) => state.loadUser);
  const loadAppData = useAppStore((state) => state.loadAppData);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize database first
        console.log('Initializing database...');
        await initDatabase();
        console.log('Database initialized successfully');

        // Load user and app data
        await loadUser();
        await loadAppData();

        // Initialize push notifications
        console.log('Initializing push notifications...');
        await initializeNotifications();
        console.log('Push notifications initialized');
      } catch (error) {
        console.error('Initialization error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
        setInitError(`Failed to initialize app: ${errorMessage}`);

        // On web, still allow app to continue with limited functionality
        if (Platform.OS === 'web') {
          console.warn('⚠️ Running in degraded mode on web platform');
        }
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, []);

  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#58CC02" />
        <Text style={styles.loadingText}>Loading LifeQuest...</Text>
      </View>
    );
  }

  // Show error screen if initialization failed and we're not on web
  if (initError && Platform.OS !== 'web') {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ Initialization Error</Text>
        <Text style={styles.errorText}>{initError}</Text>
        <Text style={styles.errorHint}>Please restart the app</Text>
      </View>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
      <Toast />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF0000',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorHint: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});