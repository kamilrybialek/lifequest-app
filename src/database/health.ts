import { getDatabase } from './init';
import { calculateBMI, calculateBMR, calculateTDEE, calculateCalorieGoal } from '../utils/healthCalculations';

// ===== SLEEP TRACKING =====

export interface SleepLog {
  id: number;
  user_id: number;
  sleep_date: string;
  bed_time?: string;
  wake_time?: string;
  duration_hours?: number;
  quality_rating?: number; // 1-5
  notes?: string;
  created_at: string;
}

export const logSleep = async (
  userId: number,
  data: {
    bed_time?: string;
    wake_time?: string;
    duration_hours?: number;
    quality_rating?: number;
    notes?: string;
  }
) => {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  await db.runAsync(`
    INSERT INTO sleep_logs (user_id, sleep_date, bed_time, wake_time, duration_hours, quality_rating, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    userId,
    today,
    data.bed_time || null,
    data.wake_time || null,
    data.duration_hours || null,
    data.quality_rating || null,
    data.notes || null,
  ]);

  console.log(`✅ Sleep logged: ${data.duration_hours}h, quality: ${data.quality_rating}/5`);
};

export const getSleepLogs = async (userId: number, limit: number = 7): Promise<SleepLog[]> => {
  const db = await getDatabase();
  const logs = await db.getAllAsync<SleepLog>(`
    SELECT * FROM sleep_logs
    WHERE user_id = ?
    ORDER BY sleep_date DESC
    LIMIT ?
  `, [userId, limit]);

  return logs || [];
};

export const getAverageSleepDuration = async (userId: number, days: number = 7): Promise<number> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ avg_duration: number }>(`
    SELECT AVG(duration_hours) as avg_duration
    FROM sleep_logs
    WHERE user_id = ?
      AND sleep_date >= DATE('now', '-' || ? || ' days')
  `, [userId, days]);

  return result?.avg_duration || 0;
};

// ===== WEIGHT TRACKING =====

export interface WeightEntry {
  id: number;
  user_id: number;
  weight_kg: number;
  measurement_date: string;
  bmi?: number;
  notes?: string;
  created_at: string;
}

export const logWeight = async (
  userId: number,
  weightKg: number,
  height?: number,
  notes?: string
) => {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  // Calculate BMI if height is provided
  let bmi = null;
  if (height && height > 0) {
    bmi = calculateBMI(weightKg, height);
  }

  await db.runAsync(`
    INSERT INTO weight_history (user_id, weight_kg, measurement_date, bmi, notes)
    VALUES (?, ?, ?, ?, ?)
  `, [userId, weightKg, today, bmi, notes || null]);

  console.log(`✅ Weight logged: ${weightKg} kg${bmi ? `, BMI: ${bmi}` : ''}`);
};

export const getWeightHistory = async (userId: number, limit: number = 30): Promise<WeightEntry[]> => {
  const db = await getDatabase();
  const history = await db.getAllAsync<WeightEntry>(`
    SELECT * FROM weight_history
    WHERE user_id = ?
    ORDER BY measurement_date DESC
    LIMIT ?
  `, [userId, limit]);

  return history || [];
};

export const getLatestWeight = async (userId: number): Promise<number | null> => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ weight_kg: number }>(`
    SELECT weight_kg
    FROM weight_history
    WHERE user_id = ?
    ORDER BY measurement_date DESC
    LIMIT 1
  `, [userId]);

  return result?.weight_kg || null;
};

export const getWeightTrend = async (userId: number, days: number = 30): Promise<{
  currentWeight: number;
  previousWeight: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}> => {
  const db = await getDatabase();

  const recent = await db.getAllAsync<{ weight_kg: number }>(`
    SELECT weight_kg
    FROM weight_history
    WHERE user_id = ?
      AND measurement_date >= DATE('now', '-' || ? || ' days')
    ORDER BY measurement_date DESC
    LIMIT 2
  `, [userId, days]);

  if (!recent || recent.length < 2) {
    const current = recent?.[0]?.weight_kg || 0;
    return {
      currentWeight: current,
      previousWeight: current,
      change: 0,
      trend: 'stable',
    };
  }

  const currentWeight = recent[0].weight_kg;
  const previousWeight = recent[1].weight_kg;
  const change = currentWeight - previousWeight;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (change > 0.5) trend = 'up';
  else if (change < -0.5) trend = 'down';

  return { currentWeight, previousWeight, change, trend };
};

// ===== HEALTH METRICS SUMMARY =====

export const getHealthSummary = async (
  userId: number,
  weight: number,
  height: number,
  age: number,
  gender: 'male' | 'female'
) => {
  const bmi = calculateBMI(weight, height);
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, 'moderate'); // Default to moderate activity
  const calorieGoal = calculateCalorieGoal(tdee, 'maintain');

  // Get average sleep
  const avgSleep = await getAverageSleepDuration(userId, 7);

  // Get weight trend
  const weightTrend = await getWeightTrend(userId, 30);

  return {
    bmi,
    bmr,
    tdee,
    calorieGoal,
    avgSleep,
    weightTrend,
  };
};
