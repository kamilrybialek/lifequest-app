/**
 * DASHBOARD - Duolingo Style
 *
 * Modern, colorful dashboard with:
 * - Welcome header with greeting
 * - Quick Actions (horizontal scroll)
 * - Stats grid 2x2 with real data
 * - Activity feed with gradients
 * - Uses official Design System
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { designSystem } from '../../theme/designSystem';
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

interface FeedCard {
  id: string;
  type: 'time-suggestion' | 'insight' | 'stat-highlight';
  data: any;
}

// Quick Actions - moved outside component to avoid recreating on every render
const QUICK_WINS: QuickWin[] = [
  { id: '1', title: 'Finance', icon: '💰', color: '#4A90E2', time: '30 sec', screen: 'FinanceDashboard' },
  { id: '2', title: 'Add Task', icon: '✅', color: '#58CC02', time: '10 sec', screen: 'TasksNew' },
  { id: '3', title: 'Physical', icon: '💪', color: '#FF6B6B', time: '2 min', screen: 'PhysicalHealthPath' },
  { id: '4', title: 'Mental', icon: '🧘', color: '#9C27B0', time: '5 min', screen: 'MentalHealthPath' },
  { id: '5', title: 'Nutrition', icon: '🍽️', color: '#4CAF50', time: '1 min', screen: 'NutritionPath' },
  { id: '6', title: 'Journey', icon: '📚', color: '#FFD700', time: '2 min', screen: 'Journey' },
];

export const DashboardScreenNew = ({ navigation }: any) => {
  const { user } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<DashboardInsight[]>([]);
  const [feedCards, setFeedCards] = useState<FeedCard[]>([]);

  // Track if we're currently loading to prevent multiple simultaneous loads
  const isLoadingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const renderCountRef = useRef(0);

  // Debug: track renders
  renderCountRef.current += 1;
  if (renderCountRef.current > 100) {
    console.error('🔴 INFINITE RENDER DETECTED - stopping useEffect');
    throw new Error('Infinite render loop detected in Dashboard');
  }
  console.log(`🔄 Dashboard render #${renderCountRef.current}, user.id: ${user?.id}`);

  // Load dashboard data on mount and when user changes
  useEffect(() => {
    if (!user?.id) return;

    // Prevent multiple simultaneous loads
    if (isLoadingRef.current && lastUserIdRef.current === user.id) {
      console.log('⏸️ Skipping duplicate load for same user');
      return;
    }

    const loadData = async () => {
      try {
        isLoadingRef.current = true;
        lastUserIdRef.current = user.id;
        setLoading(true);

        // Calculate isDemoUser inside useEffect to avoid dependency issues
        const isDemoUser = user.id === 'demo-user-local';

        const [dashboardStats, dashboardInsights] = await Promise.all([
          getDashboardStats(user.id, isDemoUser),
          getDashboardInsights(user.id, isDemoUser),
        ]);

        setStats(dashboardStats);
        setInsights(dashboardInsights);

        // Build feed cards inline to avoid dependency issues
        const cards: FeedCard[] = [];
        const currentHour = new Date().getHours();

        // Time-based suggestions
        if (currentHour >= 6 && currentHour < 10) {
          cards.push({
            id: 'morning-routine',
            type: 'time-suggestion',
            data: {
              title: '☀️ Good Morning!',
              description: 'Start your day with a 5-minute meditation',
              icon: 'sunny',
              color: colors.mental,
              action: 'Start',
              screen: 'MentalHealthPath',
            },
          });
        } else if (currentHour >= 12 && currentHour < 14) {
          cards.push({
            id: 'lunch',
            type: 'time-suggestion',
            data: {
              title: '🍽️ Lunch Time',
              description: 'Log your lunch to track your nutrition goals',
              icon: 'restaurant',
              color: colors.nutrition,
              action: 'Log Meal',
              screen: 'NutritionPath',
            },
          });
        } else if (currentHour >= 17 && currentHour < 20) {
          cards.push({
            id: 'workout',
            type: 'time-suggestion',
            data: {
              title: '🏋️ Evening Workout',
              description: 'Perfect time for your daily workout',
              icon: 'barbell',
              color: colors.physical,
              action: 'Start',
              screen: 'PhysicalHealthPath',
            },
          });
        }

        // Add stat highlights for impressive numbers
        if (dashboardStats.tasks.completionRate >= 80) {
          cards.push({
            id: 'task-highlight',
            type: 'stat-highlight',
            data: {
              title: '🎯 Task Master!',
              description: `${dashboardStats.tasks.completionRate.toFixed(0)}% completion rate`,
              color: '#FFD700',
            },
          });
        }

        if (dashboardStats.physical.currentStreak >= 7) {
          cards.push({
            id: 'streak-highlight',
            type: 'stat-highlight',
            data: {
              title: '🔥 On Fire!',
              description: `${dashboardStats.physical.currentStreak} day workout streak`,
              color: '#FF4500',
            },
          });
        }

        // Add insights
        dashboardInsights.forEach(insight => {
          cards.push({
            id: insight.id,
            type: 'insight',
            data: insight,
          });
        });

        setFeedCards(cards);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadData();
  }, [user?.id]); // Only depend on user ID, calculate isDemoUser inside

  const onRefresh = useCallback(async () => {
    if (!user?.id) return;

    try {
      setRefreshing(true);

      // Calculate isDemoUser inside to avoid dependency issues
      const isDemoUser = user.id === 'demo-user-local';

      const [dashboardStats, dashboardInsights] = await Promise.all([
        getDashboardStats(user.id, isDemoUser),
        getDashboardInsights(user.id, isDemoUser),
      ]);

      setStats(dashboardStats);
      setInsights(dashboardInsights);

      // Build feed cards
      const cards: FeedCard[] = [];
      const currentHour = new Date().getHours();

      // Time-based suggestions
      if (currentHour >= 6 && currentHour < 10) {
        cards.push({
          id: 'morning-routine',
          type: 'time-suggestion',
          data: {
            title: '☀️ Good Morning!',
            description: 'Start your day with a 5-minute meditation',
            icon: 'sunny',
            color: colors.mental,
            action: 'Start',
            screen: 'MentalHealthPath',
          },
        });
      } else if (currentHour >= 12 && currentHour < 14) {
        cards.push({
          id: 'lunch',
          type: 'time-suggestion',
          data: {
            title: '🍽️ Lunch Time',
            description: 'Log your lunch to track your nutrition goals',
            icon: 'restaurant',
            color: colors.nutrition,
            action: 'Log Meal',
            screen: 'NutritionPath',
          },
        });
      } else if (currentHour >= 17 && currentHour < 20) {
        cards.push({
          id: 'workout',
          type: 'time-suggestion',
          data: {
            title: '🏋️ Evening Workout',
            description: 'Perfect time for your daily workout',
            icon: 'barbell',
            color: colors.physical,
            action: 'Start',
            screen: 'PhysicalHealthPath',
          },
        });
      }

      // Add stat highlights
      if (dashboardStats.tasks.completionRate >= 80) {
        cards.push({
          id: 'task-highlight',
          type: 'stat-highlight',
          data: {
            title: '🎯 Task Master!',
            description: `${dashboardStats.tasks.completionRate.toFixed(0)}% completion rate`,
            color: '#FFD700',
          },
        });
      }

      if (dashboardStats.physical.currentStreak >= 7) {
        cards.push({
          id: 'streak-highlight',
          type: 'stat-highlight',
          data: {
            title: '🔥 On Fire!',
            description: `${dashboardStats.physical.currentStreak} day workout streak`,
            color: '#FF4500',
          },
        });
      }

      // Add insights
      dashboardInsights.forEach(insight => {
        cards.push({
          id: insight.id,
          type: 'insight',
          data: insight,
        });
      });

      setFeedCards(cards);
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user?.id]); // Only depend on user ID, calculate isDemoUser inside

  const renderQuickWin = useCallback((item: QuickWin) => {
    const getGradient = (color: string) => {
      if (color === '#4A90E2') return ['#4A90E2', '#5FA3E8']; // Finance
      if (color === '#FF6B6B') return ['#FF6B6B', '#FF8787']; // Physical
      if (color === '#9C27B0') return ['#9C27B0', '#BA68C8']; // Mental
      if (color === '#4CAF50') return ['#4CAF50', '#66BB6A']; // Nutrition
      if (color === '#FFD700') return ['#FFD700', '#FFA000']; // Gold
      return ['#58CC02', '#89E219']; // Default green
    };

    return (
      <TouchableOpacity
        key={item.id}
        onPress={() => navigation.navigate(item.screen)}
        activeOpacity={0.8}
        style={styles.quickWinWrapper}
      >
        <LinearGradient
          colors={getGradient(item.color) as any}
          style={styles.quickWinCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.quickWinIcon}>{item.icon}</Text>
          <Text style={styles.quickWinTitle}>{item.title}</Text>
          <Text style={styles.quickWinTime}>{item.time}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }, [navigation]);

  const renderStatsCard = useCallback((
    title: string,
    value: string | number,
    subtitle: string,
    icon: any,
    color: string,
    onPress?: () => void
  ) => {
    const getGradient = (color: string) => {
      if (color.includes('finance') || color === colors.finance) return ['#4A90E2', '#5FA3E8'];
      if (color.includes('physical') || color === colors.physical) return ['#FF6B6B', '#FF8787'];
      if (color.includes('mental') || color === colors.mental) return ['#1CB0F6', '#5ED4FF'];
      if (color.includes('nutrition') || color === colors.nutrition) return ['#4CAF50', '#66BB6A'];
      if (color.includes('primary') || color === colors.primary) return ['#58CC02', '#89E219'];
      return ['#58CC02', '#89E219'];
    };

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={onPress ? 0.8 : 1}
        disabled={!onPress}
        style={styles.statsCardWrapper}
      >
        <LinearGradient
          colors={getGradient(color) as any}
          style={styles.statsCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statsIconContainer}>
            <Ionicons name={icon} size={28} color="#FFF" />
          </View>
          <Text style={styles.statsValue}>{value}</Text>
          <Text style={styles.statsTitle}>{title}</Text>
          <Text style={styles.statsSubtitle}>{subtitle}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  }, [navigation]);

  const renderFeedCard = useCallback(({ item }: { item: FeedCard }) => {
    if (item.type === 'time-suggestion') {
      return (
        <TouchableOpacity
          style={styles.feedCard}
          onPress={() => navigation.navigate(item.data.screen)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[item.data.color + '20', item.data.color + '05']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.suggestionGradient}
          >
            <View style={styles.suggestionContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.suggestionTitle}>{item.data.title}</Text>
                <Text style={styles.suggestionDescription}>{item.data.description}</Text>
              </View>
              <TouchableOpacity
                style={[styles.suggestionButton, { backgroundColor: item.data.color }]}
                activeOpacity={0.8}
              >
                <Text style={styles.suggestionButtonText}>{item.data.action}</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    if (item.type === 'stat-highlight') {
      return (
        <TouchableOpacity style={styles.feedCard} activeOpacity={0.9}>
          <LinearGradient
            colors={[item.data.color, item.data.color + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.achievementGradient}
          >
            <Text style={styles.achievementTitle}>{item.data.title}</Text>
            <Text style={styles.achievementDescription}>{item.data.description}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    if (item.type === 'insight') {
      const insight = item.data as DashboardInsight;
      const getInsightIcon = () => {
        if (insight.type === 'achievement') return 'trophy';
        if (insight.type === 'warning') return 'warning';
        if (insight.type === 'suggestion') return 'bulb';
        return 'information-circle';
      };

      return (
        <TouchableOpacity
          style={styles.insightCard}
          onPress={() => insight.action && navigation.navigate(insight.action.screen)}
          activeOpacity={0.9}
        >
          <View style={[styles.insightIconContainer, { backgroundColor: insight.color + '20' }]}>
            <Ionicons name={getInsightIcon() as any} size={24} color={insight.color} />
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDescription}>{insight.description}</Text>
          </View>
          {insight.action && (
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          )}
        </TouchableOpacity>
      );
    }

    return null;
  }, [navigation]);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#4A90E2', '#5FA3E8']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{getGreeting()} 👋</Text>
          <Text style={styles.userName}>{user?.email?.split('@')[0] || 'Champion'}!</Text>
        </View>
        <TouchableOpacity style={styles.levelBadge}>
          <Ionicons name="star" size={20} color="#FFD700" />
          <Text style={styles.levelText}>Level 1</Text>
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={feedCards}
        renderItem={renderFeedCard}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* Quick Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickWinsContainer}
              >
                {QUICK_WINS.map(renderQuickWin)}
              </ScrollView>
            </View>

            {/* Stats Grid */}
            {stats && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📊 Your Progress</Text>
                <View style={styles.statsGrid}>
                  {renderStatsCard(
                    'Budget Usage',
                    `${stats.finance.budgetUsagePercent.toFixed(0)}%`,
                    `$${stats.finance.budgetRemaining.toFixed(0)} remaining`,
                    'wallet',
                    colors.finance,
                    () => navigation.navigate('FinanceDashboard')
                  )}

                  {renderStatsCard(
                    'Tasks',
                    `${stats.tasks.completedTasks}/${stats.tasks.totalTasks}`,
                    `${stats.tasks.completionRate.toFixed(0)}% complete`,
                    'checkmark-circle',
                    colors.primary,
                    () => navigation.navigate('TasksNew')
                  )}

                  {renderStatsCard(
                    'Workouts',
                    `${stats.physical.workoutsThisWeek}/${stats.physical.workoutGoal}`,
                    'This week',
                    'fitness',
                    colors.physical,
                    () => navigation.navigate('PhysicalHealthPath')
                  )}

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

            {/* Activity Feed Title */}
            {feedCards.length > 0 && (
              <Text style={styles.sectionTitle}>📱 Your Activity Feed</Text>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="leaf" size={64} color={colors.textLight} />
              <Text style={styles.emptyText}>You're all caught up!</Text>
              <Text style={styles.emptySubtext}>
                Start tracking your activities to see personalized insights here
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.background,
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
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
    fontWeight: '600',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  levelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
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
  quickWinWrapper: {
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  quickWinCard: {
    width: 110,
    height: 110,
    borderRadius: 20,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickWinIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickWinTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  quickWinTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  statsCardWrapper: {
    width: '48%',
    marginBottom: 12,
  },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    minHeight: 160,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  statsIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  statsSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    fontWeight: '600',
  },
  feedContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  feedCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionGradient: {
    padding: 16,
  },
  suggestionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  suggestionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  suggestionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  achievementGradient: {
    padding: 20,
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
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
