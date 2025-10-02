import { getDatabase } from './init';

export interface LessonProgressData {
  lessonId: string;
  stepId: string;
  completed: boolean;
  answer?: string;
  xpEarned: number;
  completedAt?: string;
}

/**
 * Save or update lesson progress
 */
export const saveLessonProgress = async (
  userId: number,
  data: LessonProgressData
): Promise<void> => {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT OR REPLACE INTO lesson_progress
     (user_id, lesson_id, step_id, completed, answer, xp_earned, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.lessonId,
      data.stepId,
      data.completed ? 1 : 0,
      data.answer || null,
      data.xpEarned,
      data.completedAt || new Date().toISOString(),
    ]
  );

  console.log(`✅ Lesson progress saved: ${data.lessonId}`);
};

/**
 * Get all completed lessons for a user
 */
export const getCompletedLessons = async (userId: number): Promise<string[]> => {
  const db = await getDatabase();

  const result = await db.getAllAsync<{ lesson_id: string }>(
    `SELECT lesson_id FROM lesson_progress
     WHERE user_id = ? AND completed = 1`,
    [userId]
  );

  return result.map((row) => row.lesson_id);
};

/**
 * Get progress for a specific step (all lessons in that step)
 */
export const getStepProgress = async (
  userId: number,
  stepId: string
): Promise<LessonProgressData[]> => {
  const db = await getDatabase();

  const result = await db.getAllAsync<any>(
    `SELECT * FROM lesson_progress
     WHERE user_id = ? AND step_id = ?
     ORDER BY completed_at ASC`,
    [userId, stepId]
  );

  return result.map((row) => ({
    lessonId: row.lesson_id,
    stepId: row.step_id,
    completed: row.completed === 1,
    answer: row.answer,
    xpEarned: row.xp_earned,
    completedAt: row.completed_at,
  }));
};

/**
 * Check if a lesson is completed
 */
export const isLessonCompleted = async (
  userId: number,
  lessonId: string
): Promise<boolean> => {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ completed: number }>(
    `SELECT completed FROM lesson_progress
     WHERE user_id = ? AND lesson_id = ?`,
    [userId, lessonId]
  );

  return result?.completed === 1;
};

/**
 * Get total XP earned from lessons
 */
export const getTotalLessonXP = async (userId: number): Promise<number> => {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ total: number }>(
    `SELECT SUM(xp_earned) as total FROM lesson_progress
     WHERE user_id = ? AND completed = 1`,
    [userId]
  );

  return result?.total || 0;
};

/**
 * Get count of completed lessons in a step
 */
export const getStepCompletionCount = async (
  userId: number,
  stepId: string
): Promise<{ completed: number; total: number }> => {
  const db = await getDatabase();

  const result = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM lesson_progress
     WHERE user_id = ? AND step_id = ? AND completed = 1`,
    [userId, stepId]
  );

  // Total lessons per step
  const totalLessonsPerStep = 4; // All steps now have 4 lessons

  return {
    completed: result?.count || 0,
    total: totalLessonsPerStep,
  };
};
