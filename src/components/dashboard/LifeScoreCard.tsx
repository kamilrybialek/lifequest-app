/**
 * Life Score Card Component
 * Shows overall life score result with trend and survey link
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getHealthMetrics, getRecentQuizzes } from '../../services/healthDataService';
import { getFinancialProfile, getExpenses, getIncome } from '../../services/firebaseFinanceService';

interface LifeScoreCardProps {
  userId: string;
  onSurveyPress: () => void;
}

interface PillarScore {
  name: string;
  score: number;
  color: string;
  icon: string;
}

export const LifeScoreCard: React.FC<LifeScoreCardProps> = ({ userId, onSurveyPress }) => {
  const [loading, setLoading] = useState(true);
  const [overallScore, setOverallScore] = useState(0);
  const [trend, setTrend] = useState<'up' | 'down' | 'same'>('same');
  const [trendValue, setTrendValue] = useState(0);
  const [pillarScores, setPillarScores] = useState<PillarScore[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadLifeScore();
  }, [userId]);

  const loadLifeScore = async () => {
    try {
      setLoading(true);

      // Load onboarding data (primary source for calculations)
      const onboardingDataStr = await AsyncStorage.getItem('onboardingData');
      let onboardingData: any = {};

      if (onboardingDataStr) {
        onboardingData = JSON.parse(onboardingDataStr);
      }

      // Load health metrics
      const healthMetrics = await getHealthMetrics(userId);

      // Merge onboarding data with health metrics for comprehensive calculation
      const combinedData = {
        ...onboardingData,
        ...healthMetrics,
      };

      // Load recent quizzes for trend
      const recentQuizzes = await getRecentQuizzes(userId, 2);

      // Calculate pillar scores using onboarding logic
      const scores: PillarScore[] = [
        {
          name: 'Finance',
          score: calculateFinanceScore(combinedData),
          color: '#4CAF50',
          icon: '💰',
        },
        {
          name: 'Mental',
          score: calculateMentalScore(combinedData),
          color: '#2196F3',
          icon: '🧠',
        },
        {
          name: 'Physical',
          score: calculatePhysicalScore(combinedData),
          color: '#FF9800',
          icon: '💪',
        },
        {
          name: 'Nutrition',
          score: calculateNutritionScore(combinedData),
          color: '#9C27B0',
          icon: '🥗',
        },
      ];

      setPillarScores(scores);

      // Calculate overall score (average of all pillars)
      const overall = Math.round(
        scores.reduce((sum, pillar) => sum + pillar.score, 0) / scores.length
      );
      setOverallScore(overall);

      // Calculate trend
      if (recentQuizzes.length >= 2) {
        const currentQuiz = recentQuizzes[0];
        const previousQuiz = recentQuizzes[1];

        const currentAvg = (currentQuiz.sleepQuality + (10 - currentQuiz.stressLevel) + currentQuiz.energy + currentQuiz.mood) / 4;
        const previousAvg = (previousQuiz.sleepQuality + (10 - previousQuiz.stressLevel) + previousQuiz.energy + previousQuiz.mood) / 4;

        const difference = ((currentAvg - previousAvg) / previousAvg) * 100;
        setTrendValue(Math.abs(Math.round(difference)));

        if (difference > 2) {
          setTrend('up');
        } else if (difference < -2) {
          setTrend('down');
        } else {
          setTrend('same');
        }
      }

    } catch (error) {
      console.error('❌ Error loading life score:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateFinanceScore = (data: any): number => {
    if (!data) return 0;

    const monthlyIncome = data.monthlyIncome || 0;
    const monthlyExpenses = data.monthlyExpenses || 0;
    const estimatedDebt = data.estimatedDebt || 0;

    let score = 0;

    // 1. Income vs Expenses (40 points max)
    const expenseRatio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 2;
    if (expenseRatio <= 0.5) score += 40; // Saving 50%+
    else if (expenseRatio <= 0.7) score += 35; // Saving 30-50%
    else if (expenseRatio <= 0.85) score += 25; // Saving 15-30%
    else if (expenseRatio < 1.0) score += 15; // Saving something
    else if (expenseRatio <= 1.1) score += 5; // Slight deficit
    else score += 0; // Major deficit

    // 2. Debt Level (40 points max)
    const annualIncome = monthlyIncome * 12;
    const debtToIncomeRatio = annualIncome > 0 ? estimatedDebt / annualIncome : 100;
    if (estimatedDebt === 0) score += 40; // No debt
    else if (debtToIncomeRatio <= 0.5) score += 35; // Manageable debt
    else if (debtToIncomeRatio <= 1.0) score += 25; // Moderate debt
    else if (debtToIncomeRatio <= 2.0) score += 15; // High debt
    else if (debtToIncomeRatio <= 5.0) score += 5; // Very high debt
    else score += 0; // Critical debt

    // 3. Monthly Savings (20 points max)
    const monthlySavings = monthlyIncome - monthlyExpenses;
    if (monthlySavings >= monthlyIncome * 0.3) score += 20; // Saving 30%+
    else if (monthlySavings >= monthlyIncome * 0.2) score += 15; // Saving 20%+
    else if (monthlySavings >= monthlyIncome * 0.1) score += 10; // Saving 10%+
    else if (monthlySavings > 0) score += 5; // Saving something
    else score += 0; // No savings or deficit

    return Math.min(100, Math.max(0, score));
  };

  const calculateMentalScore = (data: any): number => {
    if (!data) return 0;

    const sleepQuality = data.sleepQuality || 5;
    const activityLevel = data.activityLevel || 'sedentary';

    let score = 0;

    // Sleep quality (70 points max)
    score += sleepQuality * 7;

    // Activity level bonus (30 points max)
    const activityPoints: Record<string, number> = {
      'sedentary': 5,
      'light': 15,
      'moderate': 22,
      'active': 27,
      'very_active': 30,
    };
    score += activityPoints[activityLevel] || 15;

    return Math.min(100, Math.max(0, score));
  };

  const calculatePhysicalScore = (data: any): number => {
    if (!data) return 0;

    const height = data.height || 170;
    const weight = data.weight || 70;
    const activityLevel = data.activityLevel || 'sedentary';

    let score = 50; // Start at middle

    // BMI score (60 points max)
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    const bmiRounded = Math.round(bmi * 10) / 10;

    if (bmiRounded >= 18.5 && bmiRounded < 25) score += 40; // Normal
    else if (bmiRounded >= 17 && bmiRounded < 18.5) score += 25; // Slightly underweight
    else if (bmiRounded >= 25 && bmiRounded < 27) score += 30; // Slightly overweight
    else if (bmiRounded >= 27 && bmiRounded < 30) score += 20; // Overweight
    else if (bmiRounded >= 30 && bmiRounded < 35) score += 10; // Obese
    else score += 0; // Very underweight or very obese

    // Activity level (40 points max)
    const activityPoints: Record<string, number> = {
      'sedentary': 5,
      'light': 15,
      'moderate': 25,
      'active': 35,
      'very_active': 40,
    };
    score += activityPoints[activityLevel] || 15;

    return Math.min(100, Math.max(0, score));
  };

  const calculateNutritionScore = (data: any): number => {
    if (!data) return 0;

    const mealsPerDay = data.mealsPerDay ?? 1;
    const fastFoodFrequency = data.fastFoodFrequency ?? 3;
    const waterIntake = data.waterIntake ?? 1;
    const dietQuality = data.dietQuality ?? 5;

    let score = 0;

    // Meals per day (25 points max)
    if (mealsPerDay === 1) score += 25; // 3 meals - optimal
    else if (mealsPerDay === 2) score += 20; // 4-5 meals - good
    else if (mealsPerDay === 0) score += 10; // 1-2 meals - poor
    else if (mealsPerDay === 3) score += 15; // 6+ meals - okay

    // Fast food frequency (30 points max) - inverted
    if (fastFoodFrequency === 0) score += 30; // Never/rarely
    else if (fastFoodFrequency === 1) score += 20; // Once a week
    else if (fastFoodFrequency === 2) score += 10; // Few times a week
    else score += 0; // Daily

    // Water intake (20 points max)
    if (waterIntake === 3) score += 20; // 8+ glasses
    else if (waterIntake === 2) score += 15; // 5-7 glasses
    else if (waterIntake === 1) score += 8; // 3-4 glasses
    else score += 0; // <3 glasses

    // Diet quality (25 points max)
    score += Math.min((dietQuality / 10) * 25, 25);

    return Math.min(100, Math.max(0, score));
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#4CAF50'; // Green
    if (score >= 60) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Work';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Life Score Result</Text>

      {/* Overall Score Circle */}
      <View style={styles.scoreCircle}>
        <Text style={[styles.scoreValue, { color: getScoreColor(overallScore) }]}>
          {overallScore}
        </Text>
        <Text style={styles.scoreLabel}>{getScoreLabel(overallScore)}</Text>

        {/* Trend Indicator */}
        {trend !== 'same' && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={trend === 'up' ? 'arrow-up' : 'arrow-down'}
              size={20}
              color={trend === 'up' ? '#4CAF50' : '#F44336'}
            />
            <Text style={[styles.trendText, { color: trend === 'up' ? '#4CAF50' : '#F44336' }]}>
              {trendValue}% from last week
            </Text>
          </View>
        )}
      </View>

      {/* More Details Button */}
      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => setShowDetails(!showDetails)}
        activeOpacity={0.7}
      >
        <Text style={styles.detailsButtonText}>
          {showDetails ? 'Hide Details' : 'More Details'}
        </Text>
        <Ionicons
          name={showDetails ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#4A90E2"
        />
      </TouchableOpacity>

      {/* Pillar Scores - Collapsible */}
      {showDetails && (
        <View style={styles.pillarsGrid}>
          {pillarScores.map((pillar) => (
            <View key={pillar.name} style={styles.pillarCard}>
              <Text style={styles.pillarIcon}>{pillar.icon}</Text>
              <Text style={styles.pillarName}>{pillar.name}</Text>
              <Text style={[styles.pillarScore, { color: pillar.color }]}>
                {pillar.score}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Survey Button */}
      <TouchableOpacity style={styles.surveyButton} onPress={onSurveyPress} activeOpacity={0.8}>
        <Ionicons name="clipboard" size={20} color="white" />
        <Text style={styles.surveyButtonText}>Update Your Score</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreValue: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F5F8FA',
    marginBottom: 16,
    gap: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  pillarCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  pillarIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  pillarName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pillarScore: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  surveyButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  surveyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
