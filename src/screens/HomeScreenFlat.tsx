import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { Task, Pillar } from '../types';
import { colors } from '../theme/colors';
import { typography, shadows } from '../theme/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export const HomeScreenFlat = ({ navigation }: any) => {
  const { dailyTasks, progress, completeTask, loadAppData } = useAppStore();
  const { user } = useAuthStore();

  useEffect(() => {
    loadAppData();
  }, []);

  const getPillarColor = (pillar: Pillar) => {
    switch (pillar) {
      case 'finance': return colors.finance;
      case 'mental': return colors.mental;
      case 'physical': return colors.physical;
      case 'nutrition': return colors.nutrition;
      default: return colors.text;
    }
  };

  const getPillarIcon = (pillar: Pillar) => {
    switch (pillar) {
      case 'finance': return '💰';
      case 'mental': return '🧠';
      case 'physical': return '💪';
      case 'nutrition': return '🥗';
    }
  };

  const completedTasks = dailyTasks.filter(t => t.completed).length;
  const totalTasks = dailyTasks.length;
  const xpToNextLevel = 100;
  const currentLevelXP = progress.xp % 100;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {user?.email?.split('@')[0]}!
          </Text>
          <Text style={styles.subtitle}>Ready to level up? 🚀</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* XP Progress - Duolingo Style */}
      <View style={styles.xpContainer}>
        <View style={styles.xpHeader}>
          <Text style={styles.xpLabel}>Level {progress.level}</Text>
          <Text style={styles.xpText}>{currentLevelXP}/{xpToNextLevel} XP</Text>
        </View>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBarFill, { width: `${(currentLevelXP / xpToNextLevel) * 100}%` }]} />
        </View>
      </View>

      {/* Daily Goals Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Today's Progress</Text>
        <View style={styles.summaryContent}>
          <View style={styles.progressRing}>
            <Text style={styles.progressNumber}>{completedTasks}/{totalTasks}</Text>
          </View>
          <View style={styles.summaryText}>
            <Text style={styles.summaryMain}>
              {completedTasks === totalTasks
                ? "🎉 All tasks complete!"
                : `${totalTasks - completedTasks} task${totalTasks - completedTasks !== 1 ? 's' : ''} remaining`}
            </Text>
            <Text style={styles.summarySecondary}>
              Keep your streak alive!
            </Text>
          </View>
        </View>
      </View>

      {/* Task Cards - Duolingo Style */}
      <View style={styles.tasksSection}>
        <Text style={styles.sectionTitle}>Today's Challenges</Text>
        {dailyTasks.map((task) => {
          const getTaskScreen = () => {
            if (task.pillar === 'finance') return 'ExpenseLogger';
            if (task.pillar === 'mental') return 'MorningSunlight';
            if (task.pillar === 'physical') return 'Physical';
            if (task.pillar === 'nutrition') return 'Nutrition';
            return 'Finance';
          };

          return (
            <DuolingoTaskCard
              key={task.id}
              task={task}
              onComplete={() => completeTask(task.id)}
              onPress={() => navigation.navigate(getTaskScreen(), { taskId: task.id })}
              color={getPillarColor(task.pillar)}
              icon={getPillarIcon(task.pillar)}
            />
          );
        })}
      </View>

      {/* Streaks - Flat Design */}
      <View style={styles.streaksCard}>
        <Text style={styles.sectionTitle}>🔥 Your Streaks</Text>
        <View style={styles.streaksGrid}>
          {progress.streaks.map((streak) => (
            <View key={streak.pillar} style={styles.streakItem}>
              <View style={[styles.streakIcon, { backgroundColor: getPillarColor(streak.pillar) }]}>
                <Text style={styles.streakEmoji}>{getPillarIcon(streak.pillar)}</Text>
              </View>
              <Text style={styles.streakNumber}>{streak.current}</Text>
              <Text style={styles.streakLabel}>day{streak.current !== 1 ? 's' : ''}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={[styles.statBox, { backgroundColor: colors.xpGold + '20' }]}>
          <Text style={styles.statValue}>{progress.totalPoints}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.streak + '20' }]}>
          <Text style={styles.statValue}>
            {Math.max(...progress.streaks.map(s => s.longest))}
          </Text>
          <Text style={styles.statLabel}>Best Streak</Text>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

interface DuolingoTaskCardProps {
  task: Task;
  onComplete: () => void;
  onPress: () => void;
  color: string;
  icon: string;
}

const DuolingoTaskCard: React.FC<DuolingoTaskCardProps> = ({ task, onComplete, onPress, color, icon }) => {
  return (
    <TouchableOpacity
      onPress={task.completed ? undefined : onPress}
      activeOpacity={task.completed ? 1 : 0.8}
      disabled={task.completed}
    >
      <View style={[
        styles.taskCard,
        task.completed && styles.taskCardCompleted,
        { borderBottomColor: color, borderBottomWidth: 6 }
      ]}>
        <View style={styles.taskHeader}>
          <View style={[styles.taskIconCircle, { backgroundColor: color }]}>
            <Text style={styles.taskIcon}>{icon}</Text>
          </View>
          <View style={styles.taskInfo}>
            <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
              {task.title}
            </Text>
            <Text style={styles.taskMeta}>
              ⏱️ {task.duration} min • +{task.points} XP
            </Text>
          </View>
        </View>

        {!task.completed ? (
          <View style={[styles.completeButton, { backgroundColor: color }]}>
            <Text style={styles.completeButtonText}>START</Text>
          </View>
        ) : (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.background,
  },
  greeting: {
    ...typography.heading,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  // XP Progress
  xpContainer: {
    margin: 16,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    ...shadows.small,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  xpLabel: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  xpText: {
    ...typography.caption,
  },
  xpBarContainer: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.xpGold,
  },
  // Summary Card
  summaryCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    ...shadows.small,
  },
  summaryTitle: {
    ...typography.bodyBold,
    marginBottom: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
  },
  summaryText: {
    flex: 1,
  },
  summaryMain: {
    ...typography.body,
    marginBottom: 4,
  },
  summarySecondary: {
    ...typography.caption,
  },
  // Tasks Section
  tasksSection: {
    padding: 16,
  },
  sectionTitle: {
    ...typography.heading,
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadows.medium,
  },
  taskCardCompleted: {
    opacity: 0.6,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  taskIcon: {
    fontSize: 28,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    ...typography.bodyBold,
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  taskMeta: {
    ...typography.small,
  },
  completeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  completedBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 24,
    color: colors.success,
  },
  // Streaks
  streaksCard: {
    padding: 16,
    paddingTop: 0,
  },
  streaksGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
    ...shadows.small,
  },
  streakItem: {
    alignItems: 'center',
  },
  streakIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakEmoji: {
    fontSize: 28,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  streakLabel: {
    ...typography.small,
  },
  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
  },
  bottomSpacer: {
    height: 20,
  },
});