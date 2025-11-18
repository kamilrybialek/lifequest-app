/**
 * NEW DASHBOARD - INTEGRATED WITH REAL DATA
 *
 * Real-time dashboard with data from all pillars:
 * - Finance stats from Firebase
 * - Task completion from Firebase/AsyncStorage
 * - Physical/Mental/Nutrition from AsyncStorage
 * - Personalized insights based on actual user data
 * - Quick actions for common tasks
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { getDashboardStats, getDashboardInsights, type DashboardStats, type DashboardInsight } from '../../services/dashboardService';

const { width } = Dimensions.get('window');

interface QuickWin {
  id: string;
  title: string;
  icon: string;
  color: string;
  time: string;
  screen: string;
}

export const DashboardScreenNew = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const isDemoUser = user?.id === 'demo-user-local';

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<DashboardInsight[]>([]);

  // Quick wins - horizontal scroll
  const quickWins: QuickWin[] = [
    { id: '1', title: 'Finance', icon: '💰', color: colors.finance, time: '30 sec', screen: 'FinanceDashboard' },
    { id: '2', title: 'Add Task', icon: '✅', color: colors.primary, time: '10 sec', screen: 'TasksNew' },
    { id: '3', title: 'Physical', icon: '💪', color: colors.physical, time: '2 min', screen: 'PhysicalHealthPath' },
    { id: '4', title: 'Mental', icon: '🧘', color: colors.mental, time: '5 min', screen: 'MentalHealthPath' },
    { id: '5', title: 'Nutrition', icon: '🍽️', color: colors.nutrition, time: '1 min', screen: 'NutritionPath' },
    { id: '6', title: 'Journey', icon: '📚', color: colors.primary, time: '2 min', screen: 'Journey' },
  ];

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const [dashboardStats, dashboardInsights] = await Promise.all([
        getDashboardStats(user.id, isDemoUser),
        getDashboardInsights(user.id, isDemoUser),
      ]);

      setStats(dashboardStats);
      setInsights(dashboardInsights);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [user?.id]);

  const renderQuickWin = (item: QuickWin) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.quickWinCard, { borderColor: item.color }]}
      onPress={() => navigation.navigate(item.screen)}
      activeOpacity={0.8}
    >
      <Text style={styles.quickWinIcon}>{item.icon}</Text>
      <Text style={styles.quickWinTitle}>{item.title}</Text>
      <Text style={styles.quickWinTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  const renderStatsCard = (
    title: string,
    value: string | number,
    subtitle: string,
    icon: any,
    color: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={styles.statsCard}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={[styles.statsIconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statsContent}>
        <Text style={styles.statsValue}>{value}</Text>
        <Text style={styles.statsTitle}>{title}</Text>
        <Text style={styles.statsSubtitle}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderInsight = ({ item }: { item: DashboardInsight }) => {
    const getInsightIcon = () => {
      if (item.type === 'achievement') return 'trophy';
      if (item.type === 'warning') return 'warning';
      if (item.type === 'suggestion') return 'bulb';
      return 'information-circle';
    };

    return (
      <TouchableOpacity
        style={styles.insightCard}
        onPress={() => item.action && navigation.navigate(item.action.screen)}
        activeOpacity={0.9}
      >
        <View style={[styles.insightIconContainer, { backgroundColor: item.color + '20' }]}>
          <Ionicons name={getInsightIcon() as any} size={24} color={item.color} />
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>{item.title}</Text>
          <Text style={styles.insightDescription}>{item.description}</Text>
        </View>
        {item.action && (
          <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
        )}
      </TouchableOpacity>
    );
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={16} color={colors.primary} />
            <Text style={styles.levelText}>Level 1</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={insights}
        renderItem={renderInsight}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* Quick Wins Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickWinsContainer}
              >
                {quickWins.map(renderQuickWin)}
              </ScrollView>
            </View>

            {/* Stats Overview */}
            {stats && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Your Progress</Text>
                <View style={styles.statsGrid}>
                  {/* Finance Stats */}
                  {renderStatsCard(
                    'Budget Usage',
                    `${stats.finance.budgetUsagePercent.toFixed(0)}%`,
                    `$${stats.finance.budgetRemaining.toFixed(0)} remaining`,
                    'wallet',
                    colors.finance,
                    () => navigation.navigate('FinanceDashboard')
                  )}

                  {/* Task Stats */}
                  {renderStatsCard(
                    'Tasks',
                    `${stats.tasks.completedTasks}/${stats.tasks.totalTasks}`,
                    `${stats.tasks.completionRate.toFixed(0)}% complete`,
                    'checkmark-circle',
                    colors.primary,
                    () => navigation.navigate('TasksNew')
                  )}

                  {/* Physical Stats */}
                  {renderStatsCard(
                    'Workouts',
                    `${stats.physical.workoutsThisWeek}/${stats.physical.workoutGoal}`,
                    'This week',
                    'fitness',
                    colors.physical,
                    () => navigation.navigate('PhysicalHealthPath')
                  )}

                  {/* Nutrition Stats */}
                  {renderStatsCard(
                    'Calories',
                    `${stats.nutrition.caloriesConsumed}`,
                    `of ${stats.nutrition.calorieGoal} goal`,
                    'restaurant',
                    colors.nutrition,
                    () => navigation.navigate('NutritionPath')
                  )}
                </View>
              </View>
            )}

            {/* Insights Section Header */}
            {insights.length > 0 && (
              <Text style={styles.sectionTitle}>💡 Insights & Recommendations</Text>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="leaf" size={64} color={colors.textLight} />
            <Text style={styles.emptyText}>You're all caught up!</Text>
            <Text style={styles.emptySubtext}>
              Start tracking your activities to see personalized insights here
            </Text>
          </View>
        }
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 20,
    marginBottom: 12,
  },
  quickWinsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  quickWinCard: {
    width: 100,
    height: 100,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickWinIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  quickWinTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  quickWinTime: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statsCard: {
    width: (width - 44) / 2,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsContent: {
    gap: 2,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  statsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statsSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  feedContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
});
