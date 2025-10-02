import AsyncStorage from '@react-native-async-storage/async-storage';
import { PHYSICAL_FOUNDATIONS } from '../types/physical';

// Web version using AsyncStorage instead of SQLite

// =====================
// PHYSICAL HEALTH PROGRESS
// =====================

export const getPhysicalProgress = async (userId: number) => {
  const key = `physical_progress_${userId}`;
  const data = await AsyncStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const createPhysicalProgress = async (
  userId: number,
  userData?: {
    weight?: number;
    height?: number;
    age?: number;
    gender?: string;
    activityLevel?: string;
  }
) => {
  // Calculate BMI if weight and height provided
  let bmi = null;
  if (userData?.weight && userData?.height) {
    bmi = calculateBMI(userData.weight, userData.height);
  }

  // Calculate TDEE if all data provided
  let tdee = null;
  if (userData?.age && userData?.weight && userData?.height && userData?.gender && userData?.activityLevel) {
    tdee = calculateTDEE(
      userData.age,
      userData.weight,
      userData.height,
      userData.gender,
      userData.activityLevel
    );
  }

  const progress = {
    user_id: userId,
    current_foundation: 1,
    total_lessons_completed: 0,
    bmi,
    tdee,
    target_calories: tdee ? tdee - 500 : null,
    updated_at: new Date().toISOString(),
  };

  await AsyncStorage.setItem(`physical_progress_${userId}`, JSON.stringify(progress));
  console.log('✅ Physical progress created (web):', { userId, bmi, tdee });
};

export const updatePhysicalProgress = async (
  userId: number,
  updates: {
    current_foundation?: number;
    total_lessons_completed?: number;
    bmi?: number;
    tdee?: number;
    target_calories?: number;
  }
) => {
  const current = await getPhysicalProgress(userId);
  const updated = {
    ...current,
    ...updates,
    updated_at: new Date().toISOString(),
  };
  await AsyncStorage.setItem(`physical_progress_${userId}`, JSON.stringify(updated));
  console.log('✅ Physical progress updated (web):', updates);
};

export const checkAndUnlockNextFoundation = async (userId: number) => {
  try {
    const completedLessonsData = await AsyncStorage.getItem(`completed_lessons_${userId}`);
    const completedLessonIds = completedLessonsData ? JSON.parse(completedLessonsData) : [];

    let progress = await getPhysicalProgress(userId);
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

// =====================
// BMI AND TDEE CALCULATIONS
// =====================

export const calculateBMI = (weightKg: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
};

export const calculateTDEE = (
  age: number,
  weightKg: number,
  heightCm: number,
  gender: string,
  activityLevel: string
): number => {
  let bmr: number;

  if (gender.toLowerCase() === 'male') {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
  }

  const activityMultipliers: { [key: string]: number } = {
    'sedentary': 1.2,
    'light': 1.375,
    'moderate': 1.55,
    'active': 1.725,
    'very_active': 1.9,
  };

  const multiplier = activityMultipliers[activityLevel.toLowerCase()] || 1.2;
  const tdee = bmr * multiplier;

  console.log('📊 TDEE Calculation (web):', { age, weightKg, heightCm, gender, activityLevel, bmr, tdee });
  return Math.round(tdee);
};

// =====================
// WORKOUT TRACKING
// =====================

export const logWorkout = async (
  userId: number,
  data: {
    workoutDate: string;
    type: string;
    durationMinutes: number;
    intensity: number;
    caloriesBurned?: number;
    notes?: string;
  }
) => {
  const key = `workout_sessions_${userId}`;
  const existing = await AsyncStorage.getItem(key);
  const sessions = existing ? JSON.parse(existing) : [];

  sessions.push({
    id: Date.now(),
    ...data,
    created_at: new Date().toISOString(),
  });

  await AsyncStorage.setItem(key, JSON.stringify(sessions));
  console.log('✅ Workout logged (web):', data);
};

export const getWorkoutHistory = async (userId: number, limit: number = 7) => {
  const key = `workout_sessions_${userId}`;
  const data = await AsyncStorage.getItem(key);
  const sessions = data ? JSON.parse(data) : [];
  return sessions.slice(0, limit);
};

export const getWorkoutStats = async (userId: number) => {
  const sessions = await getWorkoutHistory(userId, 100);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const thisWeekSessions = sessions.filter((s: any) => new Date(s.workoutDate) >= weekAgo);

  return {
    totalWorkouts: sessions.length,
    totalMinutes: sessions.reduce((sum: number, s: any) => sum + s.durationMinutes, 0),
    thisWeekCount: thisWeekSessions.length,
    thisWeekMinutes: thisWeekSessions.reduce((sum: number, s: any) => sum + s.durationMinutes, 0),
    thisWeekCalories: thisWeekSessions.reduce((sum: number, s: any) => sum + (s.caloriesBurned || 0), 0),
  };
};

// =====================
// WATER INTAKE TRACKING
// =====================

export const logWaterIntake = async (userId: number, date: string, amountMl: number) => {
  const key = `water_intake_${userId}`;
  const existing = await AsyncStorage.getItem(key);
  const logs = existing ? JSON.parse(existing) : {};

  logs[date] = (logs[date] || 0) + amountMl;
  await AsyncStorage.setItem(key, JSON.stringify(logs));
  console.log('✅ Water intake logged (web):', { date, amount: logs[date] });
  return logs[date];
};

export const getWaterIntakeForDate = async (userId: number, date: string) => {
  const key = `water_intake_${userId}`;
  const data = await AsyncStorage.getItem(key);
  const logs = data ? JSON.parse(data) : {};
  return { amount_ml: logs[date] || 0, goal_ml: 2000 };
};

export const getWaterIntakeHistory = async (userId: number, days: number = 7) => {
  const key = `water_intake_${userId}`;
  const data = await AsyncStorage.getItem(key);
  const logs = data ? JSON.parse(data) : {};

  const history = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    history.push({
      log_date: dateStr,
      amount_ml: logs[dateStr] || 0,
      goal_ml: 2000,
    });
  }

  return history;
};

// =====================
// SLEEP TRACKING
// =====================

export const logSleep = async (
  userId: number,
  data: {
    sleepDate: string;
    bedTime?: string;
    wakeTime?: string;
    durationHours: number;
    qualityRating?: number;
    notes?: string;
  }
) => {
  const key = `sleep_logs_${userId}`;
  const existing = await AsyncStorage.getItem(key);
  const logs = existing ? JSON.parse(existing) : [];

  const existingIndex = logs.findIndex((l: any) => l.sleepDate === data.sleepDate);

  if (existingIndex >= 0) {
    logs[existingIndex] = { ...logs[existingIndex], ...data };
  } else {
    logs.push({ id: Date.now(), ...data, created_at: new Date().toISOString() });
  }

  await AsyncStorage.setItem(key, JSON.stringify(logs));
  console.log('✅ Sleep logged (web):', data);
};

export const getSleepHistory = async (userId: number, limit: number = 7) => {
  const key = `sleep_logs_${userId}`;
  const data = await AsyncStorage.getItem(key);
  const logs = data ? JSON.parse(data) : [];
  return logs.slice(0, limit);
};

export const getSleepStats = async (userId: number) => {
  const logs = await getSleepHistory(userId, 100);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const thisWeekLogs = logs.filter((l: any) => new Date(l.sleepDate) >= weekAgo);

  const avgDuration = logs.reduce((sum: number, l: any) => sum + l.durationHours, 0) / (logs.length || 1);
  const avgQuality = logs.filter((l: any) => l.qualityRating).reduce((sum: number, l: any) => sum + l.qualityRating, 0) / (logs.filter((l: any) => l.qualityRating).length || 1);

  const thisWeekDuration = thisWeekLogs.reduce((sum: number, l: any) => sum + l.durationHours, 0) / (thisWeekLogs.length || 1);
  const thisWeekQuality = thisWeekLogs.filter((l: any) => l.qualityRating).reduce((sum: number, l: any) => sum + l.qualityRating, 0) / (thisWeekLogs.filter((l: any) => l.qualityRating).length || 1);

  return {
    avgDuration,
    avgQuality,
    thisWeekDuration,
    thisWeekQuality,
  };
};
