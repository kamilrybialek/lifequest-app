import AsyncStorage from '@react-native-async-storage/async-storage';

const SLEEP_LOGS_KEY = 'lifequest.db:sleep_logs';
const SLEEP_LOGS_NEXT_ID_KEY = 'lifequest.db:sleep_logs:next_id';
const WEIGHT_HISTORY_KEY = 'lifequest.db:weight_history';
const WEIGHT_HISTORY_NEXT_ID_KEY = 'lifequest.db:weight_history:next_id';

// Sleep Tracking
export const logSleep = async (userId: number, data: {
  bed_time?: string;
  wake_time?: string;
  duration_hours?: number;
  quality_rating?: number;
  notes?: string;
}) => {
  const sleepLogsData = await AsyncStorage.getItem(SLEEP_LOGS_KEY);
  const sleepLogs = sleepLogsData ? JSON.parse(sleepLogsData) : [];

  const nextIdData = await AsyncStorage.getItem(SLEEP_LOGS_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const today = new Date().toISOString().split('T')[0];

  const newSleepLog = {
    id: nextId,
    user_id: userId,
    sleep_date: today,
    bed_time: data.bed_time || null,
    wake_time: data.wake_time || null,
    duration_hours: data.duration_hours || null,
    quality_rating: data.quality_rating || null,
    notes: data.notes || null,
    created_at: new Date().toISOString(),
  };

  sleepLogs.push(newSleepLog);

  await AsyncStorage.setItem(SLEEP_LOGS_KEY, JSON.stringify(sleepLogs));
  await AsyncStorage.setItem(SLEEP_LOGS_NEXT_ID_KEY, String(nextId + 1));

  console.log(`✅ Sleep logged for user ${userId}: ${data.duration_hours}h, quality: ${data.quality_rating}/5`);
};

export const getSleepLogs = async (userId: number, days: number = 7) => {
  const sleepLogsData = await AsyncStorage.getItem(SLEEP_LOGS_KEY);
  const sleepLogs = sleepLogsData ? JSON.parse(sleepLogsData) : [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

  // Filter by user and date range, then sort by sleep_date DESC
  return sleepLogs
    .filter((log: any) =>
      log.user_id === userId &&
      log.sleep_date >= cutoffDateStr
    )
    .sort((a: any, b: any) => {
      return new Date(b.sleep_date).getTime() - new Date(a.sleep_date).getTime();
    });
};

export const getAverageSleepDuration = async (userId: number, days: number = 7) => {
  const logs = await getSleepLogs(userId, days);

  if (logs.length === 0) {
    return 0;
  }

  const totalDuration = logs.reduce((sum: number, log: any) => {
    return sum + (log.duration_hours || 0);
  }, 0);

  return totalDuration / logs.length;
};

// Weight Tracking
export const logWeight = async (userId: number, weightKg: number, height?: number, notes?: string) => {
  const weightHistoryData = await AsyncStorage.getItem(WEIGHT_HISTORY_KEY);
  const weightHistory = weightHistoryData ? JSON.parse(weightHistoryData) : [];

  const nextIdData = await AsyncStorage.getItem(WEIGHT_HISTORY_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const today = new Date().toISOString().split('T')[0];

  let bmi = null;
  if (height && height > 0) {
    const heightM = height / 100;
    bmi = weightKg / (heightM * heightM);
  }

  const newWeightEntry = {
    id: nextId,
    user_id: userId,
    weight_kg: weightKg,
    measurement_date: today,
    bmi,
    notes: notes || null,
    created_at: new Date().toISOString(),
  };

  weightHistory.push(newWeightEntry);

  await AsyncStorage.setItem(WEIGHT_HISTORY_KEY, JSON.stringify(weightHistory));
  await AsyncStorage.setItem(WEIGHT_HISTORY_NEXT_ID_KEY, String(nextId + 1));

  console.log(`✅ Weight logged for user ${userId}: ${weightKg}kg${bmi ? `, BMI: ${bmi.toFixed(1)}` : ''}`);
};

export const getWeightHistory = async (userId: number, days: number = 30) => {
  const weightHistoryData = await AsyncStorage.getItem(WEIGHT_HISTORY_KEY);
  const weightHistory = weightHistoryData ? JSON.parse(weightHistoryData) : [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

  // Filter by user and date range, then sort by measurement_date DESC
  return weightHistory
    .filter((entry: any) =>
      entry.user_id === userId &&
      entry.measurement_date >= cutoffDateStr
    )
    .sort((a: any, b: any) => {
      return new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime();
    });
};

export const getLatestWeight = async (userId: number) => {
  const weightHistoryData = await AsyncStorage.getItem(WEIGHT_HISTORY_KEY);
  const weightHistory = weightHistoryData ? JSON.parse(weightHistoryData) : [];

  // Filter by user and sort by measurement_date DESC
  const userWeights = weightHistory
    .filter((entry: any) => entry.user_id === userId)
    .sort((a: any, b: any) => {
      return new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime();
    });

  return userWeights.length > 0 ? userWeights[0] : null;
};

export const getWeightTrend = async (userId: number, days: number = 30) => {
  const weightHistoryData = await AsyncStorage.getItem(WEIGHT_HISTORY_KEY);
  const weightHistory = weightHistoryData ? JSON.parse(weightHistoryData) : [];

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

  // Get recent weights sorted by date DESC, limit to 2
  const recent = weightHistory
    .filter((entry: any) =>
      entry.user_id === userId &&
      entry.measurement_date >= cutoffDateStr
    )
    .sort((a: any, b: any) => {
      return new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime();
    })
    .slice(0, 2);

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
