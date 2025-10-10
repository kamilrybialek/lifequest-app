import { getDatabase } from './init';

export interface LessonProgressData {
  lessonId: string;
  stepId: string;
  pillar?: string;
  completed: boolean;
  currentPhase?: string;
  sectionsCompleted?: number;
  totalSections?: number;
  quizScore?: number;
  quizTotal?: number;
  actionAnswer?: string;
  xpEarned: number;
  completedAt?: string;
}

export interface QuizQuestionResult {
  lessonId: string;
  questionId: string;
  questionType: string;
  userAnswer: string;
  isCorrect: boolean;
  xpEarned: number;
  timeSpentSeconds?: number;
  attemptNumber?: number;
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
     (user_id, lesson_id, step_id, pillar, completed, current_phase,
      sections_completed, total_sections, quiz_score, quiz_total,
      action_answer, xp_earned, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.lessonId,
      data.stepId,
      data.pillar || 'finance',
      data.completed ? 1 : 0,
      data.currentPhase || 'intro',
      data.sectionsCompleted || 0,
      data.totalSections || 0,
      data.quizScore || 0,
      data.quizTotal || 0,
      data.actionAnswer || null,
      data.xpEarned,
      data.completedAt || new Date().toISOString(),
    ]
  );

  console.log(`✅ Lesson progress saved: ${data.lessonId}`);
};

/**
 * Mark a lesson as completed (simple helper)
 */
export const completeLesson = async (
  userId: number,
  lessonId: string,
  xpEarned: number
): Promise<void> => {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT OR REPLACE INTO lesson_progress
     (user_id, lesson_id, step_id, pillar, completed, xp_earned, completed_at)
     VALUES (?, ?, ?, ?, 1, ?, ?)`,
    [
      userId,
      lessonId,
      lessonId.split('-')[0], // Extract step_id from lesson_id (e.g., "foundation1" from "foundation1-lesson1")
      'nutrition',
      xpEarned,
      new Date().toISOString(),
    ]
  );

  console.log(`✅ Lesson completed: ${lessonId} (+${xpEarned} XP)`);
};

/**
 * Save quiz question result
 */
export const saveQuizQuestionResult = async (
  userId: number,
  data: QuizQuestionResult
): Promise<void> => {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO quiz_question_results
     (user_id, lesson_id, question_id, question_type, user_answer,
      is_correct, xp_earned, time_spent_seconds, attempt_number)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.lessonId,
      data.questionId,
      data.questionType,
      data.userAnswer,
      data.isCorrect ? 1 : 0,
      data.xpEarned,
      data.timeSpentSeconds || 0,
      data.attemptNumber || 1,
    ]
  );
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

  // Total lessons per step (varies by step)
  const lessonCounts: { [key: string]: number } = {
    step1: 4,
    step2: 5,
    step3: 6,
    step4: 5,
    step5: 5,
    step6: 4,
    step7: 4,
    step8: 4,
    step9: 4,
    step10: 6,
  };

  return {
    completed: result?.count || 0,
    total: lessonCounts[stepId] || 4,
  };
};

/**
 * Get lesson progress details
 */
export const getLessonProgress = async (
  userId: number,
  lessonId: string
): Promise<LessonProgressData | null> => {
  const db = await getDatabase();

  const result = await db.getFirstAsync<any>(
    `SELECT * FROM lesson_progress
     WHERE user_id = ? AND lesson_id = ?`,
    [userId, lessonId]
  );

  if (!result) return null;

  return {
    lessonId: result.lesson_id,
    stepId: result.step_id,
    pillar: result.pillar,
    completed: result.completed === 1,
    currentPhase: result.current_phase,
    sectionsCompleted: result.sections_completed,
    totalSections: result.total_sections,
    quizScore: result.quiz_score,
    quizTotal: result.quiz_total,
    actionAnswer: result.action_answer,
    xpEarned: result.xp_earned,
    completedAt: result.completed_at,
  };
};

/**
 * Get quiz analytics for a lesson
 */
export const getLessonQuizAnalytics = async (
  userId: number,
  lessonId: string
): Promise<{
  totalQuestions: number;
  correctAnswers: number;
  totalXP: number;
  averageTime: number;
}> => {
  const db = await getDatabase();

  const result = await db.getFirstAsync<any>(
    `SELECT
       COUNT(*) as total_questions,
       SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
       SUM(xp_earned) as total_xp,
       AVG(time_spent_seconds) as avg_time
     FROM quiz_question_results
     WHERE user_id = ? AND lesson_id = ?`,
    [userId, lessonId]
  );

  return {
    totalQuestions: result?.total_questions || 0,
    correctAnswers: result?.correct_answers || 0,
    totalXP: result?.total_xp || 0,
    averageTime: result?.avg_time || 0,
  };
};

/**
 * Get next incomplete lesson in a step
 */
export const getNextIncompleteLesson = async (
  userId: number,
  stepId: string
): Promise<string | null> => {
  const db = await getDatabase();

  // Get all lessons for this step from the database
  const completedLessons = await db.getAllAsync<{ lesson_id: string }>(
    `SELECT lesson_id FROM lesson_progress
     WHERE user_id = ? AND step_id = ? AND completed = 1
     ORDER BY completed_at ASC`,
    [userId, stepId]
  );

  const completedIds = completedLessons.map((l) => l.lesson_id);

  // Generate expected lesson IDs for this step
  const lessonCounts: { [key: string]: number } = {
    step1: 4, step2: 5, step3: 6, step4: 5, step5: 5,
    step6: 4, step7: 4, step8: 4, step9: 4, step10: 6,
  };

  const totalLessons = lessonCounts[stepId] || 4;

  for (let i = 1; i <= totalLessons; i++) {
    const lessonId = `${stepId}-lesson${i}`;
    if (!completedIds.includes(lessonId)) {
      return lessonId;
    }
  }

  return null; // All lessons completed
};
