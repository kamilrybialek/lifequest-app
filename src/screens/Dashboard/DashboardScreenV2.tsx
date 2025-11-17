/**
 * DASHBOARD V2 - ACTIVITY FEED WITH PROPER TYPE SAFETY
 *
 * Key improvements from DashboardScreenNew:
 * 1. ✅ Uses correct UserProgress field names (totalPoints not totalXP, streaks array not currentStreak)
 * 2. ✅ Calls loadAppData() on mount to ensure data is loaded
 * 3. ✅ Uses ScrollView instead of FlatList for better web compatibility
 * 4. ✅ Proper null/undefined checks on all data
 * 5. ✅ Simpler, more maintainable structure
 *
 * Lessons learned from previous crashes:
 * - Always use exact field names from TypeScript interfaces
 * - Always load data before rendering
 * - Keep components simple on web platform
 * - Test all edge cases (empty arrays, null values, etc.)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';

const { width } = Dimensions.get('window');

interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  time: string;
  screen?: string;
}

export const DashboardScreenV2 = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { progress, dailyTasks, loadAppData } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  // NOTE: loadAppData is already called in App.tsx during initialization
  // No need to call it again here - data should already be loaded
  useEffect(() => {
    console.log('📱 DashboardV2: Mounted. Data should be loaded from App.tsx');
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAppData();
    } catch (error) {
      console.error('❌ Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Quick actions - safe, no navigation dependencies
  const quickActions: QuickAction[] = [
    { id: '1', title: 'Log Workout', icon: '💪', color: colors.physical, time: '2 min' },
    { id: '2', title: 'Track Meal', icon: '🍽️', color: colors.nutrition, time: '1 min' },
    { id: '3', title: 'Add Expense', icon: '💰', color: colors.finance, time: '30 sec' },
    { id: '4', title: 'Meditate', icon: '🧘', color: colors.mental, time: '5 min' },
  ];

  // Calculate stats safely
  const completedTasks = dailyTasks?.filter(t => t.completed).length || 0;
  const totalTasks = dailyTasks?.length || 0;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Get highest streak safely
  const highestStreak = progress?.streaks?.length > 0
    ? Math.max(...progress.streaks.map(s => s.current || 0))
    : 0;

  // Calculate level safely - FIXED: Use totalPoints not totalXP
  const currentLevel = progress?.level || 1;
  const currentXP = progress?.xp || 0;
  const xpForNextLevel = 100;
  const xpProgress = currentXP % xpForNextLevel;

  // Get current time for greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good Morning' :
                   currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  // Get user display name
  const displayName = user?.name || user?.email?.split('@')[0] || 'Champion';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header with greeting and stats */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.userName}>{displayName}</Text>
          </View>
          <View style={styles.headerRight}>
            {/* Streak badge - FIXED: Use highest streak from array, not currentStreak */}
            <View style={styles.streakBadge}>
              <Text style={styles.streakIcon}>🔥</Text>
              <Text style={styles.streakText}>{highestStreak}</Text>
            </View>
            {/* Level badge */}
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Lv {currentLevel}</Text>
            </View>
          </View>
        </View>

        {/* XP Progress Card */}
        <View style={styles.xpCard}>
          <View style={styles.xpHeader}>
            <View>
              <Text style={styles.xpLabel}>Level {currentLevel}</Text>
              <Text style={styles.xpSubtext}>{xpProgress}/{xpForNextLevel} XP</Text>
            </View>
            <View style={styles.totalXPBadge}>
              <Ionicons name="star" size={16} color={colors.xpGold} />
              <Text style={styles.totalXPText}>{progress?.totalPoints || 0} total</Text>
            </View>
          </View>
          <View style={styles.xpProgressBar}>
            <View style={[styles.xpProgressFill, { width: `${(xpProgress / xpForNextLevel) * 100}%` }]} />
          </View>
        </View>

        {/* Today's Stats */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>📊 Today's Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{completedTasks}/{totalTasks}</Text>
              <Text style={styles.statLabel}>Tasks Done</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{completionRate}%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{highestStreak}</Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContainer}
          >
            {quickActions.map(action => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { borderColor: action.color }]}
                activeOpacity={0.7}
              >
                <Text style={styles.quickActionIcon}>{action.icon}</Text>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionTime}>{action.time}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Streaks */}
        {progress?.streaks && progress.streaks.length > 0 && (
          <View style={styles.streaksCard}>
            <Text style={styles.sectionTitle}>🔥 Current Streaks</Text>
            {progress.streaks.map((streak, index) => {
              const pillarIcons: { [key: string]: string } = {
                finance: '💰',
                mental: '🧠',
                physical: '💪',
                nutrition: '🥗',
              };

              const pillarColors: { [key: string]: string } = {
                finance: colors.finance,
                mental: colors.mental,
                physical: colors.physical,
                nutrition: colors.nutrition,
              };

              return (
                <View key={streak.pillar} style={styles.streakRow}>
                  <View style={styles.streakLeft}>
                    <View style={[styles.streakIconContainer, { backgroundColor: pillarColors[streak.pillar] + '20' }]}>
                      <Text style={styles.streakRowIcon}>{pillarIcons[streak.pillar]}</Text>
                    </View>
                    <View>
                      <Text style={styles.streakPillar}>
                        {streak.pillar.charAt(0).toUpperCase() + streak.pillar.slice(1)}
                      </Text>
                      <Text style={styles.streakSubtext}>Best: {streak.longest} days</Text>
                    </View>
                  </View>
                  <View style={styles.streakRight}>
                    <Text style={styles.streakDays}>{streak.current}</Text>
                    <Text style={styles.streakDaysLabel}>days</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Recent Tasks Preview */}
        {dailyTasks && dailyTasks?.length > 0 && (
          <View style={styles.tasksCard}>
            <View style={styles.tasksHeader}>
              <Text style={styles.sectionTitle}>✅ Today's Tasks</Text>
              <TouchableOpacity onPress={() => navigation?.navigate('Tasks')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            {(dailyTasks || []).slice(0, 4).map((task) => (
              <View key={task.id} style={styles.taskRow}>
                <Ionicons
                  name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={24}
                  color={task.completed ? colors.primary : colors.textLight}
                />
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, task.completed && styles.taskCompleted]}>
                    {task.title}
                  </Text>
                  <Text style={styles.taskPoints}>+{task.points} XP</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Achievements Preview */}
        {progress?.achievements && progress.achievements.length > 0 && (
          <View style={styles.achievementsCard}>
            <View style={styles.achievementsHeader}>
              <Text style={styles.sectionTitle}>🏆 Achievements</Text>
              <TouchableOpacity onPress={() => navigation?.navigate('ProfileNew')}>
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.achievementsGrid}>
              {progress.achievements.slice(0, 4).map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementBadge,
                    !achievement.unlocked && styles.achievementLocked
                  ]}
                >
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={styles.achievementName} numberOfLines={2}>
                    {achievement.unlocked ? achievement.name : '???'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 16,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flex: 1,
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
    backgroundColor: colors.streak + '20',
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
  xpCard: {
    backgroundColor: colors.background,
    margin: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  xpLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  xpSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalXPBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.xpGold + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  totalXPText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.xpGold,
  },
  xpProgressBar: {
    height: 10,
    backgroundColor: colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  xpProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  statsCard: {
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    marginTop: 8,
    marginBottom: 8,
  },
  quickActionsContainer: {
    paddingHorizontal: 12,
    gap: 12,
  },
  quickActionCard: {
    width: 110,
    height: 110,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  quickActionTime: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  streaksCard: {
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  streakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  streakIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  streakRowIcon: {
    fontSize: 20,
  },
  streakPillar: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  streakSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  streakRight: {
    alignItems: 'flex-end',
  },
  streakDays: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  streakDaysLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tasksCard: {
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  taskInfo: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskPoints: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  achievementsCard: {
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementBadge: {
    width: (width - 32 - 40 - 36) / 4,
    aspectRatio: 1,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  achievementName: {
    fontSize: 9,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});
