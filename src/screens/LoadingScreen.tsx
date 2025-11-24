/**
 * LoadingScreen - Shown while checking authentication state
 * Prevents flash of login screen for authenticated users
 */

import React from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';

export const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* App Logo/Icon */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🎯</Text>
          <Text style={styles.appName}>LifeQuest</Text>
        </View>

        {/* Loading Indicator */}
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loader}
        />

        <Text style={styles.loadingText}>Loading your progress...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  loader: {
    marginVertical: 24,
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
  },
});
