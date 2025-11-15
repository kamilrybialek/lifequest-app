/**
 * TRANSFORMATION DASHBOARD
 *
 * Shows REAL LIFE CHANGE, not vanity metrics.
 * Measures outcomes, not task completion.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/theme';
import { spacing } from '../theme/spacing';
import { useAuthStore } from '../store/authStore';
import {
  calculateTransformationMetrics,
  TransformationMetrics,
} from '../utils/transformationCalculator';
import { needsWeeklyCheckIn } from '../database/transformation';
import { WeeklyCheckIn } from '../components/WeeklyCheckIn';

export const TransformationDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [metrics, setMetrics] = useState<TransformationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [needsCheckIn, setNeedsCheckIn] = useState(false);

  useEffect(() => {
    loadMetrics();
    checkIfCheckInNeeded();
  }, []);

  const loadMetrics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await calculateTransformationMetrics(user.id);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading transformation metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfCheckInNeeded = async () => {
    if (!user) return;
    const needs = await needsWeeklyCheckIn(user.id);
    setNeedsCheckIn(needs);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMetrics();
    await checkIfCheckInNeeded();
    setRefreshing(false);
  };

  const handleCheckInComplete = () => {
    setShowCheckIn(false);
    setNeedsCheckIn(false);
    handleRefresh();
  };

  if (showCheckIn) {
    return (
      <WeeklyCheckIn
        onComplete={handleCheckInComplete}
        onSkip={() => setShowCheckIn(false)}
      />
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Calculating your transformation...</Text>
      </View>
    );
  }

  if (!metrics) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="analytics-outline" size={64} color={colors.textLight} />
        <Text style={styles.emptyTitle}>Start Your Transformation</Text>
        <Text style={styles.emptySubtitle}>
          Complete your first weekly check-in to track real progress
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={() => setShowCheckIn(true)}>
          <Text style={styles.startButtonText}>Start Check-in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Weekly Check-in Banner */}
      {needsCheckIn && (
        <TouchableOpacity style={styles.checkInBanner} onPress={() => setShowCheckIn(true)}>
          <Ionicons name="clipboard" size={24} color="#fff" />
          <View style={styles.checkInBannerText}>
            <Text style={styles.checkInBannerTitle}>Weekly Check-in Due</Text>
            <Text style={styles.checkInBannerSubtitle}>Track this week's progress (2 min)</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Overall Transformation Score */}
      <View style={styles.overallCard}>
        <Text style={styles.overallLabel}>Your Transformation Score</Text>
        <Text style={styles.overallScore}>{metrics.overall.transformationScore}</Text>
        <View style={styles.overallDetails}>
          <View style={styles.overallDetail}>
            <Ionicons
              name={getTrendIcon(metrics.overall.trend)}
              size={20}
              color={getTrendColor(metrics.overall.trend)}
            />
            <Text style={styles.overallDetailText}>{metrics.overall.trend}</Text>
          </View>
          <Text style={styles.overallDays}>{metrics.overall.daysTracking} days tracking</Text>
        </View>
      </View>

      {/* Finance Pillar */}
      <PillarCard
        title="💰 Finance Transformation"
        score={metrics.finance.score}
        insight={metrics.finance.insight}
        color={colors.finance}
      >
        <MetricRow
          label="Net Worth"
          baseline={formatCurrency(metrics.finance.netWorth.baseline)}
          current={formatCurrency(metrics.finance.netWorth.current)}
          change={formatCurrency(metrics.finance.netWorth.change)}
          positive={metrics.finance.netWorth.change >= 0}
        />
        <MetricRow
          label="Emergency Fund"
          baseline={formatCurrency(metrics.finance.emergencyFund.baseline)}
          current={formatCurrency(metrics.finance.emergencyFund.current)}
          change={`${metrics.finance.emergencyFund.percentComplete.toFixed(0)}% complete`}
          positive={metrics.finance.emergencyFund.percentComplete > 0}
        />
        {metrics.finance.debt.baseline > 0 && (
          <MetricRow
            label="Debt Paid Off"
            baseline={formatCurrency(metrics.finance.debt.baseline)}
            current={formatCurrency(metrics.finance.debt.current)}
            change={formatCurrency(metrics.finance.debt.reduction)}
            positive={metrics.finance.debt.reduction > 0}
          />
        )}
      </PillarCard>

      {/* Mental Pillar */}
      <PillarCard
        title="🧘‍♂️ Mental Transformation"
        score={metrics.mental.score}
        insight={metrics.mental.insight}
        color={colors.mental}
      >
        <MetricRow
          label="Stress Level"
          baseline={`${metrics.mental.stress.baseline}/10`}
          current={`${metrics.mental.stress.current}/10`}
          change={metrics.mental.stress.change > 0 ? `↓ ${metrics.mental.stress.change.toFixed(1)}` : `↑ ${Math.abs(metrics.mental.stress.change).toFixed(1)}`}
          positive={metrics.mental.stress.change > 0}
        />
        <MetricRow
          label="Sleep Quality"
          baseline={`${metrics.mental.sleep.baseline}/10`}
          current={`${metrics.mental.sleep.current}/10`}
          change={metrics.mental.sleep.change >= 0 ? `+${metrics.mental.sleep.change.toFixed(1)}` : `${metrics.mental.sleep.change.toFixed(1)}`}
          positive={metrics.mental.sleep.change > 0}
        />
        <MetricRow
          label="Mood"
          baseline={`${metrics.mental.mood.baseline}/10`}
          current={`${metrics.mental.mood.current}/10`}
          change={metrics.mental.mood.change >= 0 ? `+${metrics.mental.mood.change.toFixed(1)}` : `${metrics.mental.mood.change.toFixed(1)}`}
          positive={metrics.mental.mood.change > 0}
        />
      </PillarCard>

      {/* Physical Pillar */}
      <PillarCard
        title="💪 Physical Transformation"
        score={metrics.physical.score}
        insight={metrics.physical.insight}
        color={colors.physical}
      >
        <MetricRow
          label="Strength Score"
          baseline={metrics.physical.strength.baseline.toFixed(0)}
          current={metrics.physical.strength.current.toFixed(0)}
          change={`+${metrics.physical.strength.percentImprovement.toFixed(0)}%`}
          positive={metrics.physical.strength.change > 0}
        />
        {metrics.physical.strength.exercises.pushups.baseline > 0 && (
          <MetricRow
            label="Push-ups"
            baseline={`${metrics.physical.strength.exercises.pushups.baseline}`}
            current={`${metrics.physical.strength.exercises.pushups.current}`}
            change={`+${metrics.physical.strength.exercises.pushups.change}`}
            positive={metrics.physical.strength.exercises.pushups.change > 0}
          />
        )}
        <MetricRow
          label="Resting HR"
          baseline={`${metrics.physical.cardio.baseline} BPM`}
          current={`${metrics.physical.cardio.current} BPM`}
          change={metrics.physical.cardio.change > 0 ? `↓ ${metrics.physical.cardio.change}` : `↑ ${Math.abs(metrics.physical.cardio.change)}`}
          positive={metrics.physical.cardio.change > 0}
        />
      </PillarCard>

      {/* Nutrition Pillar */}
      <PillarCard
        title="🍎 Nutrition Transformation"
        score={metrics.nutrition.score}
        insight={metrics.nutrition.insight}
        color={colors.nutrition}
      >
        <MetricRow
          label="Energy Level"
          baseline={`${metrics.nutrition.energy.baseline}/10`}
          current={`${metrics.nutrition.energy.current}/10`}
          change={`+${metrics.nutrition.energy.change.toFixed(1)}`}
          positive={metrics.nutrition.energy.change > 0}
        />
        <MetricRow
          label="Diet Quality"
          baseline={capitalizeFirst(metrics.nutrition.dietQuality.baseline)}
          current={capitalizeFirst(metrics.nutrition.dietQuality.current)}
          change={metrics.nutrition.dietQuality.improved ? 'Improved ✓' : 'Same'}
          positive={metrics.nutrition.dietQuality.improved}
        />
        <MetricRow
          label="Hydration"
          baseline={`${metrics.nutrition.hydration.baseline} glasses`}
          current={`${metrics.nutrition.hydration.current} glasses`}
          change={`+${metrics.nutrition.hydration.change.toFixed(0)}`}
          positive={metrics.nutrition.hydration.change > 0}
        />
      </PillarCard>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Your transformation is measured by real outcomes, not just task completion.
        </Text>
        <Text style={styles.footerText}>
          Complete weekly check-ins to see your progress!
        </Text>
      </View>
    </ScrollView>
  );
};

