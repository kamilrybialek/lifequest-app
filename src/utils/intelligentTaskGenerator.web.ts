/**
 * Intelligent Task Generator v2.0 - WEB VERSION
 * AsyncStorage-based implementation for web platform
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFinanceProgress } from '../database/finance.web';
import { getMentalProgress } from '../database/mental.web';
import { getPhysicalProgress } from '../database/physical.web';
import { getNutritionProgress } from '../database/nutrition.web';
import { getCompletedLessons } from '../database/lessons.web';
import { MENTAL_FOUNDATIONS } from '../types/mental';
import { PHYSICAL_FOUNDATIONS } from '../types/physical';
import { NUTRITION_FOUNDATIONS } from '../types/nutrition';

export interface SmartTask {
  id: string;
  pillar: 'finance' | 'mental' | 'physical' | 'nutrition';
  title: string;
  description: string;
  action_type: 'lesson' | 'tool' | 'habit' | 'challenge';
  action_screen?: string;
  action_params?: Record<string, any>;
  duration: number;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: number;
  streak_eligible: boolean;
  completed: boolean;
}

/**
 * Main entry point - generates intelligent daily tasks for WEB
 */
export const generateIntelligentTasks = async (userId: number): Promise<SmartTask[]> => {
  const tasks: SmartTask[] = [];

  try {
    // Load all user progress data in parallel
    const [
      financeProgress,
      mentalProgress,
      physicalProgress,
      nutritionProgress,
      completedLessonIds,
    ] = await Promise.all([
      getFinanceProgress(userId),
      getMentalProgress(userId),
      getPhysicalProgress(userId),
      getNutritionProgress(userId),
      getCompletedLessons(userId),
    ]);

    console.log('📊 Progress loaded:', {
      finance: financeProgress?.current_step,
      mental: mentalProgress?.current_foundation,
      physical: physicalProgress?.current_foundation,
      nutrition: nutritionProgress?.current_foundation,
      completedLessons: completedLessonIds.length,
    });

    // Generate tasks for each pillar
    const financeTasks = await generateFinanceGoalTasks(userId, financeProgress);
    const mentalTasks = await generateMentalGoalTasks(userId, mentalProgress, completedLessonIds);
    const physicalTasks = await generatePhysicalGoalTasks(userId, physicalProgress, completedLessonIds);
    const nutritionTasks = await generateNutritionGoalTasks(userId, nutritionProgress, completedLessonIds);

    tasks.push(...financeTasks, ...mentalTasks, ...physicalTasks, ...nutritionTasks);

    // Balance and prioritize
    const balancedTasks = balanceAndPrioritize(tasks);

    console.log(`✅ Generated ${balancedTasks.length} intelligent tasks`);
    return balancedTasks;
  } catch (error) {
    console.error('❌ Error generating intelligent tasks:', error);
    return [];
  }
};

const generateFinanceGoalTasks = async (userId: number, progress: any): Promise<SmartTask[]> => {
  const tasks: SmartTask[] = [];
  const currentStep = progress?.current_step || 1;

  // Baby Step 1: Emergency Fund
  if (currentStep === 1) {
    const current = progress?.emergency_fund_current || 0;
    const goal = progress?.emergency_fund_goal || 1000;
    const percentComplete = (current / goal) * 100;

    if (percentComplete < 100) {
      const remaining = goal - current;
      const suggestedSave = Math.min(50, Math.ceil(remaining / 20));

      tasks.push({
        id: `finance-emergency-${Date.now()}`,
        pillar: 'finance',
        title: `Save $${suggestedSave} to Emergency Fund`,
        description: `You're ${percentComplete.toFixed(0)}% there! Only $${remaining.toFixed(0)} to go.`,
        action_type: 'tool',
        action_screen: 'EmergencyFundScreen',
        duration: 5,
        points: 20,
        difficulty: 'easy',
        priority: 10,
        streak_eligible: true,
        completed: false,
      });
    }
  }

  // Baby Step 2: Debt Snowball
  if (currentStep === 2) {
    tasks.push({
      id: `finance-debt-${Date.now()}`,
      pillar: 'finance',
      title: 'Make Extra Debt Payment',
      description: 'Attack your smallest debt with intensity!',
      action_type: 'tool',
      action_screen: 'DebtTrackerScreen',
      duration: 10,
      points: 25,
      difficulty: 'medium',
      priority: 9,
      streak_eligible: true,
      completed: false,
    });
  }

  // Daily expense tracking
  tasks.push({
    id: `finance-expense-${Date.now()}`,
    pillar: 'finance',
    title: 'Log Today\'s Expenses',
    description: 'Track every dollar to stay in control',
    action_type: 'tool',
    action_screen: 'ExpenseLoggerScreen',
    duration: 5,
    points: 10,
    difficulty: 'easy',
    priority: 7,
    streak_eligible: true,
    completed: false,
  });

  // Path lesson
  tasks.push({
    id: `finance-lesson-${Date.now()}`,
    pillar: 'finance',
    title: `Continue Finance Path - Step ${currentStep}`,
    description: 'Learn the next Baby Step principle',
    action_type: 'lesson',
    action_screen: 'FinancePathNew',
    duration: 10,
    points: 30,
    difficulty: 'medium',
    priority: 6,
    streak_eligible: false,
    completed: false,
  });

  return tasks;
};

