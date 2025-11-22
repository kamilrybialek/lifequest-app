import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useAppStore } from '../../store/appStore';
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

export const TasksScreen = () => {
  const { dailyTasks, completeTask, progress, loadAppData } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAppData();
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    setRefreshing(false);
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await completeTask(taskId);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const completedCount = dailyTasks.filter(t => t.completed).length;
  const totalCount = dailyTasks.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>✅ Tasks</Text>
          <Text style={styles.subtitle}>Complete your daily goals</Text>
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
              <Text style={styles.statValue}>{dailyTasks.reduce((sum, t) => t.completed ? sum + t.points : sum, 0)}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{progress.level}</Text>
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
              <Text style={styles.emptyStateSubtext}>Pull down to refresh and generate new tasks</Text>
            </View>
          ) : (
            dailyTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[
                  styles.taskCard,
                  task.completed && styles.taskCardCompleted,
                ]}
                onPress={() => !task.completed && handleCompleteTask(task.id)}
                disabled={task.completed}
              >
                <View style={styles.taskLeft}>
                  <View style={[styles.pillarBadge, { backgroundColor: pillarColors[task.pillar] }]}>
                    <Text style={styles.pillarIcon}>{pillarIcons[task.pillar]}</Text>
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                      {task.title}
                    </Text>
                    <Text style={styles.taskDescription}>{task.description}</Text>
                    <View style={styles.taskMeta}>
                      <View style={styles.taskMetaItem}>
                        <Ionicons name="time-outline" size={14} color={colors.textLight} />
                        <Text style={styles.taskMetaText}>{task.duration} min</Text>
                      </View>
                      <View style={styles.taskMetaItem}>
                        <Ionicons name="star" size={14} color="#F59E0B" />
                        <Text style={styles.taskMetaText}>{task.points} XP</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.taskRight}>
                  {task.completed ? (
                    <View style={styles.checkmarkCompleted}>
                      <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={styles.checkmarkEmpty} />
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Tips Section */}
        {dailyTasks.length > 0 && completedCount < totalCount && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
            <Text style={styles.tipsText}>• Complete tasks to earn XP and level up</Text>
            <Text style={styles.tipsText}>• Maintain streaks for bonus rewards</Text>
            <Text style={styles.tipsText}>• Balance all 4 pillars for optimal growth</Text>
          </View>
        )}

        {/* Celebration */}
        {completedCount === totalCount && totalCount > 0 && (
          <View style={styles.celebrationCard}>
            <Text style={styles.celebrationIcon}>🎉</Text>
            <Text style={styles.celebrationTitle}>All Tasks Complete!</Text>
            <Text style={styles.celebrationText}>
              Amazing work! You've earned {dailyTasks.reduce((sum, t) => sum + t.points, 0)} XP today
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
    paddingTop: 40,
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
    borderRadius: 12,
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
    backgroundColor: '#F3F4F6',
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
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  taskCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskCardCompleted: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pillarBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pillarIcon: {
    fontSize: 20,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  taskMeta: {
    flexDirection: 'row',
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
  taskRight: {
    marginLeft: 12,
  },
  checkmarkEmpty: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.textLight,
  },
  checkmarkCompleted: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
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
  tipsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FEF3C7',
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
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  celebrationIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  celebrationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  celebrationText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
  },
});