// ============================================
// COMPONENTS
// ============================================

interface PillarCardProps {
  title: string;
  score: number;
  insight: string;
  color: string;
  children: React.ReactNode;
}

const PillarCard: React.FC<PillarCardProps> = ({ title, score, insight, color, children }) => {
  return (
    <View style={styles.pillarCard}>
      <View style={styles.pillarHeader}>
        <Text style={styles.pillarTitle}>{title}</Text>
        <View style={[styles.scoreBadge, { backgroundColor: color }]}>
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>
      <Text style={styles.insight}>{insight}</Text>
      <View style={styles.metricsContainer}>{children}</View>
    </View>
  );
};

interface MetricRowProps {
  label: string;
  baseline: string;
  current: string;
  change: string;
  positive: boolean;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, baseline, current, change, positive }) => {
  return (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValues}>
        <Text style={styles.metricBaseline}>{baseline}</Text>
        <Ionicons name="arrow-forward" size={16} color={colors.textLight} />
        <Text style={styles.metricCurrent}>{current}</Text>
        <Text style={[styles.metricChange, positive ? styles.metricPositive : styles.metricNegative]}>
          {change}
        </Text>
      </View>
    </View>
  );
};

// ============================================
// HELPERS
// ============================================

const formatCurrency = (value: number): string => {
  if (value >= 0) {
    return `$${value.toFixed(0)}`;
  }
  return `-$${Math.abs(value).toFixed(0)}`;
};