const generateMentalGoalTasks = async (
  userId: number,
  progress: any,
  completedLessonIds: string[]
): Promise<SmartTask[]> => {
  const tasks: SmartTask[] = [];
  const currentFoundation = progress?.current_foundation || 1;

  // Find next uncompleted lesson
  const foundation = MENTAL_FOUNDATIONS.find(f => f.number === currentFoundation);
  if (foundation) {
    const nextLesson = foundation.lessons.find(l => !completedLessonIds.includes(l.id));

    if (nextLesson) {
      tasks.push({
        id: `mental-lesson-${Date.now()}`,
        pillar: 'mental',
        title: `Complete: ${nextLesson.title}`,
        description: `Foundation ${currentFoundation}: ${foundation.title}`,
        action_type: 'lesson',
        action_screen: 'MentalLessonIntro',
        action_params: {
          lessonId: nextLesson.id,
          lessonTitle: nextLesson.title,
          foundationId: foundation.id,
        },
        duration: nextLesson.estimatedTime || 10,
        points: nextLesson.xp,
        difficulty: 'medium',
        priority: 9,
        streak_eligible: false,
        completed: false,
      });
    }
  }

  // Foundation-specific tools
  if (currentFoundation === 1) {
    tasks.push({
      id: `mental-screentime-${Date.now()}`,
      pillar: 'mental',
      title: 'Track Screen Time Today',
      description: 'Monitor and reduce digital distractions',
      action_type: 'tool',
      action_screen: 'ScreenTimeTracker',
      duration: 5,
      points: 15,
      difficulty: 'easy',
      priority: 8,
      streak_eligible: true,
      completed: false,
    });
  }

  // Daily habits
  tasks.push({
    id: `mental-morning-${Date.now()}`,
    pillar: 'mental',
    title: 'Morning Routine Check-in',
    description: 'Build your optimal morning ritual',
    action_type: 'tool',
    action_screen: 'MorningRoutine',
    duration: 15,
    points: 20,
    difficulty: 'easy',
    priority: 8,
    streak_eligible: true,
    completed: false,
  });

  tasks.push({
    id: `mental-meditation-${Date.now()}`,
    pillar: 'mental',
    title: '10-Minute Meditation',
    description: 'Practice mindfulness and presence',
    action_type: 'tool',
    action_screen: 'MeditationTimer',
    duration: 10,
    points: 15,
    difficulty: 'easy',
    priority: 7,
    streak_eligible: true,
    completed: false,
  });

  return tasks;
};

const generatePhysicalGoalTasks = async (
  userId: number,
  progress: any,
  completedLessonIds: string[]
): Promise<SmartTask[]> => {
  const tasks: SmartTask[] = [];
  const currentFoundation = progress?.current_foundation || 1;

  // Next lesson
  const foundation = PHYSICAL_FOUNDATIONS.find(f => f.number === currentFoundation);
  if (foundation) {
    const nextLesson = foundation.lessons.find(l => !completedLessonIds.includes(l.id));

    if (nextLesson) {
      tasks.push({
        id: `physical-lesson-${Date.now()}`,
        pillar: 'physical',
        title: `Learn: ${nextLesson.title}`,
        description: `${foundation.title} - Foundation ${currentFoundation}`,
        action_type: 'lesson',
        action_screen: 'PhysicalLessonIntro',
        action_params: {
          lessonId: nextLesson.id,
          lessonTitle: nextLesson.title,
          foundationId: foundation.id,
        },
        duration: nextLesson.estimatedTime || 10,
        points: nextLesson.xp,
        difficulty: 'medium',
        priority: 8,
        streak_eligible: false,
        completed: false,
      });
    }
  }

  // Daily workout
  tasks.push({
    id: `physical-workout-${Date.now()}`,
    pillar: 'physical',
    title: 'Log Today\'s Workout',
    description: 'Track any physical activity',
    action_type: 'tool',
    action_screen: 'WorkoutTrackerScreen',
    duration: 5,
    points: 20,
    difficulty: 'easy',
    priority: 9,
    streak_eligible: true,
    completed: false,
  });

  tasks.push({
    id: `physical-exercise-${Date.now()}`,
    pillar: 'physical',
    title: '20-Minute Movement Session',
    description: 'Get your body moving',
    action_type: 'tool',
    action_screen: 'ExerciseLoggerScreen',
    duration: 20,
    points: 25,
    difficulty: 'medium',
    priority: 7,
    streak_eligible: true,
    completed: false,
  });

  return tasks;
};

