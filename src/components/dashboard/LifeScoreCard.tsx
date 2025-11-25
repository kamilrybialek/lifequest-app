/**
 * Life Score Card Component
 * Shows overall life score result with trend and survey link
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  useEffect(() => {
    loadLifeScore();
  }, [userId]);

  const loadLifeScore = async () => {
    try {
      setLoading(true);

      // Load health metrics
      const healthMetrics = await getHealthMetrics(userId);

      // Load financial data from Firestore
      let financialData: any = null;
      try {
        const profile = await getFinancialProfile(userId);

        if (profile) {
          // Use profile data if available
          financialData = {
            monthlyIncome: profile.monthly_income || 0,
            monthlyExpenses: profile.monthly_expenses || 0,
            monthlySavings: (profile.monthly_income || 0) - (profile.monthly_expenses || 0),
          };
        } else {
          // Calculate from recent transactions if no profile
          const currentMonth = new Date().toISOString().slice(0, 7); // "2025-01"
          const startDate = `${currentMonth}-01`;
          const endDate = `${currentMonth}-31`;

          const [expenses, income] = await Promise.all([
            getExpenses(userId, { startDate, endDate }),
            getIncome(userId, { startDate, endDate }),
          ]);

          // Calculate monthly totals
          const monthlyExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
          const monthlyIncome = income.reduce((sum, i) => sum + i.amount, 0);

          financialData = {
            monthlyIncome,
            monthlyExpenses,
            monthlySavings: monthlyIncome - monthlyExpenses,
          };
        }
      } catch (error) {
        console.error('❌ Error loading financial data:', error);
        financialData = null;
      }

      // Load recent quizzes for trend
      const recentQuizzes = await getRecentQuizzes(userId, 2);

      // Calculate pillar scores
      const scores: PillarScore[] = [
        {
          name: 'Finance',
          score: calculateFinanceScore(financialData),
          color: '#4CAF50',
          icon: '💰',
        },
        {
          name: 'Mental',
          score: calculateMentalScore(healthMetrics),
          color: '#2196F3',
          icon: '🧠',
        },
        {
          name: 'Physical',
          score: calculatePhysicalScore(healthMetrics),
          color: '#FF9800',
          icon: '💪',
        },
        {
          name: 'Nutrition',
          score: calculateNutritionScore(healthMetrics),
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
    if (!data) return 50;

    // Simple scoring based on financial health
    // Income > expenses + savings = good score
    const income = data.monthlyIncome || 0;
    const expenses = data.monthlyExpenses || 0;
    const savings = data.monthlySavings || 0;

    if (income === 0) return 50;

    const savingsRate = (savings / income) * 100;
    const expenseRatio = (expenses / income) * 100;

    let score = 50; // Base score

    // Savings rate bonus (0-30 points)
    if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 15) score += 25;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 5) score += 10;

    // Expense ratio (0-20 points)
    if (expenseRatio <= 50) score += 20;
    else if (expenseRatio <= 70) score += 10;
    else if (expenseRatio <= 90) score += 5;

    return Math.min(100, score);
  };

  const calculateMentalScore = (metrics: any): number => {
    if (!metrics) return 50;

    let score = 50;

    // Sleep quality (0-25 points)
    const sleepScore = ((metrics.sleepQuality || 3) / 5) * 25;
    score += sleepScore;

    // Stress level (0-25 points) - lower is better
    const stressScore = ((5 - (metrics.stressLevel || 3)) / 5) * 25;
    score += stressScore;

    return Math.min(100, Math.round(score));
  };

  const calculatePhysicalScore = (metrics: any): number => {
    if (!metrics) return 50;

    let score = 50;

    // Exercise hours (0-30 points)
    const exerciseScore = Math.min((metrics.weeklyExerciseHours || 0) / 5 * 30, 30);
    score += exerciseScore;

    // BMI in healthy range (0-20 points)
    if (metrics.height && metrics.weight) {
      const bmi = metrics.weight / Math.pow(metrics.height / 100, 2);
      if (bmi >= 18.5 && bmi <= 24.9) {
        score += 20;
      } else if (bmi >= 17 && bmi <= 27) {
        score += 10;
      }
    }

    return Math.min(100, Math.round(score));
  };

  const calculateNutritionScore = (metrics: any): number => {
    if (!metrics) return 50;

    let score = 50;

    // Water intake (0-25 points)
    const waterScore = Math.min((metrics.waterIntakeLiters || 0) / 2.5 * 25, 25);
    score += waterScore;

    // Meals per day (0-25 points)
    const mealsScore = (metrics.mealsPerDay || 0) >= 3 ? 25 : ((metrics.mealsPerDay || 0) / 3) * 25;
    score += mealsScore;

    return Math.min(100, Math.round(score));
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

      {/* Pillar Scores */}
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
