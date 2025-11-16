import AsyncStorage from '@react-native-async-storage/async-storage';
import { MENTAL_FOUNDATIONS } from '../types/mental';
import { getCompletedLessons } from './lessons.web';

const MENTAL_PROGRESS_KEY = 'lifequest.db:mental_progress';
const MENTAL_PROGRESS_NEXT_ID_KEY = 'lifequest.db:mental_progress:next_id';
const SCREEN_TIME_LOGS_KEY = 'lifequest.db:screen_time_logs';
const SCREEN_TIME_LOGS_NEXT_ID_KEY = 'lifequest.db:screen_time_logs:next_id';
const DOPAMINE_DETOX_SESSIONS_KEY = 'lifequest.db:dopamine_detox_sessions';
const DOPAMINE_DETOX_SESSIONS_NEXT_ID_KEY = 'lifequest.db:dopamine_detox_sessions:next_id';
const MORNING_ROUTINES_KEY = 'lifequest.db:morning_routines';
const MORNING_ROUTINES_NEXT_ID_KEY = 'lifequest.db:morning_routines:next_id';
const MEDITATION_SESSIONS_KEY = 'lifequest.db:meditation_sessions';
const MEDITATION_SESSIONS_NEXT_ID_KEY = 'lifequest.db:meditation_sessions:next_id';

// =====================
// MENTAL HEALTH PROGRESS
// =====================

export const getMentalProgress = async (userId: number) => {
  const data = await AsyncStorage.getItem(MENTAL_PROGRESS_KEY);
  const progressArray = data ? JSON.parse(data) : [];
  return progressArray.find((p: any) => p.user_id === userId) || null;
};

