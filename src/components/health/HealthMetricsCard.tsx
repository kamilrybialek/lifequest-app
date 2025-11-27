/**
 * Health Metrics Card
 * Displays user's current health statistics on Dashboard
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import {
  getHealthMetrics,
  calculateHealthStats,
  needsWeeklyQuiz,
} from '../../services/healthDataService';
import { HealthStats } from '../../types/healthTypes';

interface HealthMetricsCardProps {
  userId: string;
  onQuizPress: () => void;
}

export const HealthMetricsCard: React.FC<HealthMetricsCardProps> = ({ userId, onQuizPress }) => {
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuizPrompt, setShowQuizPrompt] = useState(false);

  useEffect(() => {
    loadHealthData();
  }, [userId]);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const metrics = await getHealthMetrics(userId);

      if (metrics) {
        const healthStats = await calculateHealthStats(userId);
        setStats(healthStats);

        // Check if weekly quiz is needed
        const needsQuiz = await needsWeeklyQuiz(userId);
        setShowQuizPrompt(needsQuiz);
      }
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', isGoodWhenUp: boolean) => {
    if (trend === 'stable') return '#999';
    if (isGoodWhenUp) {
      return trend === 'up' ? colors.success : colors.error;
    } else {
      return trend === 'up' ? colors.error : colors.success;
    }
  };

  const getStressEmoji = (level: number) => {
    if (level <= 1.5) return '😌';
    if (level <= 2.5) return '😐';
    if (level <= 3.5) return '😰';
    return '😫';
  };

  const getSleepEmoji = (quality: number) => {
    if (quality >= 4.5) return '😴';
    if (quality >= 3.5) return '😊';
    if (quality >= 2.5) return '😐';
    return '😵';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Loading health data...</Text>
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>🏥 Health Overview</Text>
        </View>
        <Text style={styles.noDataText}>No health data yet. Complete onboarding first!</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏥 Health Overview</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadHealthData}>
          <Ionicons name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Weekly Quiz Prompt */}
      {showQuizPrompt && (
        <TouchableOpacity style={styles.quizPrompt} onPress={onQuizPress} activeOpacity={0.8}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8787']}
            style={styles.quizPromptGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.quizPromptContent}>
              <Ionicons name="clipboard-outline" size={24} color="white" />
              <View style={styles.quizPromptText}>
                <Text style={styles.quizPromptTitle}>📋 Weekly Check-In Due!</Text>
                <Text style={styles.quizPromptSubtitle}>Update your health metrics</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Metrics Grid */}
      <View style={styles.metricsGrid}>
        {/* Sleep Quality */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricEmoji}>{getSleepEmoji(stats.avgSleepQuality)}</Text>
            <Ionicons
              name={getTrendIcon(stats.sleepTrend)}
              size={16}
              color={getTrendColor(stats.sleepTrend, true)}
            />
          </View>
          <Text style={styles.metricValue}>{stats.avgSleepQuality.toFixed(1)}/5</Text>
          <Text style={styles.metricLabel}>Sleep Quality</Text>
        </View>

        {/* Stress Level */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricEmoji}>{getStressEmoji(stats.avgStressLevel)}</Text>
            <Ionicons
              name={getTrendIcon(stats.stressTrend)}
              size={16}
              color={getTrendColor(stats.stressTrend, false)}
            />
          </View>
          <Text style={styles.metricValue}>{stats.avgStressLevel.toFixed(1)}/5</Text>
          <Text style={styles.metricLabel}>Stress Level</Text>
        </View>

        {/* Exercise */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricEmoji}>💪</Text>
            <Ionicons
              name={getTrendIcon(stats.exerciseTrend)}
              size={16}
              color={getTrendColor(stats.exerciseTrend, true)}
            />
          </View>
          <Text style={styles.metricValue}>{stats.avgExerciseHours.toFixed(1)}h</Text>
          <Text style={styles.metricLabel}>Exercise/Day</Text>
        </View>

        {/* Hydration */}
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Text style={styles.metricEmoji}>💧</Text>
          </View>
          <Text style={styles.metricValue}>{stats.avgWaterIntake.toFixed(1)}L</Text>
          <Text style={styles.metricLabel}>Water/Day</Text>
        </View>
      </View>

      {/* BMI & Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>BMI</Text>
          <Text
            style={[
              styles.statValue,
              {
                color:
                  stats.currentBMI < 18.5 || stats.currentBMI > 25
                    ? colors.error
                    : colors.success,
              },
            ]}
          >
            {stats.currentBMI}
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Ideal Weight</Text>
          <Text style={styles.statValue}>
            {stats.idealWeightRange.min}-{stats.idealWeightRange.max} kg
          </Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Calorie Target</Text>
          <Text style={styles.statValue}>{stats.calorieTarget}</Text>
        </View>
      </View>

      {/* Take Quiz Button (if not already shown in prompt) */}
      {!showQuizPrompt && (
        <TouchableOpacity style={styles.quizButton} onPress={onQuizPress} activeOpacity={0.8}>
          <Ionicons name="clipboard-outline" size={20} color={colors.primary} />
          <Text style={styles.quizButtonText}>Take Weekly Quiz</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  refreshButton: {
    padding: 4,
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Quiz Prompt
  quizPrompt: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  quizPromptGradient: {
    padding: 16,
  },
  quizPromptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quizPromptText: {
    flex: 1,
  },
  quizPromptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  quizPromptSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    padding: 12,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricEmoji: {
    fontSize: 24,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#DDD',
  },
  // Quiz Button
  quizButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  quizButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