const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getTrendIcon = (trend: string): any => {
  if (trend === 'improving') return 'trending-up';
  if (trend === 'declining') return 'trending-down';
  return 'remove';
};

const getTrendColor = (trend: string): string => {
  if (trend === 'improving') return colors.success;
  if (trend === 'declining') return colors.error;
  return colors.textSecondary;
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
  emptyTitle: {
    ...typography.heading,
    fontSize: 24,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    marginTop: spacing.xl,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkInBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: spacing.lg,
    margin: spacing.md,
    borderRadius: 12,
    gap: spacing.md,
  },
  checkInBannerText: {
    flex: 1,
  },
  checkInBannerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkInBannerSubtitle: {
    color: '#fff',
    opacity: 0.9,
    fontSize: 14,
    marginTop: spacing.xs,
  },
  overallCard: {
    backgroundColor: colors.background,
    padding: spacing.xl,
    margin: spacing.md,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  overallLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  overallScore: {
    fontSize: 64,
    fontWeight: 'bold',
    color: colors.primary,
    marginVertical: spacing.sm,
  },
  overallDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  overallDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  overallDetailText: {
    ...typography.body,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  overallDays: {
    ...typography.caption,
  },
  pillarCard: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    margin: spacing.md,
    marginTop: 0,
    borderRadius: 12,
  },
  pillarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  pillarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  scoreBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  insight: {
    ...typography.body,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: spacing.lg,
  },
  metricsContainer: {
    gap: spacing.md,
  },
  metricRow: {
    gap: spacing.sm,
  },
  metricLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  metricValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metricBaseline: {
    ...typography.body,
    color: colors.textLight,
    textDecorationLine: 'line-through',
  },
  metricCurrent: {
    ...typography.body,
    fontWeight: 'bold',
  },
  metricChange: {
    ...typography.body,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  metricPositive: {
    color: colors.success,
  },
  metricNegative: {
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerText: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.textSecondary,
  },
});
