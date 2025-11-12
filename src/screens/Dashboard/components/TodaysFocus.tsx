import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../components/ui/Card';
import { colors } from '../../../theme/colors';
import { typography } from '../../../theme/theme';
import { spacing } from '../../../theme/spacing';
import { Task } from '../../../types';

interface TodaysFocusProps {
  task: Task | null;
  onComplete: (taskId: string) => void;
  onPress: () => void;
}

export const TodaysFocus: React.FC<TodaysFocusProps> = ({ task, onComplete, onPress }) => {
  if (!task) {
    return (
      <Card variant="elevated" style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
          <Text style={styles.emptyTitle}>All Done for Today!</Text>
          <Text style={styles.emptySubtitle}>Great job! Check back tomorrow.</Text>
        </View>
      </Card>
    );
  }

  const pillarConfig = {
    finance: { color: colors.finance, icon: 'wallet' },
    mental: { color: colors.mental, icon: 'happy' },
    physical: { color: colors.physical, icon: 'fitness' },
    nutrition: { color: colors.nutrition, icon: 'restaurant' },
  };

  const config = pillarConfig[task.pillar];

  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>TODAY'S FOCUS</Text>
        <View style={[styles.badge, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon as any} size={16} color={config.color} />
          <Text style={[styles.badgeText, { color: config.color }]}>
            {task.pillar.toUpperCase()}
          </Text>
        </View>
      </View>

      <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.taskContent}>
        <Text style={styles.title}>{task.title}</Text>
        {task.description && (
          <Text style={styles.description}>{task.description}</Text>
        )}

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.metaText}>{task.estimatedTime || 5} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="star-outline" size={16} color={colors.xpGold} />
            <Text style={styles.metaText}>+{task.xp || 10} XP</Text>
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.completeButton, { backgroundColor: config.color }]}
        onPress={() => onComplete(task.id)}
        activeOpacity={0.8}
      >
        <Ionicons name="checkmark" size={20} color={colors.background} />
        <Text style={styles.completeButtonText}>Complete Task</Text>
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  taskContent: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  completeButtonText: {
    ...typography.bodyBold,
    color: colors.background,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
