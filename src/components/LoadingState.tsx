import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface LoadingStateProps {
  message?: string;
  inline?: boolean;
}

/**
 * Loading state component
 *
 * @example
 * // Full screen loading
 * <LoadingState message="Loading your data..." />
 *
 * // Inline loading (smaller, for sections)
 * <LoadingState message="Loading..." inline />
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  inline = false,
}) => {
  if (inline) {
    return (
      <View style={styles.inlineContainer}>
        <ActivityIndicator size="small" color="#58CC02" />
        {message && <Text style={styles.inlineMessage}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#58CC02" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 24,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: '#777777',
    textAlign: 'center',
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  inlineMessage: {
    marginLeft: 12,
    fontSize: 14,
    color: '#777777',
  },
});
