import { getDatabase } from './init';
import { MENTAL_FOUNDATIONS } from '../types/mental';
import { getCompletedLessons } from './lessons';

// =====================
// MENTAL HEALTH PROGRESS
// =====================

export const getMentalProgress = async (userId: number) => {
  const db = await getDatabase();
  const result = await db.getFirstAsync(
    'SELECT * FROM mental_progress WHERE user_id = ?',
    [userId]
  );
  return result;
};

export const createMentalProgress = async (userId: number) => {
  const db = await getDatabase();
  await db.runAsync(
    'INSERT INTO mental_progress (user_id) VALUES (?)',
    [userId]
  );
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
  const db = await getDatabase();
  const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), userId];

  await db.runAsync(
    `UPDATE mental_progress SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
    values
  );
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
  const db = await getDatabase();

  // Check if log already exists for this date
  const existing: any = await db.getFirstAsync(
    'SELECT * FROM screen_time_logs WHERE user_id = ? AND log_date = ?',
    [userId, data.logDate]
  );

  if (existing) {
    // Update existing log
    await db.runAsync(
      'UPDATE screen_time_logs SET total_minutes = ?, app_usage = ?, notes = ? WHERE id = ?',
      [data.totalMinutes, data.appUsage || '', data.notes || '', existing.id]
    );
  } else {
    // Create new log
    await db.runAsync(
      'INSERT INTO screen_time_logs (user_id, log_date, total_minutes, app_usage, notes) VALUES (?, ?, ?, ?, ?)',
      [userId, data.logDate, data.totalMinutes, data.appUsage || '', data.notes || '']
    );
  }
};

export const getScreenTimeForDate = async (userId: number, date: string) => {
  const db = await getDatabase();
  return await db.getFirstAsync(
    'SELECT * FROM screen_time_logs WHERE user_id = ? AND log_date = ?',
    [userId, date]
  );
};

export const getScreenTimeHistory = async (userId: number, days: number = 7) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT * FROM screen_time_logs
     WHERE user_id = ?
     ORDER BY log_date DESC
     LIMIT ?`,
    [userId, days]
  );
};

// =====================
// DOPAMINE DETOX
// =====================

export const startDopamineDetox = async (
  userId: number,
  durationHours: number = 24
) => {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO dopamine_detox_sessions (user_id, start_date, duration_hours) VALUES (?, ?, ?)',
    [userId, new Date().toISOString(), durationHours]
  );

  return result.lastInsertRowId;
};

export const completeDopamineDetox = async (
  sessionId: number,
  userId: number,
  difficultyRating: number,
  notes?: string
) => {
  const db = await getDatabase();

  // Mark session as completed
  await db.runAsync(
    'UPDATE dopamine_detox_sessions SET completed = 1, end_date = ?, difficulty_rating = ?, notes = ? WHERE id = ?',
    [new Date().toISOString(), difficultyRating, notes || '', sessionId]
  );

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
  const db = await getDatabase();
  return await db.getFirstAsync(
    'SELECT * FROM dopamine_detox_sessions WHERE user_id = ? AND completed = 0 ORDER BY start_date DESC LIMIT 1',
    [userId]
  );
};

export const getDetoxHistory = async (userId: number) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM dopamine_detox_sessions WHERE user_id = ? AND completed = 1 ORDER BY start_date DESC',
    [userId]
  );
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
  const db = await getDatabase();

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
  const existing: any = await db.getFirstAsync(
    'SELECT * FROM morning_routines WHERE user_id = ? AND routine_date = ?',
    [userId, data.routineDate]
  );

  if (existing) {
    // Update existing routine
    await db.runAsync(
      `UPDATE morning_routines SET
        wake_time = ?,
        sunlight_exposure = ?,
        cold_shower = ?,
        meditation = ?,
        exercise = ?,
        no_phone_first_hour = ?,
        completion_percentage = ?
       WHERE id = ?`,
      [
        data.wakeTime || existing.wake_time,
        data.sunlightExposure ? 1 : 0,
        data.coldShower ? 1 : 0,
        data.meditation ? 1 : 0,
        data.exercise ? 1 : 0,
        data.noPhoneFirstHour ? 1 : 0,
        completionPercentage,
        existing.id,
      ]
    );
  } else {
    // Create new routine
    await db.runAsync(
      `INSERT INTO morning_routines
        (user_id, routine_date, wake_time, sunlight_exposure, cold_shower, meditation, exercise, no_phone_first_hour, completion_percentage)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        data.routineDate,
        data.wakeTime || null,
        data.sunlightExposure ? 1 : 0,
        data.coldShower ? 1 : 0,
        data.meditation ? 1 : 0,
        data.exercise ? 1 : 0,
        data.noPhoneFirstHour ? 1 : 0,
        completionPercentage,
      ]
    );
  }

  return completionPercentage;
};

export const getMorningRoutineForDate = async (userId: number, date: string) => {
  const db = await getDatabase();
  return await db.getFirstAsync(
    'SELECT * FROM morning_routines WHERE user_id = ? AND routine_date = ?',
    [userId, date]
  );
};

export const getMorningRoutineHistory = async (userId: number, days: number = 7) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    `SELECT * FROM morning_routines
     WHERE user_id = ?
     ORDER BY routine_date DESC
     LIMIT ?`,
    [userId, days]
  );
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
  const db = await getDatabase();

  await db.runAsync(
    'INSERT INTO meditation_sessions (user_id, session_date, duration_minutes, type, quality_rating, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [
      userId,
      new Date().toISOString(),
      data.durationMinutes,
      data.type || 'mindfulness',
      data.qualityRating || null,
      data.notes || '',
    ]
  );
};

export const getMeditationHistory = async (userId: number, limit: number = 10) => {
  const db = await getDatabase();
  return await db.getAllAsync(
    'SELECT * FROM meditation_sessions WHERE user_id = ? ORDER BY session_date DESC LIMIT ?',
    [userId, limit]
  );
};

export const getMeditationStats = async (userId: number) => {
  const db = await getDatabase();

  const totalSessions: any = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM meditation_sessions WHERE user_id = ?',
    [userId]
  );

  const totalMinutes: any = await db.getFirstAsync(
    'SELECT SUM(duration_minutes) as total FROM meditation_sessions WHERE user_id = ?',
    [userId]
  );

  const thisWeek: any = await db.getFirstAsync(
    `SELECT COUNT(*) as count FROM meditation_sessions
     WHERE user_id = ?
     AND session_date >= date('now', '-7 days')`,
    [userId]
  );

  return {
    totalSessions: totalSessions?.count || 0,
    totalMinutes: totalMinutes?.total || 0,
    thisWeek: thisWeek?.count || 0,
  };
};
