/**
 * Central export for all finance lesson content
 * 10 Steps Method - Marcin Iwuć Philosophy
 */

import { STEP1_LESSON_CONTENTS } from './step1Content';
import { STEP2_LESSON_CONTENTS } from './step2Content';
import { STEP3_LESSON_CONTENTS } from './step3Content';
import { STEPS_4_TO_10_CONTENT } from './steps4-10Content';
import { LessonContent } from '../../types/financeNew';

// Combine all lesson contents
export const ALL_LESSON_CONTENTS: { [key: string]: LessonContent } = {
  ...STEP1_LESSON_CONTENTS,
  ...STEP2_LESSON_CONTENTS,
  ...STEP3_LESSON_CONTENTS,
  ...STEPS_4_TO_10_CONTENT,
};

// Helper function to get lesson content by ID
export const getLessonContent = (lessonId: string): LessonContent | null => {
  return ALL_LESSON_CONTENTS[lessonId] || null;
};

// Helper to check if lesson has content
export const hasLessonContent = (lessonId: string): boolean => {
  return lessonId in ALL_LESSON_CONTENTS;
};

// Export individual step contents for direct import if needed
export {
  STEP1_LESSON_CONTENTS,
  STEP2_LESSON_CONTENTS,
  STEP3_LESSON_CONTENTS,
  STEPS_4_TO_10_CONTENT,
};
