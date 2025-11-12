import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { colors } from '../theme/colors';
import { shadows } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { getUserAchievements } from '../database/achievements';
import { getTasksForToday } from '../database/tasks';

export const HomeScreenSimple = ({ navigation }: any) => {
  const { progress, loadAppData } = useAppStore();
  const { user } = useAuthStore();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [achievements, setAchievements] = useState<any[]>([]);
  const [todaysTasks, setTodaysTasks] = useState<any[]>([]);

  // Calculate totals
  const totalStreak = Math.max(...progress.streaks.map(s => s.current), 0);
  const currentLevelXP = progress.totalPoints % 100;
  const xpToNextLevel = 100;
  const xpProgress = (currentLevelXP / xpToNextLevel) * 100;

  useEffect(() => {
    loadAppData();
    loadAchievements();
    loadTodaysTasks();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadAchievements = async () => {
    if (!user?.id) return;
    try {
      const achievementsData = await getUserAchievements(user.id);
      setAchievements(achievementsData.slice(0, 3)); // Only first 3
    } catch (error) {
      console.error('Error loading achievements:', error);
    }
  };

  const loadTodaysTasks = async () => {
    if (!user?.id) return;
    try {
      const tasks = await getTasksForToday(user.id);
      setTodaysTasks(tasks.slice(0, 3)); // Only first 3
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const tasksCompleted = todaysTasks.filter(t => t.completed).length;
  const tasksTotal = todaysTasks.length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.backgroundGray }}>
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
          {/* Streak & Level Card - Combined */}
          <View style={styles.mainCard}>
            <View style={styles.streakSection}>
              <View style={styles.streakFlameContainer}>
                <Text style={styles.streakFlame}>🔥</Text>
                <View style={styles.streakBadge}>
                  <Text style={styles.streakNumber}>{totalStreak}</Text>
                </View>
              </View>
              <View style={styles.streakInfo}>
                <Text style={styles.streakTitle}>{totalStreak} Day Streak!</Text>
                <Text style={styles.streakSubtitle}>
                  {totalStreak === 0 ? 'Complete a task to start!' : 'Keep going! 💪'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.levelSection}>
              <View style={styles.progressRing}>
                <View style={styles.progressRingInner}>
                  <Text style={styles.levelNumber}>{progress.level}</Text>
                  <Text style={styles.levelLabel}>Level</Text>
                </View>
              </View>
              <View style={styles.xpInfo}>
                <Text style={styles.xpTitle}>XP Progress</Text>
                <View style={styles.xpBarContainer}>
                  <View style={[styles.xpBarFill, { width: `${xpProgress}%` }]} />
                </View>
                <Text style={styles.xpText}>
                  {currentLevelXP}/{xpToNextLevel} XP
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.xpGold + '15' }]}>
              <Ionicons name="flash" size={28} color={colors.xpGold} />
              <Text style={styles.statValue}>{progress.totalPoints}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
              <Text style={styles.statValue}>{tasksCompleted}/{tasksTotal}</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.streak + '15' }]}>
              <Ionicons name="flame" size={28} color={colors.streak} />
              <Text style={styles.statValue}>
                {Math.max(...progress.streaks.map(s => s.longest))}
              </Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.mental + '15' }]}>
              <Ionicons name="trophy" size={28} color={colors.mental} />
              <Text style={styles.statValue}>
                {achievements.filter(a => a.unlocked).length}
              </Text>
              <Text style={styles.statLabel}>Achievements</Text>
            </View>
          </View>

          {/* Today's Tasks Preview */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Tasks</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
                <Text style={styles.sectionLink}>View All →</Text>
              </TouchableOpacity>
            </View>

            {todaysTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>✨</Text>
                <Text style={styles.emptyTitle}>No tasks for today</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => navigation.navigate('CreateTask')}
                >
                  <Text style={styles.addButtonText}>+ Add Task</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {todaysTasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={styles.taskCard}
                    onPress={() => navigation.navigate('TaskDetail', { taskId: task.id })}
                  >
                    <Ionicons
                      name={task.completed ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={task.completed ? colors.primary : colors.textLight}
                    />
                    <View style={styles.taskContent}>
                      <Text style={[styles.taskTitle, task.completed && styles.taskTitleCompleted]}>
                        {task.title}
                      </Text>
                      {task.xp_reward && (
                        <Text style={styles.taskMeta}>+{task.xp_reward} XP</Text>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>

          {/* Achievements Preview */}
          {achievements.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Achievements</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
                  <Text style={styles.sectionLink}>View All →</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
                {achievements.map((achievement) => (
                  <View
                    key={achievement.id}
                    style={[
                      styles.achievementCard,
                      !achievement.unlocked && styles.achievementCardLocked,
                    ]}
                  >
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <Text style={styles.achievementTitle} numberOfLines={2}>
                      {achievement.title}
                    </Text>
                    {achievement.unlocked && (
                      <View style={styles.achievementBadge}>
                        <Ionicons name="checkmark" size={12} color="#FFF" />
                      </View>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </Animated.View>

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>
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
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
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
    fontSize: 20,
    fontWeight: '700',
    color: colors.background,
  },

  // Main Card (Streak + Level)
  mainCard: {
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    ...shadows.medium,
  },
  streakSection: {
    flexDirection: 'row',
    alignItems: 'center',
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 28,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.background,
  },
  streakInfo: {
    flex: 1,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  streakSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  levelSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  progressRingInner: {
    alignItems: 'center',
  },
  levelNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  levelLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  xpInfo: {
    flex: 1,
  },
  xpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  xpBarContainer: {
    height: 8,
    backgroundColor: colors.backgroundGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  xpText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...shadows.small,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },

  // Section
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Tasks
  emptyState: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    ...shadows.small,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.background,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    ...shadows.small,
  },
  taskContent: {
    flex: 1,
    marginLeft: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskMeta: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },

  // Achievements
  achievementsScroll: {
    marginTop: 12,
  },
  achievementCard: {
    width: 100,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    position: 'relative',
    ...shadows.small,
  },
  achievementCardLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  achievementBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
