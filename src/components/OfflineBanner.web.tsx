/**
 * Offline Banner Component (Web Version)
 * Uses browser's native online/offline events instead of NetInfo
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Use browser's online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      // Slide up
      Animated.spring(slideAnim, {
        toValue: -100,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    };

    const handleOffline = () => {
      setIsOnline(false);
      // Slide down
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [slideAnim]);

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons name="cloud-offline" size={20} color="#FFF" />
      <Text style={styles.text}>No internet connection</Text>
      <Text style={styles.subtext}>Changes will sync when you're back online</Text>
    </Animated.View>
  );
};

// ============================================================================
// NETWORK STATUS HOOK (Web Version)
// ============================================================================

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isInternetReachable: isOnline,
    isFullyOnline: isOnline,
  };
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.warning,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  text: {
    ...typography.bodyBold,
    color: '#FFFFFF',
    flex: 1,
  },
  subtext: {
    ...typography.tiny,
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
