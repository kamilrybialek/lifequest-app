import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { Task, Pillar } from '../types';
import { colors } from '../theme/colors';
import { typography, shadows } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { getUserAchievements, getAchievementCount } from '../database/achievements';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export const HomeScreenFlat = ({ navigation }: any) => {
  const { dailyTasks, progress, completeTask, loadAppData } = useAppStore();
  const { user } = useAuthStore();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [achievements, setAchievements] = useState<any[]>([]);
  const [achievementStats, setAchievementStats] = useState({ unlocked: 0, total: 0 });

  useEffect(() => {
    loadAppData();
    loadAchievements();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadAchievements = async () => {
    if (!user?.id) return;
    try {
      const [achievementsData, stats] = await Promise.all([
        getUserAchievements(user.id),
        getAchievementCount(user.id),
      ]);
      setAchievements(achievementsData);
      setAchievementStats(stats);
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

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
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const xpToNextLevel = 100;
  const currentLevelXP = progress.xp % 100;
  const xpProgress = (currentLevelXP / xpToNextLevel) * 100;

  // Calculate total streak (highest current streak)
  const totalStreak = Math.max(...progress.streaks.map(s => s.current), 0);

  // Daily Quest (first incomplete task)
  const dailyQuest = dailyTasks.find(t => !t.completed);

  // Get last 7 days progress simulation (you can implement real data)
  const weekProgress = [65, 80, 45, 90, 75, 100, progressPercentage];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            Hello, {user?.email?.split('@')[0]}! 👋
          </Text>
          <Text style={styles.subtitle}>Let's make today count</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Streak Banner - Duolingo Style */}
        <View style={styles.streakBanner}>
          <View style={styles.streakFlameContainer}>
            <Text style={styles.streakFlame}>🔥</Text>
            <View style={styles.streakBadge}>
              <Text style={styles.streakNumber}>{totalStreak}</Text>
            </View>
          </View>
          <View style={styles.streakInfo}>
            <Text style={styles.streakTitle}>Day Streak!</Text>
            <Text style={styles.streakSubtitle}>
              {totalStreak === 0
                ? 'Complete a task to start your streak!'
                : totalStreak === 1
                ? 'Keep going! 💪'
                : `Amazing! You're on fire! 🔥`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={colors.textLight} />
        </View>

        {/* XP Progress Circle */}
        <View style={styles.xpCard}>
          <View style={styles.xpLeft}>
            <View style={styles.progressRing}>
              <View style={styles.progressRingInner}>
                <Text style={styles.levelNumber}>{progress.level}</Text>
                <Text style={styles.levelLabel}>Level</Text>
              </View>
              {/* Simple progress indicator */}
              <View style={[styles.progressArc, { transform: [{ rotate: `${(xpProgress / 100) * 360}deg` }] }]} />
            </View>
          </View>
          <View style={styles.xpRight}>
            <Text style={styles.xpTitle}>Daily XP Progress</Text>
            <View style={styles.xpBarContainer}>
              <View style={[styles.xpBarFill, { width: `${xpProgress}%` }]} />
            </View>
            <Text style={styles.xpText}>{currentLevelXP}/{xpToNextLevel} XP</Text>
            <Text style={styles.xpSubtext}>
              {xpToNextLevel - currentLevelXP} XP to level {progress.level + 1}
            </Text>
          </View>
        </View>

        {/* Daily Quest - Main Task */}
        {dailyQuest && (
          <TouchableOpacity
            style={styles.dailyQuestCard}
            activeOpacity={0.9}
            onPress={() => {
              const screen = dailyQuest.pillar === 'finance' ? 'ExpenseLogger' :
                dailyQuest.pillar === 'mental' ? 'MorningSunlight' :
                  dailyQuest.pillar === 'physical' ? 'Physical' : 'Nutrition';
              navigation.navigate(screen);
            }}
          >
            <View style={styles.questBadge}>
              <Ionicons name="trophy" size={16} color="#FFC800" />
              <Text style={styles.questBadgeText}>DAILY QUEST</Text>
            </View>
            <View style={styles.questContent}>
              <Text style={styles.questIcon}>{getPillarIcon(dailyQuest.pillar)}</Text>
              <View style={styles.questInfo}>
                <Text style={styles.questTitle}>{dailyQuest.title}</Text>
                <Text style={styles.questMeta}>
                  ⏱️ {dailyQuest.duration} min • +{dailyQuest.points} XP
                </Text>
              </View>
              <View style={[styles.questButton, { backgroundColor: getPillarColor(dailyQuest.pillar) }]}>
                <Text style={styles.questButtonText}>START</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Today's Progress Overview */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
          </View>
          <View style={styles.progressBarLarge}>
            <View style={[styles.progressBarLargeFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedTasks} of {totalTasks} tasks completed
          </Text>

          {/* Mini Week Chart */}
          <View style={styles.weekChart}>
            <Text style={styles.weekChartTitle}>Last 7 Days</Text>
            <View style={styles.weekChartBars}>
              {weekProgress.map((value, index) => (
                <View key={index} style={styles.weekChartBarContainer}>
                  <View style={styles.weekChartBar}>
                    <View style={[styles.weekChartBarFill, { height: `${value}%` }]} />
                  </View>
                  <Text style={styles.weekChartLabel}>
                    {index === 6 ? 'T' : ['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Task Cards */}
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Today's Tasks</Text>
          {dailyTasks.map((task) => {
            const taskColor = getPillarColor(task.pillar);
            const taskIcon = getPillarIcon(task.pillar);

            return (
              <TouchableOpacity
                key={task.id}
                onPress={task.completed ? undefined : () => {
                  const screen = task.pillar === 'finance' ? 'ExpenseLogger' :
                    task.pillar === 'mental' ? 'MorningSunlight' :
                      task.pillar === 'physical' ? 'Physical' : 'Nutrition';
                  navigation.navigate(screen);
                }}
                activeOpacity={task.completed ? 1 : 0.8}
                disabled={task.completed}
              >
                <View style={[
                  styles.taskCard,
                  task.completed && styles.taskCardCompleted,
                ]}>
                  {/* Colored left border */}
                  <View style={[styles.taskBorder, { backgroundColor: taskColor }]} />

                  <View style={styles.taskContent}>
                    <View style={[styles.taskIconCircle, { backgroundColor: taskColor + '20' }]}>
                      <Text style={styles.taskIcon}>{taskIcon}</Text>
                    </View>
                    <View style={styles.taskInfo}>
                      <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                        {task.title}
                      </Text>
                      <Text style={styles.taskMeta}>
                        ⏱️ {task.duration} min • +{task.points} XP
                      </Text>
                    </View>

                    {!task.completed ? (
                      <View style={[styles.taskButton, { backgroundColor: taskColor }]}>
                        <Ionicons name="play" size={16} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View style={styles.completedBadge}>
                        <Ionicons name="checkmark" size={20} color={colors.success} />
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Pillar Streaks Grid */}
        <View style={styles.streaksSection}>
          <Text style={styles.sectionTitle}>Your Streaks</Text>
          <View style={styles.streaksGrid}>
            {progress.streaks.map((streak) => (
              <TouchableOpacity
                key={streak.pillar}
                style={styles.streakCard}
                onPress={() => navigation.navigate(streak.pillar.charAt(0).toUpperCase() + streak.pillar.slice(1))}
              >
                <View style={[styles.streakCardIcon, { backgroundColor: getPillarColor(streak.pillar) }]}>
                  <Text style={styles.streakCardEmoji}>{getPillarIcon(streak.pillar)}</Text>
                </View>
                <View style={styles.streakCardContent}>
                  <Text style={styles.streakCardNumber}>{streak.current}</Text>
                  <Text style={styles.streakCardLabel}>day{streak.current !== 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.streakCardFooter}>
                  <Text style={styles.streakCardBest}>Best: {streak.longest}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsSection}>
          <View style={[styles.statCard, { backgroundColor: colors.xpGold + '15' }]}>
            <Ionicons name="flash" size={24} color={colors.xpGold} />
            <Text style={styles.statValue}>{progress.totalPoints}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.streak + '15' }]}>
            <Ionicons name="flame" size={24} color={colors.streak} />
            <Text style={styles.statValue}>
              {Math.max(...progress.streaks.map(s => s.longest))}
            </Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>

        {/* Achievements Preview */}
        <View style={styles.achievementsSection}>
          <View style={styles.achievementsHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
              <Text style={styles.viewAllText}>
                {achievementStats.unlocked}/{achievementStats.total} →
              </Text>
            </TouchableOpacity>
          </View>
          {achievements.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
              {achievements.slice(0, 5).map((achievement) => (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementCard,
                  !achievement.unlocked && styles.achievementCardLocked,
                ]}
              >
                <View style={[styles.achievementBadge, { backgroundColor: achievement.badge_color + '20' }]}>
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                </View>
                <Text style={styles.achievementName}>{achievement.title}</Text>
              </View>
            ))}
          </ScrollView>
          ) : (
            <TouchableOpacity
              style={styles.emptyAchievements}
              onPress={() => navigation.navigate('Achievements')}
            >
              <Text style={styles.emptyAchievementsText}>
                🏆 Unlock your first achievement!
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
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
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
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

  // Streak Banner
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    ...shadows.medium,
  },
  streakFlameContainer: {
    position: 'relative',
    marginRight: 16,
  },
  streakFlame: {
    fontSize: 48,
  },
  streakBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: colors.streak,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  streakNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // XP Card
  xpCard: {
    flexDirection: 'row',
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    ...shadows.medium,
  },
  xpLeft: {
    marginRight: 20,
  },
  progressRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: colors.xpGold,
  },
  progressRingInner: {
    alignItems: 'center',
  },
  progressArc: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  levelNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  levelLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  xpRight: {
    flex: 1,
    justifyContent: 'center',
  },
  xpTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  xpBarContainer: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.xpGold,
    borderRadius: 6,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  xpSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Daily Quest
  dailyQuestCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.xpGold,
    ...shadows.large,
  },
  questBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.xpGold + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  questBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.xpGold,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  questContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  questIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  questInfo: {
    flex: 1,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  questMeta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  questButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  questButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Progress Card
  progressCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    ...shadows.medium,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  progressBarLarge: {
    height: 16,
    backgroundColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarLargeFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },

  // Week Chart
  weekChart: {
    marginTop: 12,
  },
  weekChartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  weekChartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 60,
  },
  weekChartBarContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  weekChartBar: {
    width: '100%',
    height: 40,
    backgroundColor: colors.backgroundGray,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  weekChartBarFill: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  weekChartLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },

  // Tasks Section
  tasksSection: {
    padding: 16,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    ...shadows.medium,
  },
  taskCardCompleted: {
    opacity: 0.6,
  },
  taskBorder: {
    height: 6,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  taskIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskIcon: {
    fontSize: 24,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
  taskMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  taskButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Streaks Section
  streaksSection: {
    padding: 16,
    paddingTop: 8,
  },
  streaksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  streakCard: {
    width: (width - 44) / 2,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 16,
    ...shadows.small,
  },
  streakCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  streakCardEmoji: {
    fontSize: 24,
  },
  streakCardContent: {
    marginBottom: 8,
  },
  streakCardNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  streakCardLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  streakCardFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  streakCardBest: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 0,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },

  // Achievements Section
  achievementsSection: {
    padding: 16,
    paddingTop: 8,
  },
  achievementsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  achievementsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  achievementCard: {
    width: 100,
    height: 120,
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.small,
  },
  achievementBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementCardLocked: {
    opacity: 0.4,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  emptyAchievements: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    ...shadows.small,
  },
  emptyAchievementsText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  bottomSpacer: {
    height: 20,
  },
});
