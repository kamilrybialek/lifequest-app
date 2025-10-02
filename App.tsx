import React, { useEffect, useState } from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { useAppStore } from './src/store/appStore';
import { theme } from './src/theme/theme';
import { initDatabase } from './src/database/init';

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
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
      } catch (error) {
        console.error('Initialization error:', error);
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

  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
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
});