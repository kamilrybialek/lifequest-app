import { getDatabase } from './init';
import { PHYSICAL_FOUNDATIONS } from '../types/physical';
import { getCompletedLessons } from './lessons';

// BMI Calculator
export const calculateBMI = (weight: number, height: number): number => {
  // weight in kg, height in cm
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  return Math.round(bmi * 10) / 10; // Round to 1 decimal
};

// TDEE Calculator (Mifflin-St Jeor Equation)
export const calculateTDEE = (
  age: number,
  weight: number,
  height: number,
  gender: 'male' | 'female' | 'other',
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active'
): number => {
  // Calculate BMR
  let bmr: number;
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else if (gender === 'female') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  } else {
    // For 'other', use average of male and female
    const maleBMR = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    const femaleBMR = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    bmr = (maleBMR + femaleBMR) / 2;
  }

  // Apply activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };

  const tdee = bmr * activityMultipliers[activityLevel];
  return Math.round(tdee);
};

// Get Physical Progress
export const getPhysicalProgress = async (userId: number) => {
  const db = await getDatabase();
  return await db.getFirstAsync(
    'SELECT * FROM physical_progress WHERE user_id = ?',
    [userId]
  );
};

// Create Physical Progress
export const createPhysicalProgress = async (
  userId: number,
  userData?: { age: number; weight: number; height: number; gender: 'male' | 'female' | 'other'; activityLevel: string }
) => {
  const db = await getDatabase();

  let bmi = null;
  let tdee = null;
  let targetCalories = null;

  if (userData && userData.age && userData.weight && userData.height) {
    bmi = calculateBMI(userData.weight, userData.height);
    tdee = calculateTDEE(
      userData.age,
      userData.weight,
      userData.height,
      userData.gender || 'other',
      userData.activityLevel as any || 'sedentary'
    );
    targetCalories = tdee; // Default to maintenance
  }

  await db.runAsync(
    'INSERT INTO physical_progress (user_id, bmi, tdee, target_calories) VALUES (?, ?, ?, ?)',
    [userId, bmi, tdee, targetCalories]
  );

  console.log(`✅ Physical progress created for user ${userId} - BMI: ${bmi}, TDEE: ${tdee}`);
};

// Update Physical Progress
export const updatePhysicalProgress = async (userId: number, updates: {
  current_foundation?: number;
  total_lessons_completed?: number;
  bmi?: number;
  tdee?: number;
  target_calories?: number;
}) => {
  const db = await getDatabase();
  const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), userId];

  await db.runAsync(
    `UPDATE physical_progress SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
    values
  );
};

// Check and Unlock Next Foundation
export const checkAndUnlockNextFoundation = async (userId: number) => {
  try {
    const completedLessonIds = await getCompletedLessons(userId);
    let progress: any = await getPhysicalProgress(userId);

    if (!progress) {
      await createPhysicalProgress(userId);
      progress = await getPhysicalProgress(userId);
    }

    const currentFoundation = progress?.current_foundation || 1;
    const foundationData = PHYSICAL_FOUNDATIONS.find(f => f.number === currentFoundation);

    if (!foundationData) return;

    const allLessonsCompleted = foundationData.lessons.every(lesson =>
      completedLessonIds.includes(lesson.id)
    );

    if (allLessonsCompleted && currentFoundation < PHYSICAL_FOUNDATIONS.length) {
      await updatePhysicalProgress(userId, {
        current_foundation: currentFoundation + 1,
      });
      console.log(`🎉 Foundation ${currentFoundation} completed! Unlocked Foundation ${currentFoundation + 1}`);
    }
  } catch (error) {
    console.error('Error checking foundation unlock:', error);
  }
};

// Workout Sessions
export const logWorkout = async (userId: number, data: {
  workoutDate: string;
  type: string;
  durationMinutes: number;
  intensity: number;
  caloriesBurned?: number;
  notes?: string;
}) => {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO workout_sessions (user_id, workout_date, type, duration_minutes, intensity, calories_burned, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.workoutDate,
      data.type,
      data.durationMinutes,
      data.intensity,
      data.caloriesBurned || 0,
      data.notes || '',
    ]
  );
  console.log(`✅ Workout logged: ${data.type}, ${data.durationMinutes}min`);
};

export const getWorkoutHistory = async (userId: number, limit: number = 7) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT * FROM workout_sessions
     WHERE user_id = ?
     ORDER BY workout_date DESC
     LIMIT ?`,
    [userId, limit]
  );
};

