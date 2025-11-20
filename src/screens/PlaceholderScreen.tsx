/**
 * PLACEHOLDER SCREEN - For debugging
 * Ultra simple screen with no dependencies to test navigation
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
      <Text style={styles.text}>✅ Placeholder Screen</Text>
      <Text style={styles.subtitle}>Route: {route?.name || 'unknown'}</Text>
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
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    color: '#999999',
    marginTop: 8,
  },
});
