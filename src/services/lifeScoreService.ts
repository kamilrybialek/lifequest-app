/**
 * Life Score Service
 * Calculates and manages user's overall Life Score
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import { getHealthMetrics } from './healthDataService';

const LIFESCORE_CACHE_KEY = 'lifequest.lifescore';

interface LifeScoreSnapshot {
  user_id: string;
  score: number;
  finance_score: number;
  mental_score: number;
  physical_score: number;
  nutrition_score: number;
  created_at: string;
}

/**
 * Calculate Life Score from health metrics
 * Simple algorithm: average of 4 pillar scores (0-100 each)
 */
export const calculateLifeScore = async (userId: string): Promise<number> => {
  try {
    const metrics = await getHealthMetrics(userId);

    if (!metrics) {
      return 0;
    }

    // Calculate pillar scores (simplified)
    // In real app, these would be more sophisticated calculations

    // Finance score (placeholder - would need finance data)
    const financeScore = 50; // Default mid-range

    // Mental score (based on stress and sleep)
    const mentalScore = calculateMentalScore(metrics.sleepQuality, metrics.stressLevel);

    // Physical score (based on BMI, exercise, water intake)
    const physicalScore = calculatePhysicalScore(
      metrics.weight,
      metrics.height,
      metrics.weeklyExerciseHours,
      metrics.waterIntakeLiters
    );

    // Nutrition score (based on diet quality)
    const nutritionScore = 50; // Default mid-range

    // Average of all 4 pillars
    const lifeScore = (financeScore + mentalScore + physicalScore + nutritionScore) / 4;

    return Math.round(lifeScore);
  } catch (error) {
    console.error('Error calculating life score:', error);
    return 0;
  }
};

/**
 * Calculate mental health score
 */
const calculateMentalScore = (sleepQuality: number, stressLevel: number): number => {
  if (!sleepQuality || !stressLevel) return 50;

  // Sleep quality: 1-5 scale, convert to 0-100
  const sleepScore = (sleepQuality / 5) * 100;

  // Stress level: 1-5 scale, inverted (lower is better), convert to 0-100
  const stressScore = ((5 - stressLevel + 1) / 5) * 100;

  return (sleepScore + stressScore) / 2;
};

/**
 * Calculate physical health score
 */
const calculatePhysicalScore = (
  weight: number,
  height: number,
  weeklyExercise: number,
  waterIntake: number
): number => {
  if (!weight || !height) return 50;

  let score = 0;
  let components = 0;

  // BMI score (ideal range 18.5-25)
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  if (bmi >= 18.5 && bmi <= 25) {
    score += 100;
  } else if (bmi < 18.5) {
    score += Math.max(0, 100 - (18.5 - bmi) * 10);
  } else {
    score += Math.max(0, 100 - (bmi - 25) * 5);
  }
  components++;

  // Exercise score (ideal: 3-7 hours per week)
  if (weeklyExercise) {
    if (weeklyExercise >= 3 && weeklyExercise <= 7) {
      score += 100;
    } else if (weeklyExercise < 3) {
      score += (weeklyExercise / 3) * 100;
    } else {
      score += Math.max(0, 100 - (weeklyExercise - 7) * 5);
    }
    components++;
  }

  // Water intake score (ideal: 2-3 liters per day)
  if (waterIntake) {
    if (waterIntake >= 2 && waterIntake <= 3) {
      score += 100;
    } else if (waterIntake < 2) {
      score += (waterIntake / 2) * 100;
    } else {
      score += Math.max(0, 100 - (waterIntake - 3) * 20);
    }
    components++;
  }

  return components > 0 ? score / components : 50;
};

/**
 * Get current Life Score for user
 */
export const getLifeScore = async (userId: string): Promise<number> => {
  try {
    // Try to get from cache first (for offline support)
    const cached = await AsyncStorage.getItem(`${LIFESCORE_CACHE_KEY}:${userId}`);
    if (cached) {
      const data = JSON.parse(cached);
      // Return cached if less than 1 hour old
      const cacheAge = Date.now() - new Date(data.timestamp).getTime();
      if (cacheAge < 3600000) {
        return data.score;
      }
    }

    // Calculate fresh score
    const score = await calculateLifeScore(userId);

    // Cache it
    await AsyncStorage.setItem(
      `${LIFESCORE_CACHE_KEY}:${userId}`,
      JSON.stringify({ score, timestamp: new Date().toISOString() })
    );

    return score;
  } catch (error) {
    console.error('Error getting life score:', error);
    return 0;
  }
};

/**
 * Get previous Life Score (for trend calculation)
 */
export const getPreviousLifeScore = async (userId: string): Promise<number | null> => {
  try {
    const snapshotsRef = collection(db, 'lifescore_snapshots');
    const q = query(
      snapshotsRef,
      where('user_id', '==', userId),
      orderBy('created_at', 'desc'),
      limit(2) // Get last 2 snapshots
    );

    const snapshot = await getDocs(q);

    if (snapshot.docs.length < 2) {
      return null; // Not enough history
    }

    // Return the second-to-last score
    const previousSnapshot = snapshot.docs[1].data() as LifeScoreSnapshot;
    return previousSnapshot.score;
  } catch (error) {
    console.error('Error getting previous life score:', error);
    return null;
  }
};

/**
 * Save Life Score snapshot (for history/trending)
 */
export const saveLifeScoreSnapshot = async (userId: string): Promise<void> => {
  try {
    const score = await calculateLifeScore(userId);
    const metrics = await getHealthMetrics(userId);

    if (!metrics) return;

    const snapshot: LifeScoreSnapshot = {
      user_id: userId,
      score,
      finance_score: 50, // Placeholder
      mental_score: Math.round(calculateMentalScore(metrics.sleepQuality, metrics.stressLevel)),
      physical_score: Math.round(
        calculatePhysicalScore(
          metrics.weight,
          metrics.height,
          metrics.weeklyExerciseHours,
          metrics.waterIntakeLiters
        )
      ),
      nutrition_score: 50, // Placeholder
      created_at: new Date().toISOString(),
    };

    const snapshotRef = doc(collection(db, 'lifescore_snapshots'));
    await setDoc(snapshotRef, snapshot);

    console.log('✅ Life Score snapshot saved:', score);
  } catch (error) {
    console.error('Error saving life score snapshot:', error);
  }
};
