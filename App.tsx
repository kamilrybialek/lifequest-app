import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { useAppStore } from './src/store/appStore';
import { paperTheme } from './src/theme/theme';
import { initDatabase } from './src/database/init';
import { initializeNotifications } from './src/utils/notifications';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { OfflineBanner } from './src/components/OfflineBanner';
import Analytics from './src/services/analytics';
import Toast from 'react-native-toast-message';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const loadUser = useAuthStore((state) => state.loadUser);
  const loadAppData = useAppStore((state) => state.loadAppData);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Start analytics session
        Analytics.startSession();

        // Initialize database first
        console.log('🔧 [1/4] Initializing database...');
        await initDatabase();
        console.log('✅ [1/4] Database initialized successfully');

        // Load user and app data
        console.log('🔧 [2/4] Loading user...');
        await loadUser();
        console.log('✅ [2/4] User loaded');

        console.log('🔧 [3/4] Loading app data...');
        await loadAppData();
        console.log('✅ [3/4] App data loaded');

        // Initialize push notifications
        console.log('🔧 [4/4] Initializing push notifications...');
        await initializeNotifications();
        console.log('✅ [4/4] Push notifications initialized');

        console.log('🎉 All initialization complete!');
      } catch (error) {
        console.error('❌ Initialization error:', error);
        console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';

        // On web, allow app to continue with limited functionality (don't set error)
        if (Platform.OS === 'web') {
          console.warn('⚠️ Running in degraded mode on web platform');
          console.warn('⚠️ Error was:', errorMessage);
          // Don't set initError for web - let the app continue
        } else {
          // On mobile, show error screen
          setInitError(`Failed to initialize app: ${errorMessage}`);
        }
      } finally {
        console.log('📍 Setting isInitializing to false');
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
        {Platform.OS === 'web' && (
          <Text style={styles.debugText}>Check browser console for logs</Text>
        )}
      </View>
    );
  }

  // Show error screen if initialization failed
  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>⚠️ Initialization Error</Text>
        <Text style={styles.errorText}>{initError}</Text>
        {Platform.OS === 'web' ? (
          <Text style={styles.errorHint}>Check browser console for details. Attempting to continue anyway...</Text>
        ) : (
          <Text style={styles.errorHint}>Please restart the app</Text>
        )}
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <AppNavigator />
          <OfflineBanner />
          <Toast />
        </PaperProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
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
  debugText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666666',
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#58CC02',
    marginBottom: 20,
  },
  successText: {
    fontSize: 18,
    color: '#333333',
    marginBottom: 20,
  },
  debug: {
    fontSize: 16,
    color: '#666666',
    marginVertical: 5,
  },
  hint: {
    fontSize: 12,
    color: '#999999',
    marginTop: 30,
    fontStyle: 'italic',
  },
});