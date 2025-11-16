import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { APP_VERSION } from '../config/version';

const VERSION_KEY = 'lifequest.app.version';

/**
 * VersionChecker Component for Web (PWA)
 *
 * Detects when a new app version is available and prompts user to reload.
 *
 * How it works:
 * 1. On mount, checks stored version vs current APP_VERSION
 * 2. If different (new version detected), shows update banner
 * 3. User can click "Update Now" to reload and clear cache
 * 4. Stores current version after reload
 */
export const VersionChecker: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [previousVersion, setPreviousVersion] = useState<string | null>(null);

  useEffect(() => {
    checkVersion();
  }, []);

  const checkVersion = async () => {
    try {
      // Only run on web platform
      if (Platform.OS !== 'web') {
        return;
      }

      // Get stored version
      const storedVersion = await AsyncStorage.getItem(VERSION_KEY);

      console.log('🔍 Version Check:', {
        current: APP_VERSION,
        stored: storedVersion,
      });

      // First time or version changed
      if (storedVersion && storedVersion !== APP_VERSION) {
        console.log('🚀 New version detected!', {
          old: storedVersion,
          new: APP_VERSION,
        });
        setPreviousVersion(storedVersion);
        setUpdateAvailable(true);
      } else {
        // Store current version
        await AsyncStorage.setItem(VERSION_KEY, APP_VERSION);
      }
    } catch (error) {
      console.error('❌ Error checking version:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      console.log('🔄 Forcing app reload...');

      // Store new version
      await AsyncStorage.setItem(VERSION_KEY, APP_VERSION);

      // Clear all cache if available (Service Worker)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('🗑️ Cache cleared');
      }

      // Reload the page (hard reload)
      window.location.reload();
    } catch (error) {
      console.error('❌ Error during update:', error);
      // Fallback: just reload
      window.location.reload();
    }
  };

  const handleDismiss = async () => {
    // User dismissed - store version so we don't show again
    await AsyncStorage.setItem(VERSION_KEY, APP_VERSION);
    setUpdateAvailable(false);
  };

  if (!updateAvailable) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <View style={styles.content}>
          <Ionicons name="rocket" size={24} color={colors.primary} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>Nowa wersja dostępna!</Text>
            <Text style={styles.subtitle}>
              Zaktualizowano z {previousVersion} do {APP_VERSION}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
          >
            <Text style={styles.dismissText}>Później</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.updateButton}
            onPress={handleUpdate}
          >
            <Ionicons name="refresh" size={16} color="#fff" style={styles.icon} />
            <Text style={styles.updateText}>Zaktualizuj teraz</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  banner: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textLight,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  dismissButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.backgroundLight,
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  icon: {
    marginRight: 6,
  },
  updateText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
