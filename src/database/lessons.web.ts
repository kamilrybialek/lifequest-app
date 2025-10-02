import AsyncStorage from '@react-native-async-storage/async-storage';

const LESSON_PROGRESS_KEY = 'lifequest.db:lesson_progress';
const LESSON_PROGRESS_NEXT_ID_KEY = 'lifequest.db:lesson_progress:next_id';

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
  const progressData = await AsyncStorage.getItem(LESSON_PROGRESS_KEY);
  const progressArray = progressData ? JSON.parse(progressData) : [];

  // Find existing progress entry
  const existingIndex = progressArray.findIndex(
    (p: any) => p.user_id === userId && p.lesson_id === data.lessonId && p.step_id === data.stepId
  );

  const progressEntry = {
    user_id: userId,
    lesson_id: data.lessonId,
    step_id: data.stepId,
    completed: data.completed,
    answer: data.answer || null,
    xp_earned: data.xpEarned,
    completed_at: data.completedAt || new Date().toISOString(),
  };

  if (existingIndex !== -1) {
    // Update existing entry (INSERT OR REPLACE behavior)
    progressArray[existingIndex] = { ...progressArray[existingIndex], ...progressEntry };
  } else {
    // Create new entry
    const nextIdData = await AsyncStorage.getItem(LESSON_PROGRESS_NEXT_ID_KEY);
    const nextId = nextIdData ? parseInt(nextIdData) : 1;

    progressArray.push({ id: nextId, ...progressEntry });
    await AsyncStorage.setItem(LESSON_PROGRESS_NEXT_ID_KEY, String(nextId + 1));
  }

  await AsyncStorage.setItem(LESSON_PROGRESS_KEY, JSON.stringify(progressArray));
  console.log(`✅ Lesson progress saved: ${data.lessonId}`);
};

/**
 * Get all completed lessons for a user
 */
export const getCompletedLessons = async (userId: number): Promise<string[]> => {
  const data = await AsyncStorage.getItem(LESSON_PROGRESS_KEY);
  const progressArray = data ? JSON.parse(data) : [];

  return progressArray
    .filter((p: any) => p.user_id === userId && p.completed === true)
    .map((p: any) => p.lesson_id);
};

/**
 * Get progress for a specific step (all lessons in that step)
 */
export const getStepProgress = async (
  userId: number,
  stepId: string
): Promise<LessonProgressData[]> => {
  const data = await AsyncStorage.getItem(LESSON_PROGRESS_KEY);
  const progressArray = data ? JSON.parse(data) : [];

  return progressArray
    .filter((p: any) => p.user_id === userId && p.step_id === stepId)
    .sort((a: any, b: any) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
    .map((p: any) => ({
      lessonId: p.lesson_id,
      stepId: p.step_id,
      completed: p.completed === true,
      answer: p.answer,
      xpEarned: p.xp_earned,
      completedAt: p.completed_at,
    }));
};

/**
 * Check if a lesson is completed
 */
export const isLessonCompleted = async (
  userId: number,
  lessonId: string
): Promise<boolean> => {
  const data = await AsyncStorage.getItem(LESSON_PROGRESS_KEY);
  const progressArray = data ? JSON.parse(data) : [];

  const progress = progressArray.find(
    (p: any) => p.user_id === userId && p.lesson_id === lessonId
  );

  return progress?.completed === true;
};

/**
 * Get total XP earned from lessons
 */
export const getTotalLessonXP = async (userId: number): Promise<number> => {
  const data = await AsyncStorage.getItem(LESSON_PROGRESS_KEY);
  const progressArray = data ? JSON.parse(data) : [];

  const total = progressArray
    .filter((p: any) => p.user_id === userId && p.completed === true)
    .reduce((sum: number, p: any) => sum + (p.xp_earned || 0), 0);

  return total;
};

/**
 * Get count of completed lessons in a step
 */
export const getStepCompletionCount = async (
  userId: number,
  stepId: string
): Promise<{ completed: number; total: number }> => {
  const data = await AsyncStorage.getItem(LESSON_PROGRESS_KEY);
  const progressArray = data ? JSON.parse(data) : [];

  const completed = progressArray.filter(
    (p: any) => p.user_id === userId && p.step_id === stepId && p.completed === true
  ).length;

  // Total lessons per step
  const totalLessonsPerStep = 4; // All steps now have 4 lessons

  return {
    completed,
    total: totalLessonsPerStep,
  };
};
