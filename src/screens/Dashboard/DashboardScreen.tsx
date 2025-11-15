import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { TodaysFocus } from './components/TodaysFocus';
import { PillarProgressGrid } from './components/PillarProgressGrid';
import { TasksPreview } from './components/TasksPreview';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/theme';
import { spacing } from '../../theme/spacing';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Pillar, Task } from '../../types';
import { calculateTransformationMetrics, TransformationMetrics } from '../../utils/transformationCalculator';
import { needsWeeklyCheckIn } from '../../database/transformation';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { dailyTasks, progress, completeTask, loadAppData } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [transformationMetrics, setTransformationMetrics] = useState<TransformationMetrics | null>(null);
  const [showCheckInPrompt, setShowCheckInPrompt] = useState(false);

  useEffect(() => {
    loadAppData();
    loadTransformationMetrics();
    checkForWeeklyCheckIn();
  }, []);

  const loadTransformationMetrics = async () => {
    if (!user) return;
    try {
      const metrics = await calculateTransformationMetrics(user.id);
      setTransformationMetrics(metrics);
    } catch (error) {
      console.error('Error loading transformation metrics:', error);
    }
  };

  const checkForWeeklyCheckIn = async () => {
    if (!user) return;
    const needs = await needsWeeklyCheckIn(user.id);
    setShowCheckInPrompt(needs);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppData();
    await loadTransformationMetrics();
    await checkForWeeklyCheckIn();
    setRefreshing(false);
  };

  // Get today's focus task (first incomplete task)
  const todaysFocusTask = dailyTasks.find((task: Task) => !task.completed) || null;

  // Calculate pillar progress from REAL TRANSFORMATION DATA
  const pillarProgress = transformationMetrics
    ? [
        { pillar: 'finance' as Pillar, progress: transformationMetrics.finance.score },
        { pillar: 'mental' as Pillar, progress: transformationMetrics.mental.score },
        { pillar: 'physical' as Pillar, progress: transformationMetrics.physical.score },
        { pillar: 'nutrition' as Pillar, progress: transformationMetrics.nutrition.score },
      ]
    : [
        { pillar: 'finance' as Pillar, progress: 0 },
        { pillar: 'mental' as Pillar, progress: 0 },
        { pillar: 'physical' as Pillar, progress: 0 },
        { pillar: 'nutrition' as Pillar, progress: 0 },
      ];

  // Get streaks
  const streaks = [
    { pillar: 'finance' as Pillar, count: progress.finance?.streak || 0 },
    { pillar: 'mental' as Pillar, count: progress.mental?.streak || 0 },
    { pillar: 'physical' as Pillar, count: progress.physical?.streak || 0 },
    { pillar: 'nutrition' as Pillar, count: progress.nutrition?.streak || 0 },
  ];

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
    await loadAppData();
  };

  const handlePillarPress = (pillar: Pillar) => {
    // Navigate to Journey screen with selected pillar
    navigation.navigate('Journey', { selectedPillar: pillar });
  };

  const handleTaskPress = () => {
    if (todaysFocusTask) {
      // Navigate to task detail or execute task
      const taskScreenMap: { [key: string]: string } = {
        'track-expenses': 'TrackExpenses',
        'morning-sunlight': 'MorningSunlight',
      };

      const screenName = taskScreenMap[todaysFocusTask.id];
      if (screenName) {
        navigation.navigate(screenName);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'Champion'}!</Text>
            <Text style={styles.subtitle}>Let's make today count</Text>
          </View>
          <View style={styles.levelBadge}>
            <Ionicons name="star" size={20} color={colors.xpGold} />
            <Text style={styles.levelText}>Lvl {user?.level || 1}</Text>
          </View>
        </View>

        {/* Weekly Check-in Prompt */}
        {showCheckInPrompt && (
          <TouchableOpacity
            style={styles.checkInPrompt}
            onPress={() => navigation.navigate('TransformationDashboard')}
          >
            <Ionicons name="clipboard" size={24} color="#fff" />
            <View style={styles.checkInText}>
              <Text style={styles.checkInTitle}>Weekly Check-in Due</Text>
              <Text style={styles.checkInSubtitle}>Track your transformation (2 min)</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Transformation Dashboard Card */}
        {transformationMetrics && (
          <TouchableOpacity
            style={styles.transformationCard}
            onPress={() => navigation.navigate('TransformationDashboard')}
          >
            <View style={styles.transformationHeader}>
              <Ionicons name="analytics" size={24} color={colors.primary} />
              <Text style={styles.transformationTitle}>Your Transformation</Text>
            </View>
            <View style={styles.transformationScoreContainer}>
              <Text style={styles.transformationScore}>
                {transformationMetrics.overall.transformationScore}
              </Text>
              <View style={styles.transformationDetails}>
                <Ionicons
                  name={transformationMetrics.overall.trend === 'improving' ? 'trending-up' : 'remove'}
                  size={20}
                  color={transformationMetrics.overall.trend === 'improving' ? colors.success : colors.textSecondary}
                />
                <Text style={styles.transformationTrend}>{transformationMetrics.overall.trend}</Text>
              </View>
            </View>
            <Text style={styles.transformationSubtitle}>
              Real outcomes, not just tasks • {transformationMetrics.overall.daysTracking} days tracking
            </Text>
            <View style={styles.transformationCTA}>
              <Text style={styles.transformationCTAText}>View Full Report</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>
        )}

        {/* Compact Stats */}
        <View style={styles.compactStats}>
          <View style={styles.statBox}>
            <Ionicons name="star" size={20} color={colors.warning} />
            <Text style={styles.statValue}>Lvl {user?.level || 1}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="flame" size={20} color={colors.error} />
            <Text style={styles.statValue}>{Math.max(...streaks.map(s => s.count), 0)}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="trophy" size={20} color={colors.primary} />
            <Text style={styles.statValue}>{user?.xp || 0}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </View>

        {/* Today's Focus Task */}
        <TodaysFocus
          task={todaysFocusTask}
          onComplete={handleCompleteTask}
          onPress={handleTaskPress}
        />

        {/* My Tasks Preview - Compact */}
        <TasksPreview navigation={navigation} maxTasks={2} />

        {/* Pillar Progress */}
        <PillarProgressGrid pillars={pillarProgress} onPillarPress={handlePillarPress} />

        <View style={styles.bottomSpacer} />
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
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.xs,
  },
  levelText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  compactStats: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  statValue: {
    ...typography.heading,
    fontSize: 20,
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  checkInPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  checkInText: {
    flex: 1,
  },
  checkInTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkInSubtitle: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
    marginTop: spacing.xs / 2,
  },
  transformationCard: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  transformationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  transformationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  transformationScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  transformationScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
  },
  transformationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  transformationTrend: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: colors.text,
  },
  transformationSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  transformationCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  transformationCTAText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
