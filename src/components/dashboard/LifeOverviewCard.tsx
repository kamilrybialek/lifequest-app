/**
 * Life Overview Card
 * Unified component showing LifeScore + key health metrics with trends
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { timeblocColors, timeblocShadows, timeblocSpacing, timeblocBorderRadius, timeblocTypography } from '../../theme/timeblocTheme';
import { getLifeScore, getPreviousLifeScore } from '../../services/lifeScoreService';
import { getHealthMetrics, calculateHealthStats } from '../../services/healthDataService';

interface LifeOverviewCardProps {
  userId: string;
  onDetailsPress?: () => void;
}

interface MetricData {
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'stable';
  isGoodWhenUp: boolean;
  icon: string;
}

export const LifeOverviewCard: React.FC<LifeOverviewCardProps> = ({ userId, onDetailsPress }) => {
  const [loading, setLoading] = useState(true);
  const [lifeScore, setLifeScore] = useState<number>(0);
  const [lifeScoreTrend, setLifeScoreTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [metrics, setMetrics] = useState<MetricData[]>([]);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load LifeScore with trend
      const [currentScore, previousScore] = await Promise.all([
        getLifeScore(userId),
        getPreviousLifeScore(userId)
      ]);

      setLifeScore(currentScore || 0);

      // Calculate LifeScore trend
      if (previousScore && currentScore) {
        const diff = currentScore - previousScore;
        if (Math.abs(diff) < 5) {
          setLifeScoreTrend('stable');
        } else {
          setLifeScoreTrend(diff > 0 ? 'up' : 'down');
        }
      }

      // Load health stats
      const stats = await calculateHealthStats(userId);

      if (stats) {
        const metricsData: MetricData[] = [
          {
            label: 'BMI',
            value: stats.currentBMI > 0 ? stats.currentBMI.toFixed(1) : '--',
            trend: 'stable', // Will be calculated from history
            isGoodWhenUp: false,
            icon: 'body-outline'
          },
          {
            label: 'Sleep',
            value: stats.avgSleepQuality > 0 ? `${stats.avgSleepQuality.toFixed(1)}/5` : '--',
            trend: stats.sleepTrend,
            isGoodWhenUp: true,
            icon: 'moon-outline'
          },
          {
            label: 'Stress',
            value: stats.avgStressLevel > 0 ? `${stats.avgStressLevel.toFixed(1)}/5` : '--',
            trend: stats.stressTrend,
            isGoodWhenUp: false,
            icon: 'pulse-outline'
          }
        ];

        setMetrics(metricsData);
      }
    } catch (error) {
      console.error('Error loading life overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    if (!trend || trend === 'stable') return 'remove-outline';
    return trend === 'up' ? 'trending-up' : 'trending-down';
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isGoodWhenUp: boolean) => {
    if (trend === 'stable') return timeblocColors.textTertiary;
    const isGood = (trend === 'up' && isGoodWhenUp) || (trend === 'down' && !isGoodWhenUp);
    return isGood ? timeblocColors.success : timeblocColors.error;
  };

  const getLifeScoreColor = (score: number) => {
    if (score >= 80) return timeblocColors.success;
    if (score >= 60) return timeblocColors.finance;
    if (score >= 40) return timeblocColors.warning;
    return timeblocColors.error;
  };

  const getLifeScoreGradient = (score: number): string[] => {
    if (score >= 80) return ['#A0D995', '#B8E5AD'];
    if (score >= 60) return ['#FFB976', '#FFD19C'];
    if (score >= 40) return ['#FFB976', '#FFCB8C'];
    return ['#FF8E9E', '#FFA8B5'];
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="small" color={timeblocColors.primary} />
        <Text style={styles.loadingText}>Loading overview...</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>📊</Text>
          <Text style={styles.headerTitle}>Life Overview</Text>
        </View>
        {onDetailsPress && (
          <TouchableOpacity onPress={onDetailsPress}>
            <Ionicons name="chevron-forward" size={20} color={timeblocColors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* LifeScore - Big Display */}
      <View style={styles.lifeScoreContainer}>
        <LinearGradient
          colors={getLifeScoreGradient(lifeScore)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.lifeScoreGradient}
        >
          <View style={styles.lifeScoreContent}>
            <View style={styles.lifeScoreMain}>
              <Text style={styles.lifeScoreValue}>{Math.round(lifeScore)}</Text>
              <View style={styles.lifeScoreTrend}>
                <Ionicons
                  name={getTrendIcon(lifeScoreTrend)}
                  size={20}
                  color={getTrendColor(lifeScoreTrend, true)}
                />
              </View>
            </View>
            <Text style={styles.lifeScoreLabel}>Life Score</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Health Metrics Grid */}
      <View style={styles.metricsGrid}>
        {metrics.map((metric, index) => (
          <View key={index} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name={metric.icon as any} size={20} color={timeblocColors.primary} />
              {metric.trend && (
                <Ionicons
                  name={getTrendIcon(metric.trend)}
                  size={16}
                  color={getTrendColor(metric.trend, metric.isGoodWhenUp)}
                />
              )}
            </View>
            <Text style={styles.metricValue}>{metric.value}</Text>
            <Text style={styles.metricLabel}>{metric.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.xl,
    padding: timeblocSpacing.lg,
    marginHorizontal: timeblocSpacing.xl,
    marginVertical: timeblocSpacing.md,
    ...timeblocShadows.soft,
  },
  loadingText: {
    ...timeblocTypography.body,
    color: timeblocColors.textSecondary,
    textAlign: 'center',
    marginTop: timeblocSpacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: timeblocSpacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: timeblocSpacing.sm,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    ...timeblocTypography.h3,
  },
  // LifeScore
  lifeScoreContainer: {
    marginBottom: timeblocSpacing.lg,
  },
  lifeScoreGradient: {
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.xl,
    alignItems: 'center',
  },
  lifeScoreContent: {
    alignItems: 'center',
  },
  lifeScoreMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: timeblocSpacing.sm,
  },
  lifeScoreValue: {
    fontSize: 56,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 64,
  },
  lifeScoreTrend: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: timeblocBorderRadius.md,
    padding: timeblocSpacing.xs,
  },
  lifeScoreLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
    marginTop: timeblocSpacing.xs,
  },
  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    gap: timeblocSpacing.md,
  },
  metricCard: {
    flex: 1,
    backgroundColor: timeblocColors.background,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.md,
    alignItems: 'center',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: timeblocSpacing.xs,
    marginBottom: timeblocSpacing.xs,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: timeblocColors.text,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: timeblocColors.textSecondary,
  },
});
