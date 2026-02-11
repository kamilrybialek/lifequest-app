/**
 * LifeQuest 3.0 - HOME SCREEN (Web/PWA)
 *
 * Streak-centric design with AI Coach insights
 * Core addiction loop: Streak → Tasks → Reward → Repeat
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useAppStore } from '../../store/appStore';
import { useSeasonStore } from '../../store/seasonStore';
import { lq3, lq3Gradients, lq3Type, lq3Space, lq3Radius, lq3Shadow, PILLAR_CONFIG, XP_REWARDS } from '../../theme/lifequest3';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ========================
// STREAK HERO COMPONENT
// ========================
const StreakHero = ({ streak, level, xp }: { streak: number; level: number; xp: number }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Pulse animation for streak
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 0.6, duration: 2000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const xpForNextLevel = 100;
  const xpInCurrentLevel = xp % xpForNextLevel;
  const xpProgress = xpInCurrentLevel / xpForNextLevel;

  return (
    <View style={styles.streakHeroContainer}>
      {/* Streak glow background */}
      <Animated.View style={[styles.streakGlow, { opacity: glowAnim }]} />

      {/* Fire icon */}
      <Text style={styles.streakFireIcon}>{streak > 0 ? '🔥' : '❄️'}</Text>

      {/* Streak number */}
      <Animated.Text
        style={[
          styles.streakNumber,
          { transform: [{ scale: pulseAnim }] },
          streak === 0 && { color: lq3.textTertiary },
        ]}
      >
        {streak}
      </Animated.Text>

      <Text style={styles.streakLabel}>
        {streak === 0 ? 'Start your streak today!' : streak === 1 ? 'day streak' : 'days strong'}
      </Text>

      {/* Level & XP bar */}
      <View style={styles.levelContainer}>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lvl {level}</Text>
        </View>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBarFill, { width: `${xpProgress * 100}%` }]} />
        </View>
        <Text style={styles.xpText}>{xpInCurrentLevel}/{xpForNextLevel} XP</Text>
      </View>
    </View>
  );
};

