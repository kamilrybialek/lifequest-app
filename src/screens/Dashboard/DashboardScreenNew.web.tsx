/**
 * DASHBOARD - Web/PWA Version with TimeBloc Design
 * Pragmatic, goal-oriented approach (no gamification)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useGoalsStore, Goal } from '../../store/goalsStore';
import { timeblocColors, timeblocShadows, timeblocSpacing, timeblocBorderRadius, timeblocTypography, timeblocGradients } from '../../theme/timeblocTheme';
import { HealthMetricsCard } from '../../components/health/HealthMetricsCard';
import { WeeklyHealthQuiz } from '../../components/health/WeeklyHealthQuiz';
import { LifeScoreCard } from '../../components/dashboard/LifeScoreCard';
import { getTodaysTasks, getRecentActivity, Task } from '../../database/tasks';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string[];
  description: string;
  screen: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: '1', title: 'Finance', icon: '💰', color: timeblocGradients.finance, description: 'Track finances', screen: 'FinanceDashboard' },
  { id: '2', title: 'Diet', icon: '🥗', color: timeblocGradients.nutrition, description: 'Diet', screen: 'DietDashboardScreen' },
  { id: '3', title: 'Physical', icon: '💪', color: timeblocGradients.physical, description: 'Physical health', screen: 'WorkoutTrackerScreen' },
  { id: '4', title: 'Mental', icon: '🧠', color: timeblocGradients.mental, description: 'Mental wellness', screen: 'MeditationTimer' },
];

export const DashboardScreenNew = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { goals, loadGoals, toggleGoal } = useGoalsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHealthQuiz, setShowHealthQuiz] = useState(false);
  const [healthKey, setHealthKey] = useState(0);
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [recentActivity, setRecentActivity] = useState<Task[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await loadGoals();

      // Load today's tasks
      if (user?.id) {
        const tasks = await getTodaysTasks(user.id);
        setTodaysTasks(tasks);

        // Load recent activity (last 5 completed)
        const activity = await getRecentActivity(user.id, 5);
        setRecentActivity(activity);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getFormattedDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Get active goals (top 5 incomplete)
  const activeGoals = goals
    .filter(g => !g.completed && (g.timeHorizon === 'month' || g.timeHorizon === 'quarter'))
    .slice(0, 5);

  // Calculate weekly summary
  const weeklyTasksCompleted = recentActivity.filter(t => {
    if (!t.completed_at) return false;
    const completedDate = new Date(t.completed_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return completedDate >= weekAgo;
  }).length;

  const handleTaskToggle = async (taskId: number) => {
    // TODO: Implement task toggle
    console.log('Toggle task:', taskId);
    await loadData();
  };

  const handleGoalToggle = async (goalId: string) => {
    await toggleGoal(goalId);
    await loadData();
  };

  const getTimeAgo = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={timeblocColors.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header - Clean, No Gamification */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Champion'}</Text>
            <Text style={styles.date}>{getFormattedDate()}</Text>
          </View>
        </View>

        {/* Life Score Result */}
        {user?.id && (
          <LifeScoreCard
            userId={user.id}
            onSurveyPress={() => setShowHealthQuiz(true)}
          />
        )}

        {/* Health Metrics */}
        {user?.id && (
          <HealthMetricsCard
            key={healthKey}
            userId={user.id}
          />
        )}

        {/* Today's Focus */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Today's Focus</Text>
            {todaysTasks.length > 0 && (
              <Text style={styles.sectionSubtitle}>
                {todaysTasks.filter(t => t.completed).length}/{todaysTasks.length}
              </Text>
            )}
          </View>
          <View style={styles.todayCard}>
            {todaysTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={48} color={timeblocColors.textTertiary} />
                <Text style={styles.emptyText}>No tasks scheduled for today</Text>
                <Text style={styles.emptySubtext}>Add tasks to stay focused</Text>
              </View>
            ) : (
              todaysTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskItem}
                  onPress={() => handleTaskToggle(task.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={task.completed ? timeblocColors.success : timeblocColors.textSecondary}
                  />
                  <Text style={[styles.taskText, task.completed && styles.taskCompleted]}>
                    {task.title}
                  </Text>
                  {task.pillar && (
                    <View style={[styles.pillarBadge, { backgroundColor: getPillarColor(task.pillar) + '20' }]}>
                      <Text style={[styles.pillarText, { color: getPillarColor(task.pillar) }]}>
                        {task.pillar}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎯 Active Goals</Text>
              <TouchableOpacity onPress={() => navigation?.navigate('GoalsScreen')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.goalsContainer}>
              {activeGoals.map((goal) => (
                <View key={goal.id} style={styles.goalCard}>
                  <View style={styles.goalHeader}>
                    <TouchableOpacity onPress={() => handleGoalToggle(goal.id)}>
                      <Ionicons
                        name={goal.completed ? 'checkmark-circle' : 'ellipse-outline'}
                        size={20}
                        color={goal.completed ? timeblocColors.success : timeblocColors.textSecondary}
                      />
                    </TouchableOpacity>
                    <Text style={styles.goalText} numberOfLines={1}>
                      {goal.text}
                    </Text>
                    <Text style={styles.goalHorizon}>
                      {goal.timeHorizon === 'month' ? '30d' : '90d'}
                    </Text>
                  </View>
                  {/* Progress bar placeholder - would calculate based on sub-tasks */}
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '40%', backgroundColor: timeblocColors.primary }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.actionCardWrapper}
                onPress={() => navigation?.navigate(action.screen)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={action.color}
                  style={styles.actionCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weekly Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 This Week</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{weeklyTasksCompleted}</Text>
                <Text style={styles.summaryLabel}>Tasks Done</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>{goals.filter(g => g.completed).length}</Text>
                <Text style={styles.summaryLabel}>Goals Hit</Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryValue}>
                  {Math.round((weeklyTasksCompleted / 7) * 100)}%
                </Text>
                <Text style={styles.summaryLabel}>Completion</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Recent Activity</Text>
            <View style={styles.activityCard}>
              {recentActivity.map((item) => (
                <View key={item.id} style={styles.activityItem}>
                  <Ionicons name="checkmark-circle" size={16} color={timeblocColors.success} />
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.activityTime}>{getTimeAgo(item.completed_at)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Weekly Health Quiz Modal */}
      <WeeklyHealthQuiz
        visible={showHealthQuiz}
        onClose={() => setShowHealthQuiz(false)}
        onComplete={() => {
          setHealthKey(prev => prev + 1);
        }}
        userId={user?.id || ''}
      />
    </SafeAreaView>
  );
};

const getPillarColor = (pillar: string) => {
  const colors: Record<string, string> = {
    finance: timeblocColors.finance,
    mental: timeblocColors.mental,
    physical: timeblocColors.physical,
    nutrition: timeblocColors.nutrition,
  };
  return colors[pillar.toLowerCase()] || timeblocColors.textSecondary;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: timeblocColors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: timeblocSpacing.lg,
    ...timeblocTypography.body,
    color: timeblocColors.textSecondary,
  },
  header: {
    paddingHorizontal: timeblocSpacing.xl,
    paddingTop: timeblocSpacing.xl,
    paddingBottom: timeblocSpacing.xxl,
  },
  greeting: {
    fontSize: 15,
    color: timeblocColors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: timeblocColors.text,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: timeblocColors.textSecondary,
    fontWeight: '400',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: timeblocSpacing.sm,
    paddingHorizontal: timeblocSpacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: timeblocSpacing.lg,
  },
  sectionTitle: {
    ...timeblocTypography.h3,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: timeblocColors.primary,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: timeblocColors.primary,
  },
  // Today's Focus
  todayCard: {
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.xl,
    padding: timeblocSpacing.lg,
    ...timeblocShadows.soft,
    marginBottom: timeblocSpacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: timeblocSpacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: timeblocColors.text,
    marginTop: timeblocSpacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    color: timeblocColors.textSecondary,
    marginTop: 4,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: timeblocSpacing.md,
    gap: timeblocSpacing.md,
  },
  taskText: {
    flex: 1,
    fontSize: 15,
    color: timeblocColors.text,
    fontWeight: '500',
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: timeblocColors.textSecondary,
  },
  pillarBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: timeblocBorderRadius.sm,
  },
  pillarText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  // Active Goals
  goalsContainer: {
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.xxl,
  },
  goalCard: {
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.lg,
    ...timeblocShadows.soft,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: timeblocSpacing.sm,
    marginBottom: timeblocSpacing.sm,
  },
  goalText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: timeblocColors.text,
  },
  goalHorizon: {
    fontSize: 12,
    fontWeight: '600',
    color: timeblocColors.textTertiary,
  },
  progressBar: {
    height: 4,
    backgroundColor: timeblocColors.borderLight,
    borderRadius: timeblocBorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: timeblocBorderRadius.sm,
  },
  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.xxl,
  },
  actionCardWrapper: {
    width: 'calc(50% - 6px)',
    borderRadius: timeblocBorderRadius.xl,
    ...timeblocShadows.soft,
  },
  actionCard: {
    padding: timeblocSpacing.xl,
    borderRadius: timeblocBorderRadius.xl,
    minHeight: 130,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 36,
    marginBottom: timeblocSpacing.sm,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  // Weekly Summary
  summaryCard: {
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.xl,
    padding: timeblocSpacing.lg,
    ...timeblocShadows.soft,
    marginBottom: timeblocSpacing.xxl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: timeblocColors.text,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: timeblocColors.textSecondary,
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: timeblocColors.borderLight,
  },
  // Recent Activity
  activityCard: {
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.xl,
    padding: timeblocSpacing.lg,
    ...timeblocShadows.soft,
    marginBottom: timeblocSpacing.xxl,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: timeblocSpacing.sm,
    paddingVertical: timeblocSpacing.sm,
  },
  activityContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: timeblocColors.text,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: timeblocColors.textSecondary,
    marginLeft: timeblocSpacing.sm,
  },
});
