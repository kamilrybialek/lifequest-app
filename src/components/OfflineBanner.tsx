/**
 * Offline Banner Component
 * Shows connectivity status to the user
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import { colors, typography, spacing } from '../theme';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected && state.isInternetReachable !== false;
      setIsOnline(online);

      if (!online) {
        // Slide down
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      } else {
        // Slide up
        Animated.spring(slideAnim, {
          toValue: -100,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      }
    });

    return () => unsubscribe();
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
// NETWORK STATUS HOOK
// ============================================================================

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected || false);
      setIsInternetReachable(state.isInternetReachable !== false);
    });

    return () => unsubscribe();
  }, []);

  return {
    isOnline,
    isInternetReachable,
    isFullyOnline: isOnline && isInternetReachable,
  };
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 0,
    left: 0,
    right: 0,
    backgroundColor: colors.warning,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
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
