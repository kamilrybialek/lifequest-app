/**
 * LifeQuest V4 - Tool Detail Screen
 * Placeholder for individual tool functionality
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { theme } from '../../theme/theme.v4';

const PILLAR_COLORS: Record<string, string> = {
  finance: theme.colors.finance,
  mental: theme.colors.mental,
  physical: theme.colors.physical,
  nutrition: theme.colors.nutrition,
};

export const ToolDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<any>();

  const { toolId, toolTitle, pillar } = route.params || {};
  const color = PILLAR_COLORS[pillar] || theme.colors.primary;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{toolTitle}</Text>
        <View style={{ width: 32 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Text style={[styles.icon, { color }]}>{toolTitle?.[0] || 'T'}</Text>
        </View>
        <Text style={styles.title}>{toolTitle}</Text>
        <Text style={styles.description}>
          This tool is being built! Full functionality for {toolTitle} will be available in the next update.
        </Text>
        <View style={[styles.badge, { backgroundColor: color + '15' }]}>
          <Text style={[styles.badgeText, { color }]}>Coming Soon</Text>
        </View>

        <TouchableOpacity
          style={[styles.goBackButton, { backgroundColor: color }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  topBarTitle: {
    ...theme.typography.h4,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  icon: {
    fontSize: 36,
    fontWeight: '800',
  },
  title: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  badge: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    marginBottom: theme.spacing.xl,
  },
  badgeText: {
    ...theme.typography.body,
    fontWeight: '700',
  },
  goBackButton: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    ...theme.shadows.md,
  },
  goBackButtonText: {
    ...theme.typography.h4,
    color: '#FFF',
  },
});
