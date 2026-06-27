/**
 * LifeQuest V4 - Mode Selection Screen
 * Shown after successful login. User chooses User mode or Admin mode.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme/theme.v4';
import { useAuthStore } from '../../store/authStore';
import { isAdminUser } from '../Admin/AdminScreen';

interface Props {
  onSelectMode: (mode: 'user' | 'admin') => void;
}

export const ModeSelectionScreen = ({ onSelectMode }: Props) => {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const showAdmin = isAdminUser(user?.email);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.subtitle}>Choose how you want to use LifeQuest</Text>
        </View>

        {/* Mode Cards */}
        <View style={styles.cardsContainer}>
          {/* User Mode */}
          <TouchableOpacity
            style={styles.modeCard}
            onPress={() => onSelectMode('user')}
            activeOpacity={0.7}
          >
            <View style={[styles.modeIconBg, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.modeIcon, { color: theme.colors.primary }]}>U</Text>
            </View>
            <Text style={styles.modeTitle}>Continue as User</Text>
            <Text style={styles.modeDescription}>
              Access your dashboard, complete tasks, track progress, and level up
            </Text>
            <View style={[styles.modeButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.modeButtonText}>Enter App</Text>
            </View>
          </TouchableOpacity>

          {/* Admin Mode */}
          {showAdmin && (
            <TouchableOpacity
              style={[styles.modeCard, styles.adminCard]}
              onPress={() => onSelectMode('admin')}
              activeOpacity={0.7}
            >
              <View style={[styles.modeIconBg, { backgroundColor: theme.colors.error + '20' }]}>
                <Text style={[styles.modeIcon, { color: theme.colors.error }]}>A</Text>
              </View>
              <Text style={styles.modeTitle}>Enter Admin Mode</Text>
              <Text style={styles.modeDescription}>
                Manage users, content, settings, and app configuration
              </Text>
              <View style={[styles.modeButton, { backgroundColor: theme.colors.error }]}>
                <Text style={styles.modeButtonText}>Admin Panel</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  welcomeText: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodySmall,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: theme.spacing.md,
  },
  modeCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary + '30',
    ...theme.shadows.md,
  },
  adminCard: {
    borderColor: theme.colors.error + '30',
  },
  modeIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  modeIcon: {
    fontSize: 24,
    fontWeight: '800',
  },
  modeTitle: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.xs,
  },
  modeDescription: {
    ...theme.typography.bodySmall,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  modeButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
  },
  modeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