// ========================
// COACH INSIGHT CARD
// ========================
const CoachInsightCard = ({ insight, onAction }: {
  insight: { message: string; type: string; actionLabel?: string; actionScreen?: string };
  onAction?: (screen: string) => void;
}) => {
  const typeConfig: Record<string, { icon: string; borderColor: string }> = {
    tip: { icon: '💡', borderColor: lq3.finance },
    alert: { icon: '⚠️', borderColor: lq3.streakOrange },
    praise: { icon: '🎉', borderColor: lq3.accent },
    prediction: { icon: '🔮', borderColor: lq3.xp },
  };

  const config = typeConfig[insight.type] || typeConfig.tip;

  return (
    <View style={[styles.coachCard, { borderLeftColor: config.borderColor }]}>
      <View style={styles.coachHeader}>
        <Text style={styles.coachIcon}>{config.icon}</Text>
        <Text style={styles.coachLabel}>AI COACH</Text>
      </View>
      <Text style={styles.coachMessage}>{insight.message}</Text>
      {insight.actionLabel && insight.actionScreen && (
        <TouchableOpacity
          style={[styles.coachAction, { backgroundColor: config.borderColor + '20' }]}
          onPress={() => onAction?.(insight.actionScreen!)}
        >
          <Text style={[styles.coachActionText, { color: config.borderColor }]}>
            {insight.actionLabel} →
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ========================
// DAILY PROGRESS RING
// ========================
const DailyProgressRing = ({ completed, total }: { completed: number; total: number }) => {
  const progress = total > 0 ? completed / total : 0;
  const dots = Array.from({ length: total }, (_, i) => i < completed);

  return (
    <View style={styles.progressRingContainer}>
      <View style={styles.progressDots}>
        {dots.map((filled, i) => (
          <View
            key={i}
            style={[
              styles.progressDot,
              filled ? styles.progressDotFilled : styles.progressDotEmpty,
            ]}
          />
        ))}
      </View>
      <Text style={styles.progressLabel}>
        {completed === total && total > 0
          ? '✨ All done!'
          : `${completed} of ${total} completed`}
      </Text>
    </View>
  );
};

// ========================
// TASK CARD (swipe-to-complete)
// ========================
const TaskCard = ({
  task,
  onComplete,
  onNavigate,
}: {
  task: any;
  onComplete: () => void;
  onNavigate: () => void;
}) => {
  const pillar = PILLAR_CONFIG[task.pillar as keyof typeof PILLAR_CONFIG];
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleComplete = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 0.95, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 0.7, duration: 100, useNativeDriver: true }),
    ]).start(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      onComplete();
    });
  };

  if (task.completed) {
    return (
      <View style={[styles.taskCard, styles.taskCardCompleted]}>
        <View style={styles.taskLeft}>
          <View style={[styles.taskCheckbox, styles.taskCheckboxDone, { borderColor: pillar?.color || lq3.accent }]}>
            <Ionicons name="checkmark" size={16} color={lq3.bg} />
          </View>
          <View style={styles.taskContent}>
            <Text style={styles.taskTitleDone}>{task.title}</Text>
            <Text style={styles.taskXpDone}>+{task.points} XP earned</Text>
          </View>
        </View>
        <Text style={styles.taskPillarEmoji}>{pillar?.emoji || '🎯'}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
      <TouchableOpacity
        style={[styles.taskCard, { borderLeftColor: pillar?.color || lq3.accent, borderLeftWidth: 3 }]}
        onPress={task.action_screen ? onNavigate : handleComplete}
        activeOpacity={0.7}
      >
        <View style={styles.taskLeft}>
          <TouchableOpacity
            style={[styles.taskCheckbox, { borderColor: pillar?.color || lq3.accent }]}
            onPress={handleComplete}
          >
            {/* Empty checkbox */}
          </TouchableOpacity>
          <View style={styles.taskContent}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <View style={styles.taskMeta}>
              <Text style={styles.taskXp}>+{task.points} XP</Text>
              {task.duration && (
                <Text style={styles.taskDuration}>{task.duration} min</Text>
              )}
            </View>
          </View>
        </View>
        <View style={styles.taskRight}>
          <Text style={styles.taskPillarEmoji}>{pillar?.emoji || '🎯'}</Text>
          <Ionicons name="chevron-forward" size={16} color={lq3.textTertiary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ========================
// PILLAR QUICK STATS
// ========================
const PillarQuickStats = ({
  streaks,
  onPress,
}: {
  streaks: { pillar: string; current: number }[];
  onPress: (pillar: string) => void;
}) => (
  <View style={styles.pillarStatsRow}>
    {streaks.map((streak) => {
      const pillar = PILLAR_CONFIG[streak.pillar as keyof typeof PILLAR_CONFIG];
      return (
        <TouchableOpacity
          key={streak.pillar}
          style={styles.pillarStatCard}
          onPress={() => onPress(streak.pillar)}
        >
          <View style={[styles.pillarStatGlow, { backgroundColor: pillar?.glow }]} />
          <Text style={styles.pillarStatEmoji}>{pillar?.emoji}</Text>
          <Text style={[styles.pillarStatStreak, { color: pillar?.color }]}>
            {streak.current}
          </Text>
          <Text style={styles.pillarStatLabel}>{pillar?.label}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ========================
// WEEKLY HEATMAP
// ========================
const WeeklyHeatmap = ({ tasks }: { tasks: any[] }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay(); // 0=Sun, 1=Mon...
  const todayIndex = today === 0 ? 6 : today - 1; // Convert to Mon=0

  return (
    <View style={styles.heatmapContainer}>
      <Text style={styles.sectionLabel}>THIS WEEK</Text>
      <View style={styles.heatmapRow}>
        {days.map((day, index) => {
          const isPast = index < todayIndex;
          const isToday = index === todayIndex;
          const isFuture = index > todayIndex;
          // Simulate some completion data
          const completed = isPast ? Math.random() > 0.3 : isToday ? tasks.filter(t => t.completed).length > 0 : false;

          return (
            <View key={day} style={styles.heatmapDay}>
              <View
                style={[
                  styles.heatmapDot,
                  completed && styles.heatmapDotComplete,
                  isToday && !completed && styles.heatmapDotToday,
                  isFuture && styles.heatmapDotFuture,
                ]}
              >
                {completed && <Ionicons name="checkmark" size={12} color={lq3.bg} />}
                {isToday && !completed && <View style={styles.heatmapDotPulse} />}
              </View>
              <Text style={[styles.heatmapLabel, isToday && styles.heatmapLabelToday]}>
                {day}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// ========================
// SEASON PROGRESS BAR
// ========================
const SeasonBar = ({ season, onPress }: { season: any; onPress: () => void }) => {
  const progress = season.currentDay / season.totalDays;

  return (
    <TouchableOpacity style={styles.seasonBar} onPress={onPress}>
      <View style={styles.seasonBarHeader}>
        <Text style={styles.seasonBarTitle}>🏆 Season: {season.name}</Text>
        <Text style={styles.seasonBarDays}>Day {season.currentDay}/{season.totalDays}</Text>
      </View>
      <View style={styles.seasonProgressBar}>
        <LinearGradient
          colors={lq3Gradients.seasonPass as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.seasonProgressFill, { width: `${progress * 100}%` }]}
        />
      </View>
    </TouchableOpacity>
  );
};

// ========================
// MAIN HOME SCREEN
// ========================
export const HomeScreen = ({ navigation }: any) => {
  const { user } = useAuthStore();
  const { progress, dailyTasks, loadAppData, completeTask } = useAppStore();
  const { currentSeason, coachInsights, loadSeasonData } = useSeasonStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadAppData(), loadSeasonData()]);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  const handlePillarPress = (pillar: string) => {
    const screens: Record<string, string> = {
      finance: 'FinancePathNew',
      mental: 'MentalHealthPath',
      physical: 'PhysicalHealthPath',
      nutrition: 'NutritionPath',
    };
    navigation.navigate(screens[pillar] || 'FinancePathNew');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const totalStreak = Math.max(...progress.streaks.map(s => s.current), 0);
  const completedTasks = dailyTasks.filter(t => t.completed).length;
  const pendingTasks = dailyTasks.filter(t => !t.completed);
  const completedTasksList = dailyTasks.filter(t => t.completed);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={lq3.accent} />
          <Text style={styles.loadingText}>Loading your quest...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={lq3.accent}
          />
        }
      >
        {/* Greeting */}
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>
            {getGreeting()}{user?.email ? ` 👋` : ''}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('ProfileNew')}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={18} color={lq3.text} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Season Bar */}
        <SeasonBar
          season={currentSeason}
          onPress={() => navigation.navigate('League')}
        />

        {/* Streak Hero */}
        <StreakHero
          streak={totalStreak}
          level={progress.level}
          xp={progress.xp}
        />

        {/* Pillar Quick Stats */}
        <PillarQuickStats
          streaks={progress.streaks}
          onPress={handlePillarPress}
        />

        {/* AI Coach Insight */}
        {coachInsights.length > 0 && (
          <CoachInsightCard
            insight={coachInsights[0]}
            onAction={(screen) => navigation.navigate(screen)}
          />
        )}

        {/* Daily Tasks Section */}
        <View style={styles.tasksSection}>
          <View style={styles.tasksSectionHeader}>
            <Text style={styles.sectionTitle}>Today's Quests</Text>
            <DailyProgressRing completed={completedTasks} total={dailyTasks.length} />
          </View>

          {/* Pending Tasks */}
          {pendingTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={() => handleCompleteTask(task.id)}
              onNavigate={() => {
                if (task.action_screen) {
                  navigation.navigate(task.action_screen, task.action_params || {});
                }
              }}
            />
          ))}

          {/* Completed Tasks */}
          {completedTasksList.length > 0 && (
            <>
              <Text style={styles.completedDivider}>Completed</Text>
              {completedTasksList.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={() => {}}
                  onNavigate={() => {}}
                />
              ))}
            </>
          )}

          {dailyTasks.length === 0 && (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyTasksIcon}>🎯</Text>
              <Text style={styles.emptyTasksTitle}>No quests yet</Text>
              <Text style={styles.emptyTasksDesc}>
                Pull down to refresh or explore your paths to generate tasks
              </Text>
            </View>
          )}
        </View>

        {/* Weekly Heatmap */}
        <WeeklyHeatmap tasks={dailyTasks} />

        {/* Celebration Overlay */}
        {showCelebration && (
          <View style={styles.celebrationOverlay}>
            <Text style={styles.celebrationText}>+{XP_REWARDS.taskComplete} XP ⚡</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ========================
// STYLES
// ========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lq3.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: lq3Space.lg,
    paddingTop: lq3Space.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...lq3Type.body,
    color: lq3.textSecondary,
    marginTop: lq3Space.md,
  },

  // Greeting
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lq3Space.lg,
  },
  greeting: {
    ...lq3Type.h2,
    color: lq3.text,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: lq3.bgCard,
    borderWidth: 1.5,
    borderColor: lq3.border,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Season Bar
  seasonBar: {
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.md,
    padding: lq3Space.md,
    marginBottom: lq3Space.xl,
    borderWidth: 1,
    borderColor: lq3.border,
  },
  seasonBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lq3Space.sm,
  },
  seasonBarTitle: {
    ...lq3Type.smallBold,
    color: lq3.gold,
  },
  seasonBarDays: {
    ...lq3Type.tiny,
    color: lq3.textSecondary,
  },
  seasonProgressBar: {
    height: 6,
    backgroundColor: lq3.bgElevated,
    borderRadius: 3,
    overflow: 'hidden',
  },
  seasonProgressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Streak Hero
  streakHeroContainer: {
    alignItems: 'center',
    paddingVertical: lq3Space['3xl'],
    position: 'relative',
  },
  streakGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: lq3.streakOrange,
    top: 10,
  },
  streakFireIcon: {
    fontSize: 40,
    marginBottom: lq3Space.xs,
  },
  streakNumber: {
    fontSize: 80,
    fontWeight: '800',
    color: lq3.text,
    lineHeight: 88,
  },
  streakLabel: {
    ...lq3Type.body,
    color: lq3.textSecondary,
    marginTop: lq3Space.xs,
  },

  // Level / XP
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: lq3Space.xl,
    gap: lq3Space.sm,
  },
  levelBadge: {
    backgroundColor: lq3.xp + '20',
    paddingHorizontal: lq3Space.md,
    paddingVertical: lq3Space.xs,
    borderRadius: lq3Radius.full,
    borderWidth: 1,
    borderColor: lq3.xp + '40',
  },
  levelText: {
    ...lq3Type.smallBold,
    color: lq3.xp,
  },
  xpBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: lq3.bgElevated,
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: lq3.xp,
    borderRadius: 4,
  },
  xpText: {
    ...lq3Type.tiny,
    color: lq3.xp,
    minWidth: 60,
    textAlign: 'right',
  },

  // Pillar Stats
  pillarStatsRow: {
    flexDirection: 'row',
    gap: lq3Space.sm,
    marginBottom: lq3Space.xl,
  },
  pillarStatCard: {
    flex: 1,
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.md,
    padding: lq3Space.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: lq3.border,
    position: 'relative',
    overflow: 'hidden',
  },
  pillarStatGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  pillarStatEmoji: {
    fontSize: 20,
    marginBottom: lq3Space.xs,
  },
  pillarStatStreak: {
    fontSize: 22,
    fontWeight: '700',
  },
  pillarStatLabel: {
    ...lq3Type.tiny,
    color: lq3.textSecondary,
    marginTop: 2,
  },

  // Coach Card
  coachCard: {
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.lg,
    padding: lq3Space.lg,
    marginBottom: lq3Space.xl,
    borderWidth: 1,
    borderColor: lq3.border,
    borderLeftWidth: 4,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lq3Space.sm,
    marginBottom: lq3Space.sm,
  },
  coachIcon: {
    fontSize: 16,
  },
  coachLabel: {
    ...lq3Type.label,
    color: lq3.textTertiary,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  coachMessage: {
    ...lq3Type.body,
    color: lq3.textSecondary,
    lineHeight: 22,
  },
  coachAction: {
    alignSelf: 'flex-start',
    paddingHorizontal: lq3Space.md,
    paddingVertical: lq3Space.sm,
    borderRadius: lq3Radius.sm,
    marginTop: lq3Space.md,
  },
  coachActionText: {
    ...lq3Type.smallBold,
  },

  // Tasks Section
  tasksSection: {
    marginBottom: lq3Space.xl,
  },
  tasksSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: lq3Space.lg,
  },
  sectionTitle: {
    ...lq3Type.h3,
    color: lq3.text,
  },
  sectionLabel: {
    ...lq3Type.label,
    marginBottom: lq3Space.md,
  },

  // Progress Ring
  progressRingContainer: {
    alignItems: 'flex-end',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressDotFilled: {
    backgroundColor: lq3.accent,
  },
  progressDotEmpty: {
    backgroundColor: lq3.bgElevated,
    borderWidth: 1,
    borderColor: lq3.border,
  },
  progressLabel: {
    ...lq3Type.tiny,
    color: lq3.textSecondary,
  },

  // Task Card
  taskCard: {
    backgroundColor: lq3.bgCard,
    borderRadius: lq3Radius.md,
    padding: lq3Space.lg,
    marginBottom: lq3Space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: lq3.border,
  },
  taskCardCompleted: {
    opacity: 0.6,
    borderLeftWidth: 0,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: lq3Space.md,
  },
  taskCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCheckboxDone: {
    backgroundColor: lq3.accent,
    borderColor: lq3.accent,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    ...lq3Type.bodyBold,
    color: lq3.text,
  },
  taskTitleDone: {
    ...lq3Type.body,
    color: lq3.textTertiary,
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    gap: lq3Space.md,
    marginTop: 4,
  },
  taskXp: {
    ...lq3Type.xpBadge,
    color: lq3.xp,
  },
  taskXpDone: {
    ...lq3Type.tiny,
    color: lq3.textTertiary,
  },
  taskDuration: {
    ...lq3Type.tiny,
    color: lq3.textTertiary,
  },
  taskRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: lq3Space.sm,
  },
  taskPillarEmoji: {
    fontSize: 18,
  },

  // Completed Divider
  completedDivider: {
    ...lq3Type.label,
    color: lq3.textTertiary,
    marginVertical: lq3Space.md,
    paddingLeft: lq3Space.xs,
  },

  // Empty Tasks
  emptyTasks: {
    alignItems: 'center',
    paddingVertical: lq3Space['4xl'],
  },
  emptyTasksIcon: {
    fontSize: 48,
    marginBottom: lq3Space.md,
  },
  emptyTasksTitle: {
    ...lq3Type.h3,
    color: lq3.textSecondary,
    marginBottom: lq3Space.sm,
  },
  emptyTasksDesc: {
    ...lq3Type.small,
    color: lq3.textTertiary,
    textAlign: 'center',
    maxWidth: 260,
  },

  // Weekly Heatmap
  heatmapContainer: {
    marginBottom: lq3Space.xl,
  },
  heatmapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: lq3Space.sm,
  },
  heatmapDay: {
    flex: 1,
    alignItems: 'center',
  },
  heatmapDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: lq3.bgCard,
    borderWidth: 1,
    borderColor: lq3.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  heatmapDotComplete: {
    backgroundColor: lq3.accent,
    borderColor: lq3.accent,
  },
  heatmapDotToday: {
    borderColor: lq3.streakOrange,
    borderWidth: 2,
  },
  heatmapDotFuture: {
    opacity: 0.3,
  },
  heatmapDotPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: lq3.streakOrange,
  },
  heatmapLabel: {
    ...lq3Type.tiny,
    color: lq3.textTertiary,
    fontSize: 10,
  },
  heatmapLabelToday: {
    color: lq3.streakOrange,
    fontWeight: '700',
  },

  // Celebration
  celebrationOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  celebrationText: {
    fontSize: 28,
    fontWeight: '800',
    color: lq3.xp,
    textShadowColor: lq3.xp,
    textShadowRadius: 20,
  },
});

export default HomeScreen;
