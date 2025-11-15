/**
 * NEW DASHBOARD - ACTIVITY FEED APPROACH
 *
 * Infinite scroll feed with actionable cards:
 * - Quick Wins (horizontal scroll)
 * - Incomplete tasks
 * - Suggested activities (time-based)
 * - Progress cards per pillar
 * - Achievements
 * - Learning opportunities
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

interface FeedCard {
  id: string;
  type: 'quick-win' | 'task' | 'suggestion' | 'progress' | 'achievement' | 'learning';
  title: string;
  description?: string;
  icon: string;
  color: string;
  action?: string;
  actionIcon?: string;
  progress?: number;
  pillar?: 'finance' | 'mental' | 'physical' | 'nutrition';
}

interface QuickWin {
  id: string;
  title: string;
  icon: string;
  color: string;
  time: string;
  action: string;
}

export const DashboardScreenNew = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { progress } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [feedCards, setFeedCards] = useState<FeedCard[]>([]);

  // Quick wins - horizontal scroll
  const quickWins: QuickWin[] = [
    { id: '1', title: 'Log Workout', icon: '💪', color: colors.physical, time: '2 min', action: 'WorkoutTrackerScreen' },
    { id: '2', title: 'Track Meal', icon: '🍽️', color: colors.nutrition, time: '1 min', action: 'MealLoggerScreen' },
    { id: '3', title: 'Add Expense', icon: '💰', color: colors.finance, time: '30 sec', action: 'ExpenseLoggerScreen' },
    { id: '4', title: 'Meditate', icon: '🧘', color: colors.mental, time: '5 min', action: 'MeditationTimer' },
    { id: '5', title: 'Log Water', icon: '💧', color: colors.nutrition, time: '10 sec', action: 'WaterTrackerScreen' },
    { id: '6', title: 'Check Budget', icon: '📊', color: colors.finance, time: '1 min', action: 'BudgetManagerScreen' },
  ];

  useEffect(() => {
    loadFeed();
  }, []);

  const loadFeed = () => {
    const currentHour = new Date().getHours();
    const feed: FeedCard[] = [];

    // Time-based suggestions
    if (currentHour >= 6 && currentHour < 10) {
      feed.push({
        id: 'morning-routine',
        type: 'suggestion',
        title: '☀️ Good Morning!',
        description: 'Start your day with a 5-minute meditation',
        icon: 'sunny',
        color: colors.mental,
        action: 'Start',
        actionIcon: 'play',
      });
    } else if (currentHour >= 12 && currentHour < 14) {
      feed.push({
        id: 'lunch',
        type: 'suggestion',
        title: '🍽️ Lunch Time',
        description: 'Log your lunch to track your nutrition goals',
        icon: 'restaurant',
        color: colors.nutrition,
        action: 'Log Meal',
        actionIcon: 'add',
      });
    } else if (currentHour >= 17 && currentHour < 20) {
      feed.push({
        id: 'workout',
        type: 'suggestion',
        title: '🏋️ Evening Workout',
        description: 'Perfect time for your daily workout',
        icon: 'barbell',
        color: colors.physical,
        action: 'Start',
        actionIcon: 'play',
      });
    }

    // Progress cards
    feed.push({
      id: 'finance-progress',
      type: 'progress',
      title: 'Finance Progress',
      description: 'You\'ve tracked 12 expenses this week',
      icon: 'wallet',
      color: colors.finance,
      progress: 0.6,
      pillar: 'finance',
    });

    feed.push({
      id: 'physical-progress',
      type: 'progress',
      title: 'Physical Activity',
      description: '3/5 workouts completed this week',
      icon: 'fitness',
      color: colors.physical,
      progress: 0.6,
      pillar: 'physical',
    });

    feed.push({
      id: 'mental-streak',
      type: 'achievement',
      title: '🔥 7-Day Meditation Streak!',
      description: 'Keep going! You\'re on fire',
      icon: 'flame',
      color: colors.streak,
    });

    feed.push({
      id: 'nutrition-progress',
      type: 'progress',
      title: 'Nutrition Tracking',
      description: 'Track 2 more meals to hit your daily goal',
      icon: 'nutrition',
      color: colors.nutrition,
      progress: 0.67,
      pillar: 'nutrition',
    });

    feed.push({
      id: 'learning',
      type: 'learning',
      title: 'Continue Learning',
      description: 'Finance Path: Lesson 3 - Emergency Fund waiting',
      icon: 'school',
      color: colors.primary,
      action: 'Continue',
      actionIcon: 'arrow-forward',
    });

    setFeedCards(feed);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadFeed();
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderQuickWin = (item: QuickWin) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.quickWinCard, { borderColor: item.color }]}
      onPress={() => navigation.navigate(item.action)}
      activeOpacity={0.8}
    >
      <Text style={styles.quickWinIcon}>{item.icon}</Text>
      <Text style={styles.quickWinTitle}>{item.title}</Text>
      <Text style={styles.quickWinTime}>{item.time}</Text>
    </TouchableOpacity>
  );

  const renderFeedCard = ({ item }: { item: FeedCard }) => {
    if (item.type === 'progress') {
      return (
        <TouchableOpacity
          style={styles.feedCard}
          onPress={() => {
            if (item.pillar === 'finance') navigation.navigate('FinancePathNew');
            else if (item.pillar === 'mental') navigation.navigate('MentalHealthPath');
            else if (item.pillar === 'physical') navigation.navigate('PhysicalHealthPath');
            else if (item.pillar === 'nutrition') navigation.navigate('NutritionPath');
          }}
          activeOpacity={0.9}
        >
          <View style={styles.feedCardHeader}>
            <View style={[styles.feedCardIconContainer, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <View style={styles.feedCardHeaderText}>
              <Text style={styles.feedCardTitle}>{item.title}</Text>
              <Text style={styles.feedCardDescription}>{item.description}</Text>
            </View>
          </View>
          {item.progress !== undefined && (
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${item.progress * 100}%`, backgroundColor: item.color },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{Math.round(item.progress * 100)}%</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    if (item.type === 'suggestion') {
      return (
        <TouchableOpacity style={styles.feedCard} activeOpacity={0.9}>
          <LinearGradient
            colors={[item.color + '20', item.color + '05']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.suggestionGradient}
          >
            <View style={styles.suggestionContent}>
              <View>
                <Text style={styles.suggestionTitle}>{item.title}</Text>
                <Text style={styles.suggestionDescription}>{item.description}</Text>
              </View>
              {item.action && (
                <TouchableOpacity
                  style={[styles.suggestionButton, { backgroundColor: item.color }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.suggestionButtonText}>{item.action}</Text>
                  {item.actionIcon && (
                    <Ionicons name={item.actionIcon as any} size={16} color="#FFFFFF" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    if (item.type === 'achievement') {
      return (
        <TouchableOpacity style={styles.feedCard} activeOpacity={0.9}>
          <LinearGradient
            colors={['#FF9500', '#FF6B00']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.achievementGradient}
          >
            <Text style={styles.achievementTitle}>{item.title}</Text>
            <Text style={styles.achievementDescription}>{item.description}</Text>
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    if (item.type === 'learning') {
      return (
        <TouchableOpacity
          style={styles.feedCard}
          onPress={() => navigation.navigate('FinancePathNew')}
          activeOpacity={0.9}
        >
          <View style={styles.feedCardHeader}>
            <View style={[styles.feedCardIconContainer, { backgroundColor: item.color + '20' }]}>
              <Ionicons name={item.icon as any} size={24} color={item.color} />
            </View>
            <View style={styles.feedCardHeaderText}>
              <Text style={styles.feedCardTitle}>{item.title}</Text>
              <Text style={styles.feedCardDescription}>{item.description}</Text>
            </View>
            {item.actionIcon && (
              <Ionicons name={item.actionIcon as any} size={24} color={colors.textLight} />
            )}
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {new Date().getHours() < 12 ? 'Good Morning' :
             new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening'}
          </Text>
          <Text style={styles.userName}>{user?.email?.split('@')[0] || 'User'}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.streakBadge}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>{progress?.currentStreak || 0}</Text>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv {Math.floor((progress?.totalXP || 0) / 100) + 1}</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={feedCards}
        renderItem={renderFeedCard}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <>
            {/* Quick Wins Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ Quick Wins</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickWinsContainer}
              >
                {quickWins.map(renderQuickWin)}
              </ScrollView>
            </View>

            {/* Activity Feed Title */}
            <Text style={styles.feedTitle}>📱 Your Activity Feed</Text>
          </>
        }
        contentContainerStyle={styles.feedContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {/* Quick add menu */}}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
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
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF950020',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.streak,
  },
  levelBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
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
    width: 120,
    height: 120,
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
    fontSize: 32,
    marginBottom: 8,
  },
  quickWinTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  quickWinTime: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  feedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 20,
    marginTop: 24,
    marginBottom: 12,
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
  feedCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  feedCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  feedCardHeaderText: {
    flex: 1,
  },
  feedCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  feedCardDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    minWidth: 45,
    textAlign: 'right',
  },
  suggestionGradient: {
    padding: 16,
  },
  suggestionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    maxWidth: '70%',
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