export const createMentalProgress = async (userId: number) => {
  const data = await AsyncStorage.getItem(MENTAL_PROGRESS_KEY);
  const progressArray = data ? JSON.parse(data) : [];
  const nextIdData = await AsyncStorage.getItem(MENTAL_PROGRESS_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const newProgress = {
    id: nextId,
    user_id: userId,
    current_foundation: 1,
    total_lessons_completed: 0,
    dopamine_detox_count: 0,
    last_detox_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  progressArray.push(newProgress);
  await AsyncStorage.setItem(MENTAL_PROGRESS_KEY, JSON.stringify(progressArray));
  await AsyncStorage.setItem(MENTAL_PROGRESS_NEXT_ID_KEY, String(nextId + 1));
};

export const updateMentalProgress = async (
  userId: number,
  updates: {
    current_foundation?: number;
    total_lessons_completed?: number;
    dopamine_detox_count?: number;
    last_detox_date?: string;
  }
) => {
  const data = await AsyncStorage.getItem(MENTAL_PROGRESS_KEY);
  const progressArray = data ? JSON.parse(data) : [];
  const progressIndex = progressArray.findIndex((p: any) => p.user_id === userId);

  if (progressIndex !== -1) {
    progressArray[progressIndex] = {
      ...progressArray[progressIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    await AsyncStorage.setItem(MENTAL_PROGRESS_KEY, JSON.stringify(progressArray));
  }
};

// Check and unlock next foundation if all lessons completed
export const checkAndUnlockNextFoundation = async (userId: number) => {
  try {
    // Get completed lessons
    const completedLessonIds = await getCompletedLessons(userId);

    // Get current progress
    let progress: any = await getMentalProgress(userId);

    if (!progress) {
      await createMentalProgress(userId);
      progress = await getMentalProgress(userId);
    }

    const currentFoundation = progress?.current_foundation || 1;

    // Find the current foundation
    const foundationData = MENTAL_FOUNDATIONS.find(f => f.number === currentFoundation);
    if (!foundationData) return;

    // Check if all lessons in current foundation are completed
    const allLessonsCompleted = foundationData.lessons.every(lesson =>
      completedLessonIds.includes(lesson.id)
    );

    if (allLessonsCompleted && currentFoundation < MENTAL_FOUNDATIONS.length) {
      // Unlock next foundation
      await updateMentalProgress(userId, {
        current_foundation: currentFoundation + 1,
      });
      console.log(`🎉 Foundation ${currentFoundation} completed! Unlocked Foundation ${currentFoundation + 1}`);
    }
  } catch (error) {
    console.error('Error checking foundation unlock:', error);
  }
};

// =====================
// SCREEN TIME TRACKING
// =====================

export const logScreenTime = async (
  userId: number,
  data: {
    logDate: string;
    totalMinutes: number;
    appUsage?: string;
    notes?: string;
  }
) => {
  const logsData = await AsyncStorage.getItem(SCREEN_TIME_LOGS_KEY);
  const logs = logsData ? JSON.parse(logsData) : [];

  // Check if log already exists for this date
  const existingIndex = logs.findIndex(
    (l: any) => l.user_id === userId && l.log_date === data.logDate
  );

  if (existingIndex !== -1) {
    // Update existing log
    logs[existingIndex] = {
      ...logs[existingIndex],
      total_minutes: data.totalMinutes,
      app_usage: data.appUsage || '',
      notes: data.notes || '',
    };
  } else {
    // Create new log
    const nextIdData = await AsyncStorage.getItem(SCREEN_TIME_LOGS_NEXT_ID_KEY);
    const nextId = nextIdData ? parseInt(nextIdData) : 1;

    logs.push({
      id: nextId,
      user_id: userId,
      log_date: data.logDate,
      total_minutes: data.totalMinutes,
      app_usage: data.appUsage || '',
      notes: data.notes || '',
      created_at: new Date().toISOString(),
    });

    await AsyncStorage.setItem(SCREEN_TIME_LOGS_NEXT_ID_KEY, String(nextId + 1));
  }

  await AsyncStorage.setItem(SCREEN_TIME_LOGS_KEY, JSON.stringify(logs));
};

export const getScreenTimeForDate = async (userId: number, date: string) => {
  const data = await AsyncStorage.getItem(SCREEN_TIME_LOGS_KEY);
  const logs = data ? JSON.parse(data) : [];
  return logs.find((l: any) => l.user_id === userId && l.log_date === date) || null;
};

export const getScreenTimeHistory = async (userId: number, days: number = 7) => {
  const data = await AsyncStorage.getItem(SCREEN_TIME_LOGS_KEY);
  const logs = data ? JSON.parse(data) : [];

  return logs
    .filter((l: any) => l.user_id === userId)
    .sort((a: any, b: any) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime())
    .slice(0, days);
};

// =====================
// DOPAMINE DETOX
// =====================

export const startDopamineDetox = async (
  userId: number,
  durationHours: number = 24
) => {
  const sessionsData = await AsyncStorage.getItem(DOPAMINE_DETOX_SESSIONS_KEY);
  const sessions = sessionsData ? JSON.parse(sessionsData) : [];
  const nextIdData = await AsyncStorage.getItem(DOPAMINE_DETOX_SESSIONS_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const newSession = {
    id: nextId,
    user_id: userId,
    start_date: new Date().toISOString(),
    duration_hours: durationHours,
    completed: false,
    end_date: null,
    difficulty_rating: null,
    notes: '',
    created_at: new Date().toISOString(),
  };

  sessions.push(newSession);
  await AsyncStorage.setItem(DOPAMINE_DETOX_SESSIONS_KEY, JSON.stringify(sessions));
  await AsyncStorage.setItem(DOPAMINE_DETOX_SESSIONS_NEXT_ID_KEY, String(nextId + 1));

  return nextId;
};

export const completeDopamineDetox = async (
  sessionId: number,
  userId: number,
  difficultyRating: number,
  notes?: string
) => {
  const sessionsData = await AsyncStorage.getItem(DOPAMINE_DETOX_SESSIONS_KEY);
  const sessions = sessionsData ? JSON.parse(sessionsData) : [];
  const sessionIndex = sessions.findIndex((s: any) => s.id === sessionId);

  if (sessionIndex !== -1) {
    // Mark session as completed
    sessions[sessionIndex] = {
      ...sessions[sessionIndex],
      completed: true,
      end_date: new Date().toISOString(),
      difficulty_rating: difficultyRating,
      notes: notes || '',
    };
    await AsyncStorage.setItem(DOPAMINE_DETOX_SESSIONS_KEY, JSON.stringify(sessions));
  }

  // Update mental progress
  const progress: any = await getMentalProgress(userId);
  if (!progress) {
    await createMentalProgress(userId);
  }

  await updateMentalProgress(userId, {
    dopamine_detox_count: (progress?.dopamine_detox_count || 0) + 1,
    last_detox_date: new Date().toISOString().split('T')[0],
  });
};

export const getCurrentDetoxSession = async (userId: number) => {
  const data = await AsyncStorage.getItem(DOPAMINE_DETOX_SESSIONS_KEY);
  const sessions = data ? JSON.parse(data) : [];

  const currentSessions = sessions
    .filter((s: any) => s.user_id === userId && s.completed === false)
    .sort((a: any, b: any) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());

  return currentSessions[0] || null;
};

export const getDetoxHistory = async (userId: number) => {
  const data = await AsyncStorage.getItem(DOPAMINE_DETOX_SESSIONS_KEY);
  const sessions = data ? JSON.parse(data) : [];

  return sessions
    .filter((s: any) => s.user_id === userId && s.completed === true)
    .sort((a: any, b: any) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
};

// =====================
// MORNING ROUTINE
// =====================

export const logMorningRoutine = async (
  userId: number,
  data: {
    routineDate: string;
    wakeTime?: string;
    sunlightExposure: boolean;
    coldShower: boolean;
    meditation: boolean;
    exercise: boolean;
    noPhoneFirstHour: boolean;
  }
) => {
  const routinesData = await AsyncStorage.getItem(MORNING_ROUTINES_KEY);
  const routines = routinesData ? JSON.parse(routinesData) : [];

  // Calculate completion percentage
  const activities = [
    data.sunlightExposure,
    data.coldShower,
    data.meditation,
    data.exercise,
    data.noPhoneFirstHour,
  ];
  const completedCount = activities.filter((a) => a).length;
  const completionPercentage = Math.round((completedCount / activities.length) * 100);

  // Check if routine already exists for this date
  const existingIndex = routines.findIndex(
    (r: any) => r.user_id === userId && r.routine_date === data.routineDate
  );

  if (existingIndex !== -1) {
    // Update existing routine
    const existing = routines[existingIndex];
    routines[existingIndex] = {
      ...existing,
      wake_time: data.wakeTime || existing.wake_time,
      sunlight_exposure: data.sunlightExposure,
      cold_shower: data.coldShower,
      meditation: data.meditation,
      exercise: data.exercise,
      no_phone_first_hour: data.noPhoneFirstHour,
      completion_percentage: completionPercentage,
    };
  } else {
    // Create new routine
    const nextIdData = await AsyncStorage.getItem(MORNING_ROUTINES_NEXT_ID_KEY);
    const nextId = nextIdData ? parseInt(nextIdData) : 1;

    routines.push({
      id: nextId,
      user_id: userId,
      routine_date: data.routineDate,
      wake_time: data.wakeTime || null,
      sunlight_exposure: data.sunlightExposure,
      cold_shower: data.coldShower,
      meditation: data.meditation,
      exercise: data.exercise,
      no_phone_first_hour: data.noPhoneFirstHour,
      completion_percentage: completionPercentage,
      created_at: new Date().toISOString(),
    });

    await AsyncStorage.setItem(MORNING_ROUTINES_NEXT_ID_KEY, String(nextId + 1));
  }

  await AsyncStorage.setItem(MORNING_ROUTINES_KEY, JSON.stringify(routines));
  return completionPercentage;
};

export const getMorningRoutineForDate = async (userId: number, date: string) => {
  const data = await AsyncStorage.getItem(MORNING_ROUTINES_KEY);
  const routines = data ? JSON.parse(data) : [];
  return routines.find((r: any) => r.user_id === userId && r.routine_date === date) || null;
};

export const getMorningRoutineHistory = async (userId: number, days: number = 7) => {
  const data = await AsyncStorage.getItem(MORNING_ROUTINES_KEY);
  const routines = data ? JSON.parse(data) : [];

  return routines
    .filter((r: any) => r.user_id === userId)
    .sort((a: any, b: any) => new Date(b.routine_date).getTime() - new Date(a.routine_date).getTime())
    .slice(0, days);
};

// =====================
// MEDITATION
// =====================

export const logMeditationSession = async (
  userId: number,
  data: {
    durationMinutes: number;
    type?: string;
    qualityRating?: number;
    notes?: string;
  }
) => {
  const sessionsData = await AsyncStorage.getItem(MEDITATION_SESSIONS_KEY);
  const sessions = sessionsData ? JSON.parse(sessionsData) : [];
  const nextIdData = await AsyncStorage.getItem(MEDITATION_SESSIONS_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  const newSession = {
    id: nextId,
    user_id: userId,
    session_date: new Date().toISOString(),
    duration_minutes: data.durationMinutes,
    type: data.type || 'mindfulness',
    quality_rating: data.qualityRating || null,
    notes: data.notes || '',
    created_at: new Date().toISOString(),
  };

  sessions.push(newSession);
  await AsyncStorage.setItem(MEDITATION_SESSIONS_KEY, JSON.stringify(sessions));
  await AsyncStorage.setItem(MEDITATION_SESSIONS_NEXT_ID_KEY, String(nextId + 1));
};

export const getMeditationHistory = async (userId: number, limit: number = 10) => {
  const data = await AsyncStorage.getItem(MEDITATION_SESSIONS_KEY);
  const sessions = data ? JSON.parse(data) : [];

  return sessions
    .filter((s: any) => s.user_id === userId)
    .sort((a: any, b: any) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime())
    .slice(0, limit);
};

export const getMeditationStats = async (userId: number) => {
  const data = await AsyncStorage.getItem(MEDITATION_SESSIONS_KEY);
  const sessions = data ? JSON.parse(data) : [];
  const userSessions = sessions.filter((s: any) => s.user_id === userId);

  const totalSessions = userSessions.length;
  const totalMinutes = userSessions.reduce((sum: number, s: any) => sum + s.duration_minutes, 0);

  // Calculate sessions from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thisWeek = userSessions.filter(
    (s: any) => new Date(s.session_date) >= sevenDaysAgo
  ).length;

  return {
    totalSessions,
    totalMinutes,
    thisWeek,
  };
};
