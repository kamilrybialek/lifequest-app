import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Animated, Modal } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppStore } from '../store/appStore';
import { useAuthStore } from '../store/authStore';
import { Task, Pillar } from '../types';
import { colors } from '../theme/colors';
import { typography, shadows } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { getUserAchievements, getAchievementCount } from '../database/achievements';
import { getRandomActionTasks, completeRandomActionTask, RandomActionTask } from '../database/randomTasks';
import { calculateBMI, getBMICategory, getBMIColor, calculateBMR, calculateTDEE, getIdealWeightRange } from '../utils/healthCalculations';
import { getAverageSleepDuration, getWeightTrend } from '../database/health';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 32;

export const HomeScreenFlat = ({ navigation }: any) => {
  const { dailyTasks, progress, completeTask, loadAppData, physicalHealthData } = useAppStore();
  const { user } = useAuthStore();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [achievements, setAchievements] = useState<any[]>([]);
  const [achievementStats, setAchievementStats] = useState({ unlocked: 0, total: 0 });

  // Random Action Tasks
  const [randomTasks, setRandomTasks] = useState<RandomActionTask[]>([]);
  const [showTakeActionModal, setShowTakeActionModal] = useState(false);
  const [selectedActionTask, setSelectedActionTask] = useState<RandomActionTask | null>(null);

  // Health Stats
  const [avgSleep, setAvgSleep] = useState<number>(0);
  const [weightTrend, setWeightTrend] = useState<any>(null);

  useEffect(() => {
    loadAppData();
    loadAchievements();
    loadRandomTasks();
    loadHealthStats();
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

  const loadRandomTasks = async () => {
    try {
      const tasks = await getRandomActionTasks(4); // Get 4 random tasks
      setRandomTasks(tasks);
    } catch (error) {
      console.error('Error loading random tasks:', error);
    }
  };

  const loadHealthStats = async () => {
    if (!user?.id) return;
    try {
      const [sleep, trend] = await Promise.all([
        getAverageSleepDuration(user.id, 7),
        getWeightTrend(user.id, 30),
      ]);
      setAvgSleep(sleep);
      setWeightTrend(trend);
    } catch (error) {
      console.error('Error loading health stats:', error);
    }
  };

  const handleCompleteActionTask = async (task: RandomActionTask) => {
    if (!user?.id) return;
    try {
      await completeRandomActionTask(user.id, task.id);
      setShowTakeActionModal(false);
      setSelectedActionTask(null);
      loadRandomTasks(); // Refresh tasks
      loadAppData(); // Refresh progress
    } catch (error) {
      console.error('Error completing action task:', error);
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
        {/* Streak Banner - Duolingo Style - Clickable */}
        <TouchableOpacity
          style={styles.streakBanner}
          onPress={() => navigation.navigate('Streaks')}
          activeOpacity={0.8}
        >
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
        </TouchableOpacity>

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

        {/* QUICK ACTIONS - Random Tasks */}
        <View style={styles.quickActionsSection}>
          <View style={styles.quickActionsHeader}>
            <View>
              <Text style={styles.quickActionsTitle}>⚡ Quick Actions</Text>
              <Text style={styles.quickActionsSubtitle}>
                Instant tasks to improve your life
              </Text>
            </View>
            <TouchableOpacity onPress={loadRandomTasks} style={styles.refreshButton}>
              <Ionicons name="refresh" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.randomTasksGrid}>
            {randomTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.randomTaskCard}
                onPress={() => {
                  setSelectedActionTask(task);
                  setShowTakeActionModal(true);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.randomTaskHeader}>
                  <Text style={styles.randomTaskIcon}>{task.icon}</Text>
                  <View style={[
                    styles.randomTaskDifficultyBadge,
                    { backgroundColor: task.difficulty === 'easy' ? '#4CAF50' : task.difficulty === 'medium' ? '#FF9800' : '#F44336' }
                  ]}>
                    <Text style={styles.randomTaskDifficultyText}>
                      {task.difficulty === 'easy' ? 'Easy' : task.difficulty === 'medium' ? 'Med' : 'Hard'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.randomTaskTitle} numberOfLines={2}>
                  {task.title}
                </Text>
                <View style={styles.randomTaskFooter}>
                  <Text style={styles.randomTaskMeta}>⏱️ {task.duration_minutes}m</Text>
                  <Text style={styles.randomTaskXP}>+{task.xp_reward} XP</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.takeActionButton}
            onPress={async () => {
              // Always generate a new random task
              const newTasks = await getRandomActionTasks(1);
              if (newTasks.length > 0) {
                setSelectedActionTask(newTasks[0]);
                setShowTakeActionModal(true);
              }
            }}
          >
            <Ionicons name="flash" size={24} color="#FFFFFF" />
            <Text style={styles.takeActionButtonText}>TAKE ACTION NOW</Text>
            <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Daily Quest - Main Task */}
        {dailyQuest && (
          <TouchableOpacity
            style={styles.dailyQuestCard}
            activeOpacity={0.9}
            onPress={() => {
              // Navigate to the appropriate pillar screen
              const screenMap = {
                finance: 'Finance',
                mental: 'Mental',
                physical: 'Physical',
                nutrition: 'Nutrition',
              };
              const screen = screenMap[dailyQuest.pillar as keyof typeof screenMap] || 'Finance';
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

        {/* Health Stats Card */}
        {physicalHealthData?.weight && physicalHealthData?.height && (
          <View style={styles.healthStatsCard}>
            <View style={styles.healthStatsHeader}>
              <Text style={styles.healthStatsTitle}>📊 Health Dashboard</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Physical')}>
                <Ionicons name="arrow-forward-circle" size={24} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.healthStatsGrid}>
              {(() => {
                const bmi = calculateBMI(physicalHealthData.weight!, physicalHealthData.height!);
                const bmiCategory = getBMICategory(bmi);
                const bmiColor = getBMIColor(bmi);
                const idealWeight = getIdealWeightRange(physicalHealthData.height!);

                // Calculate BMR and TDEE if we have age and gender
                let bmr = 0;
                let tdee = 0;
                if (user?.age && user?.gender && (user.gender === 'male' || user.gender === 'female')) {
                  bmr = calculateBMR(
                    physicalHealthData.weight!,
                    physicalHealthData.height!,
                    user.age,
                    user.gender
                  );
                  tdee = calculateTDEE(bmr, 'moderate');
                }

                return (
                  <>
                    <View style={styles.healthStatItem}>
                      <View style={[styles.healthStatBadge, { backgroundColor: bmiColor + '20' }]}>
                        <Ionicons name="fitness" size={20} color={bmiColor} />
                      </View>
                      <Text style={styles.healthStatValue}>{bmi}</Text>
                      <Text style={styles.healthStatLabel}>BMI</Text>
                      <Text style={[styles.healthStatCategory, { color: bmiColor }]}>
                        {bmiCategory}
                      </Text>
                    </View>

                    <View style={styles.healthStatItem}>
                      <View style={[styles.healthStatBadge, { backgroundColor: colors.physical + '20' }]}>
                        <Ionicons name="scale" size={20} color={colors.physical} />
                      </View>
                      <Text style={styles.healthStatValue}>
                        {weightTrend?.currentWeight?.toFixed(1) || physicalHealthData.weight}
                      </Text>
                      <Text style={styles.healthStatLabel}>Weight (kg)</Text>
                      {weightTrend && weightTrend.trend !== 'stable' && (
                        <Text style={[styles.healthStatCategory, {
                          color: weightTrend.trend === 'down' ? '#4CAF50' : '#FF9800'
                        }]}>
                          {weightTrend.trend === 'down' ? '↓' : '↑'} {Math.abs(weightTrend.change).toFixed(1)}kg
                        </Text>
                      )}
                    </View>

                    <View style={styles.healthStatItem}>
                      <View style={[styles.healthStatBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Ionicons name="body" size={20} color={colors.primary} />
                      </View>
                      <Text style={styles.healthStatValue}>{idealWeight.min}-{idealWeight.max}</Text>
                      <Text style={styles.healthStatLabel}>Ideal Weight</Text>
                      <Text style={styles.healthStatCategory}>
                        {physicalHealthData.weight! >= idealWeight.min && physicalHealthData.weight! <= idealWeight.max ? 'On target' : 'Goal range'}
                      </Text>
                    </View>

                    <View style={styles.healthStatItem}>
                      <View style={[styles.healthStatBadge, { backgroundColor: colors.mental + '20' }]}>
                        <Ionicons name="moon" size={20} color={colors.mental} />
                      </View>
                      <Text style={styles.healthStatValue}>
                        {avgSleep > 0 ? avgSleep.toFixed(1) : '--'}
                      </Text>
                      <Text style={styles.healthStatLabel}>Avg Sleep (h)</Text>
                      {avgSleep > 0 && (
                        <Text style={[styles.healthStatCategory, {
                          color: avgSleep >= 7 ? '#4CAF50' : '#FF9800'
                        }]}>
                          {avgSleep >= 7 ? 'Good' : 'Low'}
                        </Text>
                      )}
                    </View>

                    <View style={styles.healthStatItem}>
                      <View style={[styles.healthStatBadge, { backgroundColor: colors.nutrition + '20' }]}>
                        <Ionicons name="flame" size={20} color={colors.nutrition} />
                      </View>
                      <Text style={styles.healthStatValue}>{tdee > 0 ? tdee : '--'}</Text>
                      <Text style={styles.healthStatLabel}>TDEE (cal)</Text>
                      {tdee > 0 && (
                        <Text style={styles.healthStatCategory}>Daily needs</Text>
                      )}
                    </View>

                    <View style={styles.healthStatItem}>
                      <View style={[styles.healthStatBadge, { backgroundColor: '#FF6B6B' + '20' }]}>
                        <Ionicons name="heart" size={20} color="#FF6B6B" />
                      </View>
                      <Text style={styles.healthStatValue}>{bmr > 0 ? bmr : '--'}</Text>
                      <Text style={styles.healthStatLabel}>BMR (cal)</Text>
                      {bmr > 0 && (
                        <Text style={styles.healthStatCategory}>Resting</Text>
                      )}
                    </View>

                    <View style={styles.healthStatItem}>
                      <View style={[styles.healthStatBadge, { backgroundColor: '#3498DB' + '20' }]}>
                        <Ionicons name="water" size={20} color="#3498DB" />
                      </View>
                      <Text style={styles.healthStatValue}>
                        {Math.round((physicalHealthData.weight || 0) * 0.033)}
                      </Text>
                      <Text style={styles.healthStatLabel}>Water (L)</Text>
                      <Text style={styles.healthStatCategory}>Daily goal</Text>
                    </View>

                    <View style={styles.healthStatItem}>
                      <View style={[styles.healthStatBadge, { backgroundColor: colors.physical + '20' }]}>
                        <Ionicons name="footsteps" size={20} color={colors.physical} />
                      </View>
                      <Text style={styles.healthStatValue}>
                        {physicalHealthData.dailySteps || 0}
                      </Text>
                      <Text style={styles.healthStatLabel}>Steps</Text>
                      <Text style={[styles.healthStatCategory, {
                        color: (physicalHealthData.dailySteps || 0) >= 8000 ? '#4CAF50' : '#FF9800'
                      }]}>
                        {(physicalHealthData.dailySteps || 0) >= 8000 ? 'Goal met!' : `of ${physicalHealthData.stepsGoal || 8000}`}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </View>
          </View>
        )}

        {/* Apple Health / Google Fit Integration Placeholder */}
        <View style={styles.healthIntegrationCard}>
          <View style={styles.healthIntegrationHeader}>
            <View style={styles.healthIntegrationIconRow}>
              <Text style={styles.healthIntegrationIcon}>❤️</Text>
              <Text style={styles.healthIntegrationTitle}>Connect Health App</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </View>
          <Text style={styles.healthIntegrationSubtitle}>
            Sync with Apple Health or Google Fit to track steps, sleep, and workouts automatically
          </Text>
          <TouchableOpacity style={styles.healthIntegrationButton}>
            <Ionicons name="link" size={18} color="#FFFFFF" />
            <Text style={styles.healthIntegrationButtonText}>Connect Now</Text>
          </TouchableOpacity>
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

      {/* Sticky Take Action Button */}
      <View style={styles.stickyButtonContainer}>
        <TouchableOpacity
          style={styles.stickyTakeActionButton}
          onPress={async () => {
            // Always generate a new random task
            const newTasks = await getRandomActionTasks(1);
            if (newTasks.length > 0) {
              setSelectedActionTask(newTasks[0]);
              setShowTakeActionModal(true);
            }
          }}
          activeOpacity={0.9}
        >
          <Ionicons name="flash" size={28} color="#FFFFFF" />
          <Text style={styles.stickyTakeActionButtonText}>TAKE ACTION NOW</Text>
          <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Take Action Modal */}
      <Modal
        visible={showTakeActionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTakeActionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedActionTask && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalIcon}>{selectedActionTask.icon}</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowTakeActionModal(false)}
                  >
                    <Ionicons name="close" size={28} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>{selectedActionTask.title}</Text>
                <Text style={styles.modalDescription}>{selectedActionTask.description}</Text>

                <View style={styles.modalStats}>
                  <View style={styles.modalStatItem}>
                    <Ionicons name="time-outline" size={24} color={colors.primary} />
                    <Text style={styles.modalStatLabel}>{selectedActionTask.duration_minutes} min</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Ionicons name="flash" size={24} color={colors.xpGold} />
                    <Text style={styles.modalStatLabel}>+{selectedActionTask.xp_reward} XP</Text>
                  </View>
                  <View style={styles.modalStatItem}>
                    <Ionicons name="speedometer-outline" size={24} color={
                      selectedActionTask.difficulty === 'easy' ? '#4CAF50' :
                      selectedActionTask.difficulty === 'medium' ? '#FF9800' : '#F44336'
                    } />
                    <Text style={styles.modalStatLabel}>
                      {selectedActionTask.difficulty.charAt(0).toUpperCase() + selectedActionTask.difficulty.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.modalButtonSecondary}
                    onPress={() => setShowTakeActionModal(false)}
                  >
                    <Text style={styles.modalButtonSecondaryText}>Later</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.modalButtonPrimary}
                    onPress={() => handleCompleteActionTask(selectedActionTask)}
                  >
                    <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.modalButtonPrimaryText}>Complete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  streakProgressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginVertical: 8,
  },
  streakProgressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  streakCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    height: 100, // Extra space for sticky button
  },

  // Quick Actions Section
  quickActionsSection: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    ...shadows.medium,
  },
  quickActionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 2,
  },
  quickActionsSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  randomTasksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  randomTaskCard: {
    width: '48%',
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    ...shadows.small,
  },
  randomTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  randomTaskIcon: {
    fontSize: 32,
  },
  randomTaskDifficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  randomTaskDifficultyText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  randomTaskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    height: 36,
  },
  randomTaskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  randomTaskMeta: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  randomTaskXP: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.xpGold,
  },
  takeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    ...shadows.large,
  },
  takeActionButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIcon: {
    fontSize: 64,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
  },
  modalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 32,
    paddingVertical: 20,
    backgroundColor: colors.backgroundGray,
    borderRadius: 12,
  },
  modalStatItem: {
    alignItems: 'center',
    gap: 8,
  },
  modalStatLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonSecondary: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.backgroundGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  modalButtonPrimary: {
    flex: 2,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.large,
  },
  modalButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Health Stats
  healthStatsCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    ...shadows.medium,
  },
  healthStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  healthStatsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  healthStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  healthStatItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.backgroundGray,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  healthStatBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
  },
  healthStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  healthStatCategory: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },

  // Health Integration Card
  healthIntegrationCard: {
    margin: 16,
    marginTop: 0,
    padding: 20,
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary + '20',
    borderStyle: 'dashed',
    ...shadows.small,
  },
  healthIntegrationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthIntegrationIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  healthIntegrationIcon: {
    fontSize: 24,
  },
  healthIntegrationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  healthIntegrationSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  healthIntegrationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  healthIntegrationButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Sticky Take Action Button
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 24,
    backgroundColor: colors.backgroundGray,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.medium,
  },
  stickyTakeActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    ...shadows.medium,
  },
  stickyTakeActionButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