const generateNutritionGoalTasks = async (
  userId: number,
  progress: any,
  completedLessonIds: string[]
): Promise<SmartTask[]> => {
  const tasks: SmartTask[] = [];
  const currentFoundation = progress?.current_foundation || 1;

  // Next lesson
  const foundation = NUTRITION_FOUNDATIONS.find(f => f.number === currentFoundation);
  if (foundation) {
    const nextLesson = foundation.lessons.find(l => !completedLessonIds.includes(l.id));

    if (nextLesson) {
      tasks.push({
        id: `nutrition-lesson-${Date.now()}`,
        pillar: 'nutrition',
        title: `Study: ${nextLesson.title}`,
        description: `${foundation.title} - Foundation ${currentFoundation}`,
        action_type: 'lesson',
        action_screen: 'NutritionLessonIntro',
        action_params: {
          lessonId: nextLesson.id,
          lessonTitle: nextLesson.title,
          foundationId: foundation.id,
        },
        duration: nextLesson.estimatedTime || 10,
        points: nextLesson.xp,
        difficulty: 'medium',
        priority: 7,
        streak_eligible: false,
        completed: false,
      });
    }
  }

  // Meal logging
  tasks.push({
    id: `nutrition-meals-${Date.now()}`,
    pillar: 'nutrition',
    title: 'Log All Meals Today',
    description: 'Track breakfast, lunch, dinner, and snacks',
    action_type: 'tool',
    action_screen: 'MealLoggerScreen',
    duration: 10,
    points: 25,
    difficulty: 'easy',
    priority: 10,
    streak_eligible: true,
    completed: false,
  });

  tasks.push({
    id: `nutrition-water-${Date.now()}`,
    pillar: 'nutrition',
    title: 'Track Water Intake',
    description: 'Monitor hydration throughout the day',
    action_type: 'tool',
    action_screen: 'WaterTrackerScreen',
    duration: 2,
    points: 10,
    difficulty: 'easy',
    priority: 8,
    streak_eligible: true,
    completed: false,
  });

  return tasks;
};

const balanceAndPrioritize = (tasks: SmartTask[]): SmartTask[] => {
  const byPillar = {
    finance: tasks.filter(t => t.pillar === 'finance'),
    mental: tasks.filter(t => t.pillar === 'mental'),
    physical: tasks.filter(t => t.pillar === 'physical'),
    nutrition: tasks.filter(t => t.pillar === 'nutrition'),
  };

  const balanced: SmartTask[] = [];

  // Take 2 from each pillar (1 lesson + 1 tool/habit)
  Object.entries(byPillar).forEach(([pillar, pillarTasks]) => {
    const sorted = pillarTasks.sort((a, b) => b.priority - a.priority);

    const lessonOrChallenge = sorted.find(t => t.action_type === 'lesson' || t.action_type === 'challenge');
    if (lessonOrChallenge) balanced.push(lessonOrChallenge);

    const toolOrHabit = sorted.find(t =>
      (t.action_type === 'tool' || t.action_type === 'habit') &&
      t !== lessonOrChallenge
    );
    if (toolOrHabit) balanced.push(toolOrHabit);
  });

  return balanced.sort((a, b) => b.priority - a.priority);
};

/**
 * Save tasks to AsyncStorage for web
 */
export const saveTasks = async (tasks: SmartTask[]): Promise<void> => {
  try {
    await AsyncStorage.setItem('daily_smart_tasks', JSON.stringify(tasks));
    console.log(`💾 Saved ${tasks.length} smart tasks to AsyncStorage`);
  } catch (error) {
    console.error('Error saving tasks:', error);
  }
};

/**
 * Load tasks from AsyncStorage
 */
export const loadTasks = async (): Promise<SmartTask[]> => {
  try {
    const data = await AsyncStorage.getItem('daily_smart_tasks');
    if (data) {
      const tasks = JSON.parse(data);
      console.log(`📥 Loaded ${tasks.length} smart tasks from AsyncStorage`);
      return tasks;
    }
    return [];
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
};

/**
 * Export for use in stores
 */
export const getSmartTasksForToday = async (userId: number): Promise<SmartTask[]> => {
  console.log('🧠 Generating intelligent tasks for user:', userId);
  const tasks = await generateIntelligentTasks(userId);
  await saveTasks(tasks);
  return tasks;
};
