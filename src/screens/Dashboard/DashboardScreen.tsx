import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, SafeAreaView } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { TodaysFocus } from './components/TodaysFocus';
import { PillarProgressGrid } from './components/PillarProgressGrid';
import { StreakCards } from './components/StreakCards';
import { QuickActionsGrid } from './components/QuickActionsGrid';
import { Card } from '../../components/ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/theme';
import { spacing } from '../../theme/spacing';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import { Pillar, Task } from '../../types';

interface DashboardScreenProps {
  navigation: any;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { dailyTasks, progress, completeTask, loadAppData } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAppData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppData();
    setRefreshing(false);
  };

  // Get today's focus task (first incomplete task)
  const todaysFocusTask = dailyTasks.find((task: Task) => !task.completed) || null;

  // Calculate pillar progress
  const pillarProgress = [
    { pillar: 'finance' as Pillar, progress: progress.finance?.currentBabyStep ? (progress.finance.currentBabyStep / 7) * 100 : 0 },
    { pillar: 'mental' as Pillar, progress: 45 }, // Mock data - replace with real progress
    { pillar: 'physical' as Pillar, progress: 60 },
    { pillar: 'nutrition' as Pillar, progress: 30 },
  ];

  // Get streaks
  const streaks = [
    { pillar: 'finance' as Pillar, count: progress.finance?.streak || 0 },
    { pillar: 'mental' as Pillar, count: progress.mental?.streak || 0 },
    { pillar: 'physical' as Pillar, count: progress.physical?.streak || 0 },
    { pillar: 'nutrition' as Pillar, count: progress.nutrition?.streak || 0 },
  ];

  // Quick actions
  const quickActions = [
    {
      id: 'log-expense',
      title: 'Log Expense',
      icon: 'cash-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.finance,
      onPress: () => navigation.navigate('ExpenseLogger'),
    },
    {
      id: 'meditation',
      title: 'Meditate',
      icon: 'flower-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.mental,
      onPress: () => navigation.navigate('MeditationTimer'),
    },
    {
      id: 'log-workout',
      title: 'Log Workout',
      icon: 'barbell-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.physical,
      onPress: () => navigation.navigate('ExerciseLogger'),
    },
    {
      id: 'log-meal',
      title: 'Log Meal',
      icon: 'restaurant-outline' as keyof typeof Ionicons.glyphMap,
      color: colors.nutrition,
      onPress: () => navigation.navigate('MealLogger'),
    },
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

        {/* Today's Focus Task */}
        <TodaysFocus
          task={todaysFocusTask}
          onComplete={handleCompleteTask}
          onPress={handleTaskPress}
        />

        {/* Streaks */}
        <StreakCards streaks={streaks} />

        {/* Pillar Progress */}
        <PillarProgressGrid pillars={pillarProgress} onPillarPress={handlePillarPress} />

        {/* Quick Actions */}
        <QuickActionsGrid actions={quickActions} />

        {/* Stats Summary */}
        <Card variant="elevated" style={styles.statsCard}>
          <Text style={styles.statsTitle}>Today's Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.statValue}>
                {dailyTasks.filter((t: Task) => t.completed).length}/{dailyTasks.length}
              </Text>
              <Text style={styles.statLabel}>Tasks</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flash" size={24} color={colors.xpGold} />
              <Text style={styles.statValue}>{user?.xp || 0}</Text>
              <Text style={styles.statLabel}>Total XP</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flame" size={24} color={colors.error} />
              <Text style={styles.statValue}>
                {Math.max(...streaks.map(s => s.count))}
              </Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
          </View>
        </Card>

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
  statsCard: {
    marginTop: spacing.md,
  },
  statsTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
