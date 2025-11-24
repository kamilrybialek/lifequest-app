/**
 * Health Data Service
 * Manages user health metrics and weekly quizzes
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { HealthMetrics, WeeklyHealthQuiz, HealthStats } from '../types/healthTypes';

// ============================================
// HEALTH METRICS
// ============================================

/**
 * Save or update user's health metrics
 */
export const saveHealthMetrics = async (
  userId: string,
  metrics: Partial<HealthMetrics>
): Promise<void> => {
  try {
    const healthRef = doc(db, 'health_metrics', userId);
    const data = {
      ...metrics,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    // Check if document exists
    const existingDoc = await getDoc(healthRef);
    if (!existingDoc.exists()) {
      data.created_at = new Date().toISOString();
    }

    await setDoc(healthRef, data, { merge: true });
    console.log('✅ Health metrics saved successfully');

    // Also save to AsyncStorage for offline access
    await AsyncStorage.setItem(`health_metrics_${userId}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving health metrics:', error);
    throw error;
  }
};

/**
 * Get user's current health metrics
 */
export const getHealthMetrics = async (userId: string): Promise<HealthMetrics | null> => {
  try {
    // Try Firebase first
    const healthRef = doc(db, 'health_metrics', userId);
    const healthDoc = await getDoc(healthRef);

    if (healthDoc.exists()) {
      const data = healthDoc.data() as HealthMetrics;
      await AsyncStorage.setItem(`health_metrics_${userId}`, JSON.stringify(data));
      return data;
    }

    // Fallback to AsyncStorage
    const cached = await AsyncStorage.getItem(`health_metrics_${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    return null;
  } catch (error) {
    console.error('Error getting health metrics:', error);

    // Try AsyncStorage as fallback
    try {
      const cached = await AsyncStorage.getItem(`health_metrics_${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (cacheError) {
      console.error('Cache fallback failed:', cacheError);
    }

    return null;
  }
};

// ============================================
// WEEKLY HEALTH QUIZ
// ============================================

/**
 * Submit weekly health quiz
 */
export const submitWeeklyQuiz = async (
  userId: string,
  quizData: Omit<WeeklyHealthQuiz, 'id' | 'user_id' | 'created_at'>
): Promise<void> => {
  try {
    const quizRef = doc(collection(db, 'weekly_health_quizzes'));
    const data: WeeklyHealthQuiz = {
      id: quizRef.id,
      user_id: userId,
      ...quizData,
      created_at: new Date().toISOString(),
    };

    await setDoc(quizRef, data);
    console.log('✅ Weekly quiz submitted successfully');

    // Update health metrics with latest values
    await saveHealthMetrics(userId, {
      sleepQuality: quizData.sleepQuality,
      averageSleepHours: quizData.sleepHours,
      stressLevel: quizData.stressLevel,
      screenTimeHours: quizData.screenTime,
      weeklyExerciseHours: quizData.exerciseHours * 7, // Convert daily to weekly
      waterIntakeLiters: quizData.waterIntake,
      mealsPerDay: quizData.mealsCount,
      last_quiz_date: new Date().toISOString(),
    });

    // Save to AsyncStorage
    const cacheKey = `weekly_quizzes_${userId}`;
    const cached = await AsyncStorage.getItem(cacheKey);
    const quizzes = cached ? JSON.parse(cached) : [];
    quizzes.unshift(data);
    await AsyncStorage.setItem(cacheKey, JSON.stringify(quizzes.slice(0, 10))); // Keep last 10
  } catch (error) {
    console.error('Error submitting weekly quiz:', error);
    throw error;
  }
};

/**
 * Get recent weekly quizzes
 */
export const getRecentQuizzes = async (
  userId: string,
  limitCount: number = 4
): Promise<WeeklyHealthQuiz[]> => {
  try {
    const quizzesRef = collection(db, 'weekly_health_quizzes');
    const q = query(
      quizzesRef,
      where('user_id', '==', userId),
      orderBy('quiz_date', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const quizzes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as WeeklyHealthQuiz[];

    // Cache results
    await AsyncStorage.setItem(`weekly_quizzes_${userId}`, JSON.stringify(quizzes));

    return quizzes;
  } catch (error) {
    console.error('Error getting recent quizzes:', error);

    // Fallback to cache
    try {
      const cached = await AsyncStorage.getItem(`weekly_quizzes_${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (cacheError) {
      console.error('Cache fallback failed:', cacheError);
    }

    return [];
  }
};

/**
 * Check if user needs to take weekly quiz
 */
export const needsWeeklyQuiz = async (userId: string): Promise<boolean> => {
  try {
    const metrics = await getHealthMetrics(userId);
    if (!metrics || !metrics.last_quiz_date) {
      return true; // Never taken quiz
    }

    const lastQuizDate = new Date(metrics.last_quiz_date);
    const daysSinceQuiz = Math.floor(
      (Date.now() - lastQuizDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceQuiz >= 7; // Quiz needed if 7+ days since last one
  } catch (error) {
    console.error('Error checking quiz status:', error);
    return true; // Default to needing quiz
  }
};

// ============================================
// HEALTH STATISTICS
// ============================================

/**
 * Calculate health statistics from recent data
 */
export const calculateHealthStats = async (userId: string): Promise<HealthStats> => {
  try {
    const metrics = await getHealthMetrics(userId);
    const recentQuizzes = await getRecentQuizzes(userId, 4);

    if (!metrics) {
      throw new Error('No health metrics found');
    }

    // Calculate BMI
    const heightInMeters = metrics.height / 100;
    const currentBMI = metrics.weight / (heightInMeters * heightInMeters);

    // Calculate ideal weight range (BMI 18.5-25)
    const idealWeightMin = 18.5 * heightInMeters * heightInMeters;
    const idealWeightMax = 25 * heightInMeters * heightInMeters;

    // Calculate averages from recent quizzes
    let avgSleepQuality = metrics.sleepQuality;
    let avgStressLevel = metrics.stressLevel;
    let avgExerciseHours = metrics.weeklyExerciseHours / 7;
    let avgWaterIntake = metrics.waterIntakeLiters;

    if (recentQuizzes.length > 0) {
      avgSleepQuality =
        recentQuizzes.reduce((sum, q) => sum + q.sleepQuality, 0) / recentQuizzes.length;
      avgStressLevel =
        recentQuizzes.reduce((sum, q) => sum + q.stressLevel, 0) / recentQuizzes.length;
      avgExerciseHours =
        recentQuizzes.reduce((sum, q) => sum + q.exerciseHours, 0) / recentQuizzes.length;
      avgWaterIntake =
        recentQuizzes.reduce((sum, q) => sum + q.waterIntake, 0) / recentQuizzes.length;
    }

    // Calculate trends (comparing first half vs second half of recent quizzes)
    const calculateTrend = (values: number[]): 'up' | 'down' | 'stable' => {
      if (values.length < 2) return 'stable';
      const mid = Math.floor(values.length / 2);
      const firstHalf = values.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
      const secondHalf = values.slice(mid).reduce((a, b) => a + b, 0) / (values.length - mid);
      const diff = secondHalf - firstHalf;
      if (Math.abs(diff) < 0.3) return 'stable';
      return diff > 0 ? 'up' : 'down';
    };

    const sleepTrend = calculateTrend(recentQuizzes.map((q) => q.sleepQuality));
    const stressTrend = calculateTrend(recentQuizzes.map((q) => q.stressLevel));
    const exerciseTrend = calculateTrend(recentQuizzes.map((q) => q.exerciseHours));

    // Calculate calorie target based on BMR and activity level
    const calculateCalorieTarget = (): number => {
      // Mifflin-St Jeor Equation
      const bmr =
        metrics.gender === 'male'
          ? 10 * metrics.weight + 6.25 * metrics.height - 5 * metrics.age + 5
          : 10 * metrics.weight + 6.25 * metrics.height - 5 * metrics.age - 161;

      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        very_active: 1.725,
        extremely_active: 1.9,
      };

      const tdee = bmr * (activityMultipliers[metrics.activityLevel] || 1.55);
      return Math.round(tdee);
    };

    return {
      avgSleepQuality,
      avgStressLevel,
      avgExerciseHours,
      avgWaterIntake,
      sleepTrend,
      stressTrend,
      exerciseTrend,
      currentBMI: Math.round(currentBMI * 10) / 10,
      idealWeightRange: {
        min: Math.round(idealWeightMin),
        max: Math.round(idealWeightMax),
      },
      calorieTarget: calculateCalorieTarget(),
    };
  } catch (error) {
    console.error('Error calculating health stats:', error);
    throw error;
  }
};
