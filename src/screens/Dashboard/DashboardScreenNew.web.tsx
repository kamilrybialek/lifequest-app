/**
 * DASHBOARD - Web/PWA Version with TimeBloc Design
 * Redesigned: Clean, unified life overview with goal tracking
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
import { LifeOverviewCard } from '../../components/dashboard/LifeOverviewCard';
import { WeeklyHealthQuiz } from '../../components/health/WeeklyHealthQuiz';
import { getTodaysTasks, getRecentActivity, Task } from '../../database/tasks';

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string[];
  screen: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: '1', title: 'Finance', icon: '💰', color: timeblocGradients.finance, screen: 'FinanceDashboard' },
  { id: '2', title: 'Diet', icon: '🥗', color: timeblocGradients.nutrition, screen: 'DietDashboardScreen' },
  { id: '3', title: 'Physical', icon: '💪', color: timeblocGradients.physical, screen: 'WorkoutTrackerScreen' },
  { id: '4', title: 'Mental', icon: '🧠', color: timeblocGradients.mental, screen: 'MeditationTimer' },
];

export const DashboardScreenNew = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { goals, loadGoals } = useGoalsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHealthQuiz, setShowHealthQuiz] = useState(false);
  const [todaysTasks, setTodaysTasks] = useState<Task[]>([]);
  const [recentActivity, setRecentActivity] = useState<Task[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await loadGoals();

      if (user?.id) {
        const tasks = await getTodaysTasks(user.id);
        setTodaysTasks(tasks);

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

  // Get goals by horizon
  const monthGoals = goals.filter(g => g.timeHorizon === 'month');
  const quarterGoals = goals.filter(g => g.timeHorizon === 'quarter');
  const yearGoals = goals.filter(g => g.timeHorizon === 'year');
  const lifeGoals = goals.filter(g => g.timeHorizon === 'life');

  const handleTaskToggle = async (taskId: number) => {
    // TODO: Implement task toggle
    console.log('Toggle task:', taskId);
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
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()} 👋</Text>
            <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Champion'}</Text>
            <Text style={styles.date}>{getFormattedDate()}</Text>
          </View>
        </View>

        {/* Life Overview - Unified LifeScore + Health */}
        {user?.id && (
          <LifeOverviewCard
            userId={user.id}
            onDetailsPress={() => setShowHealthQuiz(true)}
          />
        )}

        {/* Goals Progress - All 4 Horizons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎯 Your Goals</Text>
            <TouchableOpacity onPress={() => navigation?.navigate('GoalsScreen')}>
              <Text style={styles.seeAllText}>Manage</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.goalsGrid}>
            {/* Month Goals */}
            <TouchableOpacity
              style={styles.goalHorizonCard}
              onPress={() => navigation?.navigate('GoalsScreen')}
              activeOpacity={0.7}
            >
              <View style={styles.goalHorizonHeader}>
                <Ionicons name="calendar-outline" size={20} color={timeblocColors.mental} />
                <Text style={styles.goalHorizonTitle}>Month</Text>
              </View>
              <View style={styles.goalHorizonStats}>
                <Text style={styles.goalHorizonValue}>
                  {monthGoals.filter(g => g.completed).length}/{monthGoals.length}
                </Text>
                <View style={styles.goalProgressBar}>
                  <View
                    style={[
                      styles.goalProgressFill,
                      {
                        width: monthGoals.length > 0
                          ? `${(monthGoals.filter(g => g.completed).length / monthGoals.length) * 100}%`
                          : '0%',
                        backgroundColor: timeblocColors.mental
                      }
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>

            {/* Quarter Goals */}
            <TouchableOpacity
              style={styles.goalHorizonCard}
              onPress={() => navigation?.navigate('GoalsScreen')}
              activeOpacity={0.7}
            >
              <View style={styles.goalHorizonHeader}>
                <Ionicons name="calendar" size={20} color={timeblocColors.finance} />
                <Text style={styles.goalHorizonTitle}>Quarter</Text>
              </View>
              <View style={styles.goalHorizonStats}>
                <Text style={styles.goalHorizonValue}>
                  {quarterGoals.filter(g => g.completed).length}/{quarterGoals.length}
                </Text>
                <View style={styles.goalProgressBar}>
                  <View
                    style={[
                      styles.goalProgressFill,
                      {
                        width: quarterGoals.length > 0
                          ? `${(quarterGoals.filter(g => g.completed).length / quarterGoals.length) * 100}%`
                          : '0%',
                        backgroundColor: timeblocColors.finance
                      }
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>

            {/* Year Goals */}
            <TouchableOpacity
              style={styles.goalHorizonCard}
              onPress={() => navigation?.navigate('GoalsScreen')}
              activeOpacity={0.7}
            >
              <View style={styles.goalHorizonHeader}>
                <Ionicons name="calendar-sharp" size={20} color={timeblocColors.physical} />
                <Text style={styles.goalHorizonTitle}>Year</Text>
              </View>
              <View style={styles.goalHorizonStats}>
                <Text style={styles.goalHorizonValue}>
                  {yearGoals.filter(g => g.completed).length}/{yearGoals.length}
                </Text>
                <View style={styles.goalProgressBar}>
                  <View
                    style={[
                      styles.goalProgressFill,
                      {
                        width: yearGoals.length > 0
                          ? `${(yearGoals.filter(g => g.completed).length / yearGoals.length) * 100}%`
                          : '0%',
                        backgroundColor: timeblocColors.physical
                      }
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>

            {/* Life Goals (300 Goals) */}
            <TouchableOpacity
              style={styles.goalHorizonCard}
              onPress={() => navigation?.navigate('GoalsScreen')}
              activeOpacity={0.7}
            >
              <View style={styles.goalHorizonHeader}>
                <Ionicons name="infinite" size={20} color={timeblocColors.nutrition} />
                <Text style={styles.goalHorizonTitle}>Life</Text>
              </View>
              <View style={styles.goalHorizonStats}>
                <Text style={styles.goalHorizonValue}>
                  {lifeGoals.length}/300
                </Text>
                <View style={styles.goalProgressBar}>
                  <View
                    style={[
                      styles.goalProgressFill,
                      {
                        width: `${(lifeGoals.length / 300) * 100}%`,
                        backgroundColor: timeblocColors.nutrition
                      }
                    ]}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

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
              todaysTasks.slice(0, 3).map((task) => (
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
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

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
                </LinearGradient>
              </TouchableOpacity>
            ))}
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
        onComplete={() => loadData()}
        userId={user?.id || ''}
      />
    </SafeAreaView>
  );
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
    paddingBottom: timeblocSpacing.md,
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
    marginTop: timeblocSpacing.lg,
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
  // Goals Grid (2x2)
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.xl,
  },
  goalHorizonCard: {
    width: 'calc(50% - 6px)',
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.md,
    ...timeblocShadows.soft,
  },
  goalHorizonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: timeblocSpacing.xs,
    marginBottom: timeblocSpacing.sm,
  },
  goalHorizonTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: timeblocColors.text,
  },
  goalHorizonStats: {
    gap: timeblocSpacing.xs,
  },
  goalHorizonValue: {
    fontSize: 24,
    fontWeight: '700',
    color: timeblocColors.text,
  },
  goalProgressBar: {
    height: 4,
    backgroundColor: timeblocColors.borderLight,
    borderRadius: timeblocBorderRadius.sm,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    borderRadius: timeblocBorderRadius.sm,
  },
  // Today's Focus
  todayCard: {
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.xl,
    padding: timeblocSpacing.lg,
    ...timeblocShadows.soft,
    marginBottom: timeblocSpacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: timeblocSpacing.xl,
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
  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: timeblocSpacing.md,
    marginBottom: timeblocSpacing.xl,
  },
  actionCardWrapper: {
    width: 'calc(50% - 6px)',
    borderRadius: timeblocBorderRadius.xl,
    ...timeblocShadows.soft,
  },
  actionCard: {
    padding: timeblocSpacing.xl,
    borderRadius: timeblocBorderRadius.xl,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: timeblocSpacing.sm,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  // Recent Activity
  activityCard: {
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.xl,
    padding: timeblocSpacing.lg,
    ...timeblocShadows.soft,
    marginBottom: timeblocSpacing.xl,
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
