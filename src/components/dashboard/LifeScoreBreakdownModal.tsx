/**
 * Life Score Breakdown Modal
 * Shows detailed breakdown of Life Score calculation
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  timeblocColors,
  timeblocShadows,
  timeblocSpacing,
  timeblocBorderRadius,
  timeblocTypography,
} from '../../theme/timeblocTheme';
import { getHealthMetrics } from '../../services/healthDataService';

interface LifeScoreBreakdownModalProps {
  visible: boolean;
  userId: string;
  lifeScore: number;
  onClose: () => void;
}

interface PillarScore {
  name: string;
  score: number;
  icon: string;
  color: string;
  gradient: string[];
  details: string[];
}

export const LifeScoreBreakdownModal: React.FC<LifeScoreBreakdownModalProps> = ({
  visible,
  userId,
  lifeScore,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [pillars, setPillars] = useState<PillarScore[]>([]);

  useEffect(() => {
    if (visible) {
      loadBreakdown();
    }
  }, [visible, userId]);

  const loadBreakdown = async () => {
    try {
      setLoading(true);
      const metrics = await getHealthMetrics(userId);

      if (!metrics) {
        setPillars([]);
        return;
      }

      // Calculate Mental Score
      const sleepScore = metrics.sleepQuality ? (metrics.sleepQuality / 5) * 100 : 0;
      const stressScore = metrics.stressLevel
        ? ((5 - metrics.stressLevel + 1) / 5) * 100
        : 0;
      const mentalScore = Math.round((sleepScore + stressScore) / 2);

      // Calculate Physical Score
      const hasValidMetrics = metrics.height && metrics.weight && metrics.height > 0 && metrics.weight > 0;
      const heightInMeters = hasValidMetrics ? metrics.height / 100 : 0;
      const bmi = hasValidMetrics ? metrics.weight / (heightInMeters * heightInMeters) : 0;

      // BMI scoring (ideal range 18.5-25)
      let bmiScore = 0;
      if (bmi >= 18.5 && bmi <= 25) bmiScore = 100;
      else if (bmi < 18.5) bmiScore = 70 - (18.5 - bmi) * 10;
      else bmiScore = 100 - (bmi - 25) * 5;
      bmiScore = Math.max(0, Math.min(100, bmiScore));

      // Exercise scoring (ideal 3-7 hours/week)
      const weeklyExercise = metrics.weeklyExerciseHours || 0;
      let exerciseScore = 0;
      if (weeklyExercise >= 3 && weeklyExercise <= 7) exerciseScore = 100;
      else if (weeklyExercise < 3) exerciseScore = (weeklyExercise / 3) * 100;
      else exerciseScore = Math.max(0, 100 - (weeklyExercise - 7) * 10);

      // Water scoring (ideal 2-3L/day)
      const water = metrics.waterIntakeLiters || 0;
      let waterScore = 0;
      if (water >= 2 && water <= 3) waterScore = 100;
      else if (water < 2) waterScore = (water / 2) * 100;
      else waterScore = Math.max(0, 100 - (water - 3) * 20);

      const physicalScore = Math.round((bmiScore + exerciseScore + waterScore) / 3);

      // Finance Score (placeholder)
      const financeScore = 50;

      // Nutrition Score (placeholder)
      const nutritionScore = 50;

      const pillarData: PillarScore[] = [
        {
          name: 'Finance',
          score: financeScore,
          icon: 'cash-outline',
          color: timeblocColors.finance,
          gradient: ['#8E7DFF', '#A59FFF'],
          details: [
            'Budget tracking: Not yet tracked',
            'Savings rate: Not yet tracked',
            'Debt management: Not yet tracked',
          ],
        },
        {
          name: 'Mental',
          score: mentalScore,
          icon: 'brain-outline',
          color: timeblocColors.mental,
          gradient: ['#7C6FE8', '#9B8FFF'],
          details: [
            `Sleep quality: ${metrics.sleepQuality ? `${metrics.sleepQuality.toFixed(1)}/5` : 'Not tracked'}`,
            `Stress level: ${metrics.stressLevel ? `${metrics.stressLevel.toFixed(1)}/5` : 'Not tracked'}`,
            `Screen time: ${metrics.screenTimeHours ? `${metrics.screenTimeHours.toFixed(1)}h/day` : 'Not tracked'}`,
          ],
        },
        {
          name: 'Physical',
          score: physicalScore,
          icon: 'fitness-outline',
          color: timeblocColors.physical,
          gradient: ['#FF8E9E', '#FFB3C1'],
          details: [
            `BMI: ${bmi > 0 ? bmi.toFixed(1) : 'Not calculated'}`,
            `Exercise: ${weeklyExercise.toFixed(1)}h/week`,
            `Water intake: ${water.toFixed(1)}L/day`,
          ],
        },
        {
          name: 'Nutrition',
          score: nutritionScore,
          icon: 'nutrition-outline',
          color: timeblocColors.nutrition,
          gradient: ['#A0D995', '#B8E5AD'],
          details: [
            'Meal quality: Not yet tracked',
            'Calorie balance: Not yet tracked',
            `Diet type: ${metrics.dietType || 'Not set'}`,
          ],
        },
      ];

      setPillars(pillarData);
    } catch (error) {
      console.error('Error loading breakdown:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return timeblocColors.success;
    if (score >= 60) return timeblocColors.finance;
    if (score >= 40) return timeblocColors.warning;
    return timeblocColors.error;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerIcon}>📊</Text>
              <Text style={styles.headerTitle}>Life Score Breakdown</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={timeblocColors.text} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={timeblocColors.primary} />
              <Text style={styles.loadingText}>Calculating scores...</Text>
            </View>
          ) : (
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Overall Score */}
              <View style={styles.overallScoreCard}>
                <Text style={styles.overallLabel}>Overall Life Score</Text>
                <Text style={[styles.overallScore, { color: getScoreColor(lifeScore) }]}>
                  {Math.round(lifeScore)}
                </Text>
                <Text style={styles.overallSubtext}>
                  Average of 4 life pillars
                </Text>
              </View>

              {/* Pillars */}
              <View style={styles.pillarsContainer}>
                {pillars.map((pillar, index) => (
                  <View key={index} style={styles.pillarCard}>
                    <LinearGradient
                      colors={pillar.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.pillarHeader}
                    >
                      <View style={styles.pillarHeaderContent}>
                        <Ionicons name={pillar.icon as any} size={28} color="#FFFFFF" />
                        <Text style={styles.pillarName}>{pillar.name}</Text>
                      </View>
                      <Text style={styles.pillarScore}>{pillar.score}</Text>
                    </LinearGradient>

                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                      <View
                        style={[
                          styles.progressBar,
                          {
                            width: `${pillar.score}%`,
                            backgroundColor: pillar.color,
                          },
                        ]}
                      />
                    </View>

                    {/* Details */}
                    <View style={styles.pillarDetails}>
                      {pillar.details.map((detail, idx) => (
                        <View key={idx} style={styles.detailRow}>
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={pillar.color}
                          />
                          <Text style={styles.detailText}>{detail}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>

              {/* Info Text */}
              <View style={styles.infoCard}>
                <Ionicons name="information-circle-outline" size={20} color={timeblocColors.primary} />
                <Text style={styles.infoText}>
                  Your Life Score is calculated from 4 key areas of life. Complete health quizzes
                  and track your progress to see your score improve over time.
                </Text>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: timeblocColors.background,
    borderTopLeftRadius: timeblocBorderRadius.xl,
    borderTopRightRadius: timeblocBorderRadius.xl,
    maxHeight: '90%',
    paddingTop: timeblocSpacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: timeblocSpacing.xl,
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
    ...timeblocTypography.h2,
  },
  closeButton: {
    padding: timeblocSpacing.xs,
  },
  loadingContainer: {
    padding: timeblocSpacing.xxl,
    alignItems: 'center',
  },
  loadingText: {
    ...timeblocTypography.body,
    color: timeblocColors.textSecondary,
    marginTop: timeblocSpacing.md,
  },
  scrollContent: {
    paddingHorizontal: timeblocSpacing.xl,
    paddingBottom: timeblocSpacing.xl,
  },
  overallScoreCard: {
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.xl,
    padding: timeblocSpacing.xl,
    alignItems: 'center',
    marginBottom: timeblocSpacing.lg,
    ...timeblocShadows.soft,
  },
  overallLabel: {
    ...timeblocTypography.caption,
    color: timeblocColors.textSecondary,
    marginBottom: timeblocSpacing.xs,
  },
  overallScore: {
    fontSize: 64,
    fontWeight: '700',
    lineHeight: 72,
  },
  overallSubtext: {
    ...timeblocTypography.caption,
    color: timeblocColors.textSecondary,
    marginTop: timeblocSpacing.xs,
  },
  pillarsContainer: {
    gap: timeblocSpacing.lg,
  },
  pillarCard: {
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.xl,
    overflow: 'hidden',
    ...timeblocShadows.soft,
  },
  pillarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: timeblocSpacing.lg,
  },
  pillarHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: timeblocSpacing.md,
  },
  pillarName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pillarScore: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: timeblocColors.background,
    marginHorizontal: timeblocSpacing.lg,
    marginTop: timeblocSpacing.md,
    borderRadius: timeblocBorderRadius.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: timeblocBorderRadius.sm,
  },
  pillarDetails: {
    padding: timeblocSpacing.lg,
    gap: timeblocSpacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: timeblocSpacing.sm,
  },
  detailText: {
    ...timeblocTypography.body,
    color: timeblocColors.textSecondary,
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: timeblocColors.surface,
    borderRadius: timeblocBorderRadius.lg,
    padding: timeblocSpacing.lg,
    gap: timeblocSpacing.md,
    marginTop: timeblocSpacing.lg,
    marginBottom: timeblocSpacing.xxl,
    ...timeblocShadows.soft,
  },
  infoText: {
    ...timeblocTypography.caption,
    color: timeblocColors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