// Water Intake
export const logWaterIntake = async (userId: number, date: string, amount: number) => {
  const db = await getDatabase();

  // Check if entry exists for today
  const existing: any = await db.getFirstAsync(
    'SELECT * FROM water_intake_logs WHERE user_id = ? AND log_date = ?',
    [userId, date]
  );

  if (existing) {
    // Update existing
    await db.runAsync(
      'UPDATE water_intake_logs SET amount_ml = amount_ml + ? WHERE user_id = ? AND log_date = ?',
      [amount, userId, date]
    );
  } else {
    // Create new
    await db.runAsync(
      'INSERT INTO water_intake_logs (user_id, log_date, amount_ml) VALUES (?, ?, ?)',
      [userId, date, amount]
    );
  }

  console.log(`💧 Water logged: +${amount}ml`);
};

export const getWaterIntakeForDate = async (userId: number, date: string) => {
  const db = await getDatabase();
  return await db.getFirstAsync(
    'SELECT * FROM water_intake_logs WHERE user_id = ? AND log_date = ?',
    [userId, date]
  );
};

export const getWaterIntakeHistory = async (userId: number, limit: number = 7) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT * FROM water_intake_logs
     WHERE user_id = ?
     ORDER BY log_date DESC
     LIMIT ?`,
    [userId, limit]
  );
};

// Sleep Logs
export const logSleep = async (userId: number, data: {
  sleepDate: string;
  bedTime: string;
  wakeTime: string;
  durationHours: number;
  qualityRating: number;
  notes?: string;
}) => {
  const db = await getDatabase();

  // Check if entry exists for this date
  const existing: any = await db.getFirstAsync(
    'SELECT * FROM sleep_logs WHERE user_id = ? AND sleep_date = ?',
    [userId, data.sleepDate]
  );

  if (existing) {
    // Update existing
    await db.runAsync(
      `UPDATE sleep_logs SET bed_time = ?, wake_time = ?, duration_hours = ?, quality_rating = ?, notes = ?
       WHERE user_id = ? AND sleep_date = ?`,
      [data.bedTime, data.wakeTime, data.durationHours, data.qualityRating, data.notes || '', userId, data.sleepDate]
    );
  } else {
    // Create new
    await db.runAsync(
      `INSERT INTO sleep_logs (user_id, sleep_date, bed_time, wake_time, duration_hours, quality_rating, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, data.sleepDate, data.bedTime, data.wakeTime, data.durationHours, data.qualityRating, data.notes || '']
    );
  }

  console.log(`😴 Sleep logged: ${data.durationHours}h, quality: ${data.qualityRating}/5`);
};

export const getSleepHistory = async (userId: number, limit: number = 7) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT * FROM sleep_logs
     WHERE user_id = ?
     ORDER BY sleep_date DESC
     LIMIT ?`,
    [userId, limit]
  );
};

export const getSleepStats = async (userId: number) => {
  const db = await getDatabase();
  const stats: any = await db.getFirstAsync(
    `SELECT
       AVG(duration_hours) as avg_duration,
       AVG(quality_rating) as avg_quality,
       COUNT(*) as total_logs
     FROM sleep_logs
     WHERE user_id = ?`,
    [userId]
  );

  return {
    avgDuration: stats?.avg_duration ? Math.round(stats.avg_duration * 10) / 10 : 0,
    avgQuality: stats?.avg_quality ? Math.round(stats.avg_quality * 10) / 10 : 0,
    totalLogs: stats?.total_logs || 0,
  };
};
