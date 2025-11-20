/**
 * PLACEHOLDER SCREEN - Temporary Workaround for Web
 *
 * This screen is used ONLY on web platform as a workaround for a bundler bug.
 * Real screens (Dashboard, Tools, Tasks, Journey, Profile) cause an infinite loop
 * in the webpack/metro module loader: "Object.get [as DashboardScreenNew]"
 *
 * On native platforms, the real screens are used.
 *
 * TODO: Investigate and fix the webpack/metro bundler configuration issue
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

let placeholderRenderCount = 0;

export const PlaceholderScreen = ({ route }: any) => {
  placeholderRenderCount++;
  console.log(`🟢 PlaceholderScreen render #${placeholderRenderCount}, route: ${route?.name || 'unknown'}`);

  if (placeholderRenderCount > 100) {
    console.error('🔴 INFINITE RENDER in PlaceholderScreen!');
    throw new Error('Infinite render loop detected in PlaceholderScreen');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🚧</Text>
      <Text style={styles.text}>PWA Version Under Construction</Text>
      <Text style={styles.subtitle}>Tab: {route?.name || 'unknown'}</Text>
      <Text style={styles.info}>
        The full LifeQuest experience is available on mobile apps.{'\n'}
        Web version coming soon!
      </Text>
      <Text style={styles.count}>Render #{placeholderRenderCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
    padding: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },
  info: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  count: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 8,
  },
});
