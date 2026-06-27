/**
 * LifeQuest V4 - Home Screen (Hinge + Scandinavian Redesign)
 * Large greeting card, streak cards, quick actions grid, recent tasks
 * Light theme, generous spacing, beautiful gradients
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme, gradients } from '../../theme/theme.v4';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

const { width } = Dimensions.get('window');

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Large Greeting Card - Hinge-inspired gradient hero */
const GreetingCard = () => {
  const user = useAuthStore((s) => s.user);
  const progress = useAppStore((s) => s.progress);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = (user as any)?.firstName || user?.email?.split('@')[0] || 'Adventurer';
  const xpProgress = (progress.xp % 100) / 100;

  return (
    <View style={styles.greetingWrapper}>
      <LinearGradient
        colors={gradients.greeting as unknown as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.greetingCard}
      >
        <View style={styles.greetingContent}>
          <Text style={styles.greetingText}>{getGreeting()},</Text>
          <Text style={styles.greetingName}>{displayName}</Text>
        </View>

        <View style={styles.greetingBottom}>
          <View style={styles.levelPill}>
            <Text style={styles.levelPillText}>Level {progress.level}</Text>
          </View>
          <View style={styles.xpBarContainer}>
            <View style={styles.xpBarBg}>
              <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
            </View>
            <Text style={styles.xpText}>{progress.xp % 100}/100 XP</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

/** Today's Streaks - 4 horizontal cards */
const StreakSection = () => {
  const streaks = useAppStore((s) => s.progress.streaks);
  const CARD_WIDTH = (width - theme.spacing.lg * 2 - 8 * 3) / 4;

  const pillarConfig: Record<string, { label: string; color: string; emoji: string; gradient: readonly [string, string] }> = {
    finance: { label: 'Finance', color: theme.colors.finance, emoji: '$', gradient: gradients.finance },
    mental: { label: 'Mental', color: theme.colors.mental, emoji: 'M', gradient: gradients.mental },
    physical: { label: 'Physical', color: theme.colors.physical, emoji: 'P', gradient: gradients.physical },
    nutrition: { label: 'Diet', color: theme.colors.diet, emoji: 'D', gradient: gradients.nutrition },
  };

  return (
    <View style={styles.streakSection}>
      <Text style={styles.sectionTitle}>Today's Streaks</Text>
      <View style={styles.streakRow}>
        {streaks.map((streak) => {
          const config = pillarConfig[streak.pillar];
          if (!config) return null;
          return (
            <View key={streak.pillar} style={[styles.streakCard, { width: CARD_WIDTH }]}>
              <View style={[styles.streakIconBg, { backgroundColor: config.color + '15' }]}>
                <Text style={[styles.streakIcon, { color: config.color }]}>{config.emoji}</Text>
              </View>
              <Text style={styles.streakCount}>{streak.current}</Text>
              <Text style={styles.streakLabel}>{config.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

/** Daily Progress - subtle inline bar */
const DailyProgress = () => {
  const tasks = useAppStore((s) => s.dailyTasks);
  const completed = tasks.filter((t) => t.completed).length;
  const total = tasks.length || 1;
  const percentage = Math.round((completed / total) * 100);

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Today's Progress</Text>
        <Text style={styles.progressCount}>{completed}/{total}</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%` },
            percentage === 100 && { backgroundColor: theme.colors.success },
          ]}
        />
      </View>
    </View>
  );
};

/** Daily Tasks - checkboxes with pillar dots */
const DailyTasks = () => {
  const tasks = useAppStore((s) => s.dailyTasks);
  const completeTask = useAppStore((s) => s.completeTask);
  const navigation = useNavigation<any>();

  const pillarColors: Record<string, string> = {
    finance: theme.colors.finance,
    mental: theme.colors.mental,
    physical: theme.colors.physical,
    nutrition: theme.colors.diet,
  };

  if (tasks.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Quests</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No quests yet today</Text>
          <Text style={styles.emptySubtext}>Check back later for new adventures</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daily Quests</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Tasks')} activeOpacity={0.7}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      {tasks.slice(0, 5).map((task) => (
        <TouchableOpacity
          key={task.id}
          style={[styles.taskRow, task.completed && styles.taskRowCompleted]}
          onPress={() => !task.completed && completeTask(task.id)}
          activeOpacity={task.completed ? 1 : 0.6}
        >
          {/* Checkbox */}
          <TouchableOpacity
            style={[
              styles.checkbox,
              { borderColor: pillarColors[task.pillar] || theme.colors.primary },
              task.completed && {
                backgroundColor: pillarColors[task.pillar] || theme.colors.primary,
                borderColor: pillarColors[task.pillar] || theme.colors.primary,
              },
            ]}
            onPress={() => !task.completed && completeTask(task.id)}
            activeOpacity={0.6}
          >
            {task.completed && <Text style={styles.checkMark}>V</Text>}
          </TouchableOpacity>

          {/* Content */}
          <View style={styles.taskContent}>
            <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]} numberOfLines={1}>
              {task.title}
            </Text>
            <Text style={styles.taskDescription} numberOfLines={1}>{task.description}</Text>
          </View>

          {/* Pillar dot + XP */}
          <View style={[styles.pillarDot, { backgroundColor: pillarColors[task.pillar] || theme.colors.primary }]} />
          <Text style={[styles.taskXp, { color: pillarColors[task.pillar] || theme.colors.primary }]}>
            +{task.points}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/** Quick Actions - 2x2 grid of large cards */
const QuickActions = () => {
  const navigation = useNavigation<any>();

  const actions = [
    { label: 'Paths', icon: 'P', color: theme.colors.primary, onPress: () => navigation.navigate('PathsTab') },
    { label: 'Tools', icon: 'T', color: theme.colors.info, onPress: () => navigation.navigate('ToolsTab') },
    { label: 'Tasks', icon: 'Q', color: theme.colors.finance, onPress: () => navigation.navigate('Tasks') },
    { label: 'Planner', icon: 'C', color: theme.colors.diet, onPress: () => navigation.navigate('TaskPlanner') },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionCard}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBg, { backgroundColor: action.color + '12' }]}>
              <Text style={[styles.actionIcon, { color: action.color }]}>{action.icon}</Text>
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// ============================================================================
// MAIN SCREEN
// ============================================================================

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const loadAppData = useAppStore((s) => s.loadAppData);

  useEffect(() => {
    loadAppData().catch((err: any) => {
      console.error('Failed to load app data:', err);
    });
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <GreetingCard />
        <StreakSection />
        <DailyProgress />
        <DailyTasks />
        <QuickActions />
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

// ============================================================================
// STYLES - Scandinavian + Hinge
// ============================================================================

const ACTION_CARD_SIZE = (width - theme.spacing.lg * 2 - theme.spacing.md) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.lg,
  },

  // Greeting Card - Hinge-style hero
  greetingWrapper: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  greetingCard: {
    height: 200,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    justifyContent: 'space-between',
    ...theme.shadows.lg,
  },
  greetingContent: {
    flex: 1,
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 16,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 4,
  },
  greetingName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  greetingBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  levelPill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: theme.radius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  levelPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  xpBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  xpBarBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  xpBarFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  xpText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },

  // Streaks
  streakSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  streakRow: {
    flexDirection: 'row',
    gap: 8,
  },
  streakCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  streakIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  streakIcon: {
    fontSize: 14,
    fontWeight: '800',
  },
  streakCount: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    lineHeight: 26,
  },
  streakLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginTop: 2,
  },

  // Progress
  progressCard: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.divider,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },

  // Sections
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },

  // Tasks
  taskRow: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.sm,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    ...theme.shadows.sm,
  },
  taskRowCompleted: {
    opacity: 0.5,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkMark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  taskContent: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textTertiary,
  },
  taskDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  pillarDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  taskXp: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Empty state
  emptyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },

  // Quick Actions - 2x2 grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  actionCard: {
    width: ACTION_CARD_SIZE,
    height: 120,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionIcon: {
    fontSize: 20,
    fontWeight: '800',
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
});
