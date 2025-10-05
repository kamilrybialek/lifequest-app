import { getDatabase } from './init';

// Sleep Tracking
export const logSleep = async (userId: number, data: {
  bed_time?: string;
  wake_time?: string;
  duration_hours?: number;
  quality_rating?: number;
  notes?: string;
}) => {
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
    data.notes || null
  ]);

  console.log(`✅ Sleep logged for user ${userId}: ${data.duration_hours}h, quality: ${data.quality_rating}/5`);
};

export const getSleepLogs = async (userId: number, days: number = 7) => {
  const db = await getDatabase();
  return await db.getAllAsync<{
    id: number;
    user_id: number;
    sleep_date: string;
    bed_time: string | null;
    wake_time: string | null;
    duration_hours: number;
    quality_rating: number;
    notes: string | null;
  }>(`
    SELECT * FROM sleep_logs
    WHERE user_id = ? AND sleep_date >= DATE('now', '-' || ? || ' days')
    ORDER BY sleep_date DESC
  `, [userId, days]);
};

export const getAverageSleepDuration = async (userId: number, days: number = 7) => {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ avg_duration: number }>(`
    SELECT AVG(duration_hours) as avg_duration
    FROM sleep_logs
    WHERE user_id = ? AND sleep_date >= DATE('now', '-' || ? || ' days')
  `, [userId, days]);

  return result?.avg_duration || 0;
};

// Weight Tracking
export const logWeight = async (userId: number, weightKg: number, height?: number, notes?: string) => {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  let bmi = null;
  if (height && height > 0) {
    const heightM = height / 100;
    bmi = weightKg / (heightM * heightM);
  }

  await db.runAsync(`
    INSERT INTO weight_history (user_id, weight_kg, measurement_date, bmi, notes)
    VALUES (?, ?, ?, ?, ?)
  `, [userId, weightKg, today, bmi, notes || null]);

  console.log(`✅ Weight logged for user ${userId}: ${weightKg}kg${bmi ? `, BMI: ${bmi.toFixed(1)}` : ''}`);
};

export const getWeightHistory = async (userId: number, days: number = 30) => {
  const db = await getDatabase();
  return await db.getAllAsync<{
    id: number;
    user_id: number;
    weight_kg: number;
    measurement_date: string;
    bmi: number | null;
    notes: string | null;
  }>(`
    SELECT * FROM weight_history
    WHERE user_id = ? AND measurement_date >= DATE('now', '-' || ? || ' days')
    ORDER BY measurement_date DESC
  `, [userId, days]);
};

export const getLatestWeight = async (userId: number) => {
  const db = await getDatabase();
  return await db.getFirstAsync<{
    id: number;
    user_id: number;
    weight_kg: number;
    measurement_date: string;
    bmi: number | null;
  }>(`
    SELECT * FROM weight_history
    WHERE user_id = ?
    ORDER BY measurement_date DESC
    LIMIT 1
  `, [userId]);
};

export const getWeightTrend = async (userId: number, days: number = 30) => {
  const db = await getDatabase();
  const recent = await db.getAllAsync<{ weight_kg: number }>(`
    SELECT weight_kg FROM weight_history
    WHERE user_id = ? AND measurement_date >= DATE('now', '-' || ? || ' days')
    ORDER BY measurement_date DESC LIMIT 2
  `, [userId, days]);

  if (recent.length < 2) {
    return null;
  }

  const currentWeight = recent[0].weight_kg;
  const previousWeight = recent[1].weight_kg;
  const change = currentWeight - previousWeight;

  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (change > 0.5) trend = 'up';
  else if (change < -0.5) trend = 'down';

  return {
    currentWeight,
    previousWeight,
    change,
    trend,
  };
};

// Comprehensive Health Summary
export const getHealthSummary = async (userId: number) => {
  const db = await getDatabase();

  const [avgSleep, latestWeight] = await Promise.all([
    getAverageSleepDuration(userId, 7),
    getLatestWeight(userId),
  ]);

  return {
    avgSleep7Days: avgSleep,
    currentWeight: latestWeight?.weight_kg || null,
    currentBMI: latestWeight?.bmi || null,
  };
};
