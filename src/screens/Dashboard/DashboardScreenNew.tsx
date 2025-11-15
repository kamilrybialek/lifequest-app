/**
 * NEW DASHBOARD - TRANSFORMATION FIRST
 *
 * Focus: Real life change, not task completion
 * Shows: Transformation score, outcomes, quick actions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { useAppStore } from '../../store/appStore';
import { useAuthStore } from '../../store/authStore';
import {
  calculateTransformationMetrics,
  TransformationMetrics,
} from '../../utils/transformationCalculator';
import { needsWeeklyCheckIn } from '../../database/transformation';
import { QuickActionsWidget } from '../../components/QuickActionsWidget';

const { width } = Dimensions.get('window');

interface DashboardScreenNewProps {
  navigation: any;
}

export const DashboardScreenNew: React.FC<DashboardScreenNewProps> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { dailyTasks, loadAppData } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<TransformationMetrics | null>(null);
  const [needsCheckIn, setNeedsCheckIn] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await loadAppData();
    if (user) {
      const transformationData = await calculateTransformationMetrics(user.id);
      setMetrics(transformationData);

      const needsCheck = await needsWeeklyCheckIn(user.id);
      setNeedsCheckIn(needsCheck);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const quickActions = [
    {
      id: 'check-in',
      icon: 'clipboard' as const,
      title: 'Weekly Check-in',
      subtitle: needsCheckIn ? 'Due now!' : 'Track progress',
      color: needsCheckIn ? colors.error : colors.primary,
      onPress: () => navigation.navigate('Progress'),
    },
    {
      id: 'journey',
      icon: 'compass' as const,
      title: 'Learn',
      subtitle: 'Continue lessons',
      color: colors.mental,
      onPress: () => navigation.navigate('Journey'),
    },
    {
      id: 'finance',
      icon: 'wallet' as const,
      title: 'Add Money',
      subtitle: 'Emergency fund',
      color: colors.finance,
      onPress: () => navigation.navigate('EmergencyFundScreen'),
    },
    {
      id: 'fitness',
      icon: 'fitness' as const,
      title: 'Log Workout',
      subtitle: 'Track activity',
      color: colors.physical,
      onPress: () => navigation.navigate('WorkoutTrackerScreen'),
    },
  ];

  const incompleteTasks = dailyTasks.filter((t) => !t.completed);
  const todayTask = incompleteTasks[0];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'Champion'}! 👋</Text>
            <Text style={styles.subtitle}>Your transformation journey</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('ProfileNew')}
          >
            <Ionicons name="person-circle" size={40} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* TRANSFORMATION SCORE - BIG & VISIBLE */}
        {metrics ? (
          <TouchableOpacity
            style={styles.transformationCard}
            onPress={() => navigation.navigate('Progress')}
            activeOpacity={0.8}
          >
            <View style={styles.transformationHeader}>
              <View>
                <Text style={styles.transformationLabel}>YOUR TRANSFORMATION</Text>
                <View style={styles.trendRow}>
                  <Ionicons
                    name={
                      metrics.overall.trend === 'improving'
                        ? 'trending-up'
                        : metrics.overall.trend === 'declining'
                        ? 'trending-down'
                        : 'remove'
                    }
                    size={20}
                    color={
                      metrics.overall.trend === 'improving'
                        ? colors.success
                        : metrics.overall.trend === 'declining'
                        ? colors.error
                        : colors.textSecondary
                    }
                  />
                  <Text style={styles.trendText}>{metrics.overall.trend}</Text>
                </View>
              </View>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{metrics.overall.transformationScore}</Text>
                <Text style={styles.scoreOutOf}>/100</Text>
              </View>
            </View>

            {/* Pillar Scores */}
            <View style={styles.pillarScores}>
              <PillarScore
                pillar="Finance"
                score={metrics.finance.score}
                icon="wallet"
                color={colors.finance}
              />
              <PillarScore
                pillar="Mental"
                score={metrics.mental.score}
                icon="brain"
                color={colors.mental}
              />
              <PillarScore
                pillar="Physical"
                score={metrics.physical.score}
                icon="fitness"
                color={colors.physical}
              />
              <PillarScore
                pillar="Nutrition"
                score={metrics.nutrition.score}
                icon="nutrition"
                color={colors.nutrition}
              />
            </View>

            <View style={styles.transformationFooter}>
              <Text style={styles.transformationFooterText}>
                📊 {metrics.overall.daysTracking} days tracking • Real outcomes, not tasks
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.welcomeCard}
            onPress={() => navigation.navigate('Progress')}
          >
            <Ionicons name="rocket" size={48} color={colors.primary} />
            <Text style={styles.welcomeTitle}>Start Your Transformation</Text>
            <Text style={styles.welcomeText}>
              Complete your first weekly check-in to begin tracking real progress
            </Text>
            <View style={styles.welcomeButton}>
              <Text style={styles.welcomeButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        {/* QUICK ACTIONS */}
        <QuickActionsWidget actions={quickActions} />

        {/* TODAY'S FOCUS TASK */}
        {todayTask && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Today's Focus</Text>
            <TouchableOpacity style={styles.taskCard} activeOpacity={0.7}>
              <View style={styles.taskIcon}>
                <Ionicons
                  name="checkbox-outline"
                  size={24}
                  color={colors[todayTask.pillar as keyof typeof colors] || colors.primary}
                />
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{todayTask.title}</Text>
                <Text style={styles.taskDescription}>{todayTask.description}</Text>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskMetaText}>
                    {todayTask.duration} min • +{todayTask.points} XP
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ALL TASKS PREVIEW */}
        {incompleteTasks.length > 1 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>📋 Today's Tasks</Text>
              <Text style={styles.sectionSubtitle}>
                {incompleteTasks.length} remaining
              </Text>
            </View>
            {incompleteTasks.slice(1, 4).map((task) => (
              <View key={task.id} style={styles.miniTask}>
                <Ionicons name="ellipse-outline" size={16} color={colors.textLight} />
                <Text style={styles.miniTaskText}>{task.title}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// PILLAR SCORE COMPONENT
// ============================================

interface PillarScoreProps {
  pillar: string;
  score: number;
  icon: any;
  color: string;
}

const PillarScore: React.FC<PillarScoreProps> = ({ pillar, score, icon, color }) => {
  return (
    <View style={styles.pillarScoreItem}>
      <View style={[styles.pillarIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={styles.pillarScoreValue}>{score}</Text>
      <Text style={styles.pillarScoreName}>{pillar}</Text>
    </View>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  profileButton: {
    padding: spacing.xs,
  },
  transformationCard: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  transformationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  transformationLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.xs / 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    textTransform: 'capitalize',
  },
  scoreCircle: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    lineHeight: 52,
  },
  scoreOutOf: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  pillarScores: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pillarScoreItem: {
    alignItems: 'center',
    gap: spacing.xs / 2,
  },
  pillarIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillarScoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  pillarScoreName: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  transformationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  transformationFooterText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  welcomeCard: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.xl,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  welcomeText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  welcomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
  },
  welcomeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  taskIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.backgroundGray,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  taskMeta: {
    flexDirection: 'row',
  },
  taskMetaText: {
    fontSize: 12,
    color: colors.textLight,
  },
  miniTask: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  miniTaskText: {
    fontSize: 14,
    color: colors.text,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
