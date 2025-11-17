import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Pillar } from '../../types';

const pillarColors: Record<Pillar, string> = {
  finance: '#10B981',
  mental: '#8B5CF6',
  physical: '#F59E0B',
  nutrition: '#EC4899',
};

const pillarIcons: Record<Pillar, any> = {
  finance: '💰',
  mental: '🧠',
  physical: '💪',
  nutrition: '🥗',
};

const actionTypeIcons = {
  lesson: '📚',
  tool: '🛠️',
  habit: '💪',
  challenge: '🎯',
};

const difficultyColors = {
  easy: '#10B981',
  medium: '#F59E0B',
  hard: '#EF4444',
};

export const TasksScreen = ({ navigation }: any) => {
  const { dailyTasks, completeTask, progress, generateSmartTasks } = useAppStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (user?.id) {
        await generateSmartTasks(user.id);
      }
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    setRefreshing(false);
  };

  const handleTaskAction = (task: any) => {
    if (task.completed) return;

    // If task has action_screen, navigate there
    if (task.action_screen) {
      console.log('Navigating to:', task.action_screen, task.action_params);
      navigation.navigate(task.action_screen, task.action_params || {});
    } else {
      // Otherwise just complete it
      handleCompleteTask(task.id);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const completedCount = dailyTasks?.filter(t => t.completed).length || 0;
  const totalCount = dailyTasks?.length || 0;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>✅ Smart Tasks</Text>
          <Text style={styles.subtitle}>Your personalized daily goals</Text>
        </View>

        {/* Progress Summary */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressRate}>{completionRate}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${completionRate}%` }
              ]}
            />
          </View>
          <View style={styles.progressStats}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{completedCount}/{totalCount}</Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{(dailyTasks || []).reduce((sum, t) => t.completed ? sum + t.points : sum, 0)}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{progress?.level || 1}</Text>
              <Text style={styles.statLabel}>Level</Text>
            </View>
          </View>
        </View>

        {/* Tasks List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Tasks</Text>
          {dailyTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📝</Text>
              <Text style={styles.emptyStateText}>No tasks for today</Text>
              <Text style={styles.emptyStateSubtext}>Pull down to refresh and generate smart tasks</Text>
            </View>
          ) : (
            (dailyTasks || []).map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  task.completed && styles.taskCardCompleted,
                ]}
              >
                {/* Task Content */}
                <View style={styles.taskContent}>
                  {/* Left: Pillar Badge */}
                  <View style={[styles.pillarBadge, { backgroundColor: pillarColors[task.pillar] }]}>
                    <Text style={styles.pillarIcon}>{pillarIcons[task.pillar]}</Text>
                  </View>

                  {/* Middle: Task Info */}
                  <View style={styles.taskInfo}>
                    {/* Title with action type badge */}
                    <View style={styles.titleRow}>
                      {task.action_type && (
                        <Text style={styles.actionTypeBadge}>
                          {actionTypeIcons[task.action_type as keyof typeof actionTypeIcons]}
                        </Text>
                      )}
                      <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                        {task.title}
                      </Text>
                    </View>

                    <Text style={styles.taskDescription}>{task.description}</Text>

                    {/* Meta info */}
                    <View style={styles.taskMeta}>
                      <View style={styles.taskMetaItem}>
                        <Ionicons name="time-outline" size={14} color={colors.textLight} />
                        <Text style={styles.taskMetaText}>{task.duration} min</Text>
                      </View>
                      <View style={styles.taskMetaItem}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text style={styles.taskMetaText}>{task.points} XP</Text>
                      </View>
                      {task.difficulty && (
                        <View style={[
                          styles.difficultyBadge,
                          { backgroundColor: difficultyColors[task.difficulty as keyof typeof difficultyColors] + '20' }
                        ]}>
                          <Text style={[
                            styles.difficultyText,
                            { color: difficultyColors[task.difficulty as keyof typeof difficultyColors] }
                          ]}>
                            {task.difficulty.toUpperCase()}
                          </Text>
                        </View>
                      )}
                      {task.streak_eligible && !task.completed && (
                        <View style={styles.streakBadge}>
                          <Text style={styles.streakText}>🔥 Streak</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                {/* Right: Action Button */}
                <View style={styles.taskActions}>
                  {task.completed ? (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={32} color="#10B981" />
                      <Text style={styles.completedText}>Done!</Text>
                    </View>
                  ) : (
                    <>
                      {task.action_screen ? (
                        <TouchableOpacity
                          style={[styles.actionButton, { backgroundColor: pillarColors[task.pillar] }]}
                          onPress={() => handleTaskAction(task)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.actionButtonText}>
                            {task.action_type === 'lesson' ? 'Start Lesson' :
                             task.action_type === 'tool' ? 'Open Tool' :
                             task.action_type === 'challenge' ? 'Take Challenge' : 'Do It'}
                          </Text>
                          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.checkButton}
                          onPress={() => handleCompleteTask(task.id)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="checkmark-circle-outline" size={32} color={colors.textLight} />
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Tips Section */}
        {dailyTasks.length > 0 && completedCount < totalCount && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 How Smart Tasks Work</Text>
            <Text style={styles.tipsText}>• Tasks adapt to your current progress in each pillar</Text>
            <Text style={styles.tipsText}>• Click "Start Lesson" or "Open Tool" to begin</Text>
            <Text style={styles.tipsText}>• Complete tasks to earn XP and maintain streaks</Text>
            <Text style={styles.tipsText}>• Tasks with 🔥 count towards your pillar streak</Text>
            <Text style={styles.tipsText}>• Pull down to refresh and get new personalized tasks</Text>
          </View>
        )}

        {/* Celebration when all done */}
        {completedCount === totalCount && totalCount > 0 && (
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationIcon}>🎉</Text>
            <Text style={styles.celebrationTitle}>All Tasks Complete!</Text>
            <Text style={styles.celebrationText}>
              Great work! You've completed all {totalCount} tasks for today.
            </Text>
            <Text style={styles.celebrationText}>
              Come back tomorrow for new personalized challenges!
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
  },
  progressCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  progressRate: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: colors.textLight,
    textAlign: 'center',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskCardCompleted: {
    opacity: 0.7,
  },
  taskContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  pillarBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pillarIcon: {
    fontSize: 24,
  },
  taskInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  actionTypeBadge: {
    fontSize: 18,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskMetaText: {
    fontSize: 12,
    color: colors.textLight,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  streakBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  streakText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  taskActions: {
    alignItems: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  checkButton: {
    padding: 8,
  },
  completedBadge: {
    alignItems: 'center',
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginTop: 4,
  },
  tipsCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
    lineHeight: 20,
  },
  celebrationCard: {
    margin: 20,
    marginTop: 0,
    padding: 24,
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    alignItems: 'center',
  },
  celebrationIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
