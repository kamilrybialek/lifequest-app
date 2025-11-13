/**
 * Intelligent Task Generator v2.0
 *
 * This system generates personalized, goal-oriented daily tasks that:
 * 1. Adapt to user's current progress in each pillar
 * 2. Link directly to integrated tools for easy completion
 * 3. Balance short-term wins with long-term goals
 * 4. Create a cohesive journey towards user's objectives
 */

import { getDatabase } from '../database/init';
import { getFinanceProgress } from '../database/finance';
import { getMentalProgress } from '../database/mental';
import { getPhysicalProgress } from '../database/physical';
import { getNutritionProgress } from '../database/nutrition';
import { getCompletedLessons } from '../database/lessons';
import { MENTAL_FOUNDATIONS } from '../types/mental';
import { PHYSICAL_FOUNDATIONS } from '../types/physical';
import { NUTRITION_FOUNDATIONS } from '../types/nutrition';

export interface SmartTask {
  pillar: 'finance' | 'mental' | 'physical' | 'nutrition';
  title: string;
  description: string;
  action_type: 'lesson' | 'tool' | 'habit' | 'challenge';
  action_screen?: string; // Screen to navigate to
  action_params?: Record<string, any>; // Parameters for navigation
  duration: number; // Minutes
  xp_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  priority: number; // 1-10, higher = more important
  streak_eligible: boolean; // Does it count towards pillar streak?
}

/**
 * Main entry point - generates intelligent daily tasks
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

    // Generate tasks for each pillar
    const financeTasks = await generateFinanceGoalTasks(userId, financeProgress);
    const mentalTasks = await generateMentalGoalTasks(userId, mentalProgress, completedLessonIds);
    const physicalTasks = await generatePhysicalGoalTasks(userId, physicalProgress, completedLessonIds);
    const nutritionTasks = await generateNutritionGoalTasks(userId, nutritionProgress, completedLessonIds);

    tasks.push(...financeTasks, ...mentalTasks, ...physicalTasks, ...nutritionTasks);

    // Intelligently prioritize and balance tasks
    const balancedTasks = balanceAndPrioritize(tasks);

    return balancedTasks;
  } catch (error) {
    console.error('❌ Error generating intelligent tasks:', error);
    return [];
  }
};

/**
 * Finance: Goal-driven tasks based on Baby Steps & user's financial situation
 */
const generateFinanceGoalTasks = async (userId: number, progress: any): Promise<SmartTask[]> => {
  const tasks: SmartTask[] = [];
  const currentStep = progress?.current_step || 1;

  // Baby Step 1: Emergency Fund - Make it actionable with tool
  if (currentStep === 1) {
    const current = progress?.emergency_fund_current || 0;
    const goal = progress?.emergency_fund_goal || 1000;
    const percentComplete = (current / goal) * 100;

    if (percentComplete < 100) {
      const remaining = goal - current;
      const suggestedSave = Math.min(50, Math.ceil(remaining / 20));

      tasks.push({
        pillar: 'finance',
        title: `Save $${suggestedSave} to Emergency Fund`,
        description: `You're ${percentComplete.toFixed(0)}% there! Only $${remaining.toFixed(0)} to go.`,
        action_type: 'tool',
        action_screen: 'EmergencyFund',
        duration: 5,
        xp_reward: 20,
        difficulty: 'easy',
        priority: 10,
        streak_eligible: true,
      });
    }
  }

  // Baby Step 2: Debt Snowball
  if (currentStep === 2) {
    tasks.push({
      pillar: 'finance',
      title: 'Make Extra Debt Payment',
      description: 'Attack your smallest debt with intensity!',
      action_type: 'tool',
      action_screen: 'DebtTracker',
      duration: 10,
      xp_reward: 25,
      difficulty: 'medium',
      priority: 9,
      streak_eligible: true,
    });
  }

  // Daily expense tracking - links to tool
  tasks.push({
    pillar: 'finance',
    title: 'Log Today\'s Expenses',
    description: 'Track every dollar to stay in control',
    action_type: 'tool',
    action_screen: 'ExpenseLogger',
    duration: 5,
    xp_reward: 10,
    difficulty: 'easy',
    priority: 7,
    streak_eligible: true,
  });

  // Weekly budget review (Sunday)
  if (new Date().getDay() === 0) {
    tasks.push({
      pillar: 'finance',
      title: 'Review & Plan Weekly Budget',
      description: 'Analyze last week, plan for the next',
      action_type: 'tool',
      action_screen: 'BudgetManager',
      duration: 15,
      xp_reward: 20,
      difficulty: 'medium',
      priority: 8,
      streak_eligible: true,
    });
  }

  // Continue path lessons
  tasks.push({
    pillar: 'finance',
    title: `Continue Finance Path - Step ${currentStep}`,
    description: 'Learn the next Baby Step principle',
    action_type: 'lesson',
    action_screen: 'FinancePathNew',
    duration: 10,
    xp_reward: 30,
    difficulty: 'medium',
    priority: 6,
    streak_eligible: false,
  });

  return tasks;
};

/**
 * Mental: Tasks based on current foundation and lesson progress
 */
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
        xp_reward: nextLesson.xp,
        difficulty: 'medium',
        priority: 9,
        streak_eligible: false,
      });
    }
  }

  // Foundation-specific tool tasks
  if (currentFoundation === 1) {
    // Dopamine Regulation
    tasks.push({
      pillar: 'mental',
      title: 'Track Screen Time Today',
      description: 'Monitor and reduce digital distractions',
      action_type: 'tool',
      action_screen: 'ScreenTimeTracker',
      duration: 5,
      xp_reward: 15,
      difficulty: 'easy',
      priority: 8,
      streak_eligible: true,
    });

    tasks.push({
      pillar: 'mental',
      title: 'Start Dopamine Detox Challenge',
      description: '24-hour reset for your reward system',
      action_type: 'challenge',
      action_screen: 'DopamineDetox',
      duration: 1440, // 24 hours
      xp_reward: 50,
      difficulty: 'hard',
      priority: 7,
      streak_eligible: true,
    });
  }

  // Daily habits - always beneficial
  tasks.push({
    pillar: 'mental',
    title: 'Morning Routine Check-in',
    description: 'Build your optimal morning ritual',
    action_type: 'tool',
    action_screen: 'MorningRoutine',
    duration: 15,
    xp_reward: 20,
    difficulty: 'easy',
    priority: 8,
    streak_eligible: true,
  });

  tasks.push({
    pillar: 'mental',
    title: '10-Minute Meditation',
    description: 'Practice mindfulness and presence',
    action_type: 'tool',
    action_screen: 'MeditationTimer',
    duration: 10,
    xp_reward: 15,
    difficulty: 'easy',
    priority: 7,
    streak_eligible: true,
  });

  // Habit: Gratitude (simple, no tool needed)
  tasks.push({
    pillar: 'mental',
    title: 'List 3 Things You\'re Grateful For',
    description: 'Cultivate positive mindset',
    action_type: 'habit',
    duration: 3,
    xp_reward: 10,
    difficulty: 'easy',
    priority: 6,
    streak_eligible: true,
  });

  return tasks;
};

/**
 * Physical: Workout tracking and health metrics
 */
const generatePhysicalGoalTasks = async (
  userId: number,
  progress: any,
  completedLessonIds: string[]
): Promise<SmartTask[]> => {
  const tasks: SmartTask[] = [];
  const currentFoundation = progress?.current_foundation || 1;

  // Next lesson from current foundation
  const foundation = PHYSICAL_FOUNDATIONS.find(f => f.number === currentFoundation);
  if (foundation) {
    const nextLesson = foundation.lessons.find(l => !completedLessonIds.includes(l.id));

    if (nextLesson) {
      tasks.push({
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
        xp_reward: nextLesson.xp,
        difficulty: 'medium',
        priority: 8,
        streak_eligible: false,
      });
    }
  }

  // Daily workout logging
  tasks.push({
    pillar: 'physical',
    title: 'Log Today\'s Workout',
    description: 'Track any physical activity (even a walk counts!)',
    action_type: 'tool',
    action_screen: 'WorkoutTracker',
    duration: 5,
    xp_reward: 20,
    difficulty: 'easy',
    priority: 9,
    streak_eligible: true,
  });

  // Quick exercise log
  tasks.push({
    pillar: 'physical',
    title: '20-Minute Movement Session',
    description: 'Get your body moving - track it!',
    action_type: 'tool',
    action_screen: 'ExerciseLogger',
    duration: 20,
    xp_reward: 25,
    difficulty: 'medium',
    priority: 7,
    streak_eligible: true,
  });

  // Sleep tracking (evening task)
  const hour = new Date().getHours();
  if (hour >= 20 || hour < 6) {
    tasks.push({
      pillar: 'physical',
      title: 'Log Last Night\'s Sleep',
      description: 'Track sleep quality and duration',
      action_type: 'tool',
      action_screen: 'SleepTracker',
      duration: 3,
      xp_reward: 15,
      difficulty: 'easy',
      priority: 7,
      streak_eligible: true,
    });
  }

  // Weekly body measurements (Monday)
  if (new Date().getDay() === 1) {
    tasks.push({
      pillar: 'physical',
      title: 'Update Body Measurements',
      description: 'Track weight, BMI, and progress',
      action_type: 'tool',
      action_screen: 'BodyMeasurements',
      duration: 5,
      xp_reward: 15,
      difficulty: 'easy',
      priority: 8,
      streak_eligible: true,
    });
  }

  // Hydration habit
  tasks.push({
    pillar: 'physical',
    title: 'Drink 2 Liters of Water',
    description: 'Stay hydrated for optimal performance',
    action_type: 'habit',
    duration: 1,
    xp_reward: 10,
    difficulty: 'easy',
    priority: 6,
    streak_eligible: true,
  });

  return tasks;
};

/**
 * Nutrition: Meal logging and diet tracking
 */
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
        xp_reward: nextLesson.xp,
        difficulty: 'medium',
        priority: 7,
        streak_eligible: false,
      });
    }
  }

  // Meal logging - most important daily task
  tasks.push({
    pillar: 'nutrition',
    title: 'Log All Meals Today',
    description: 'Track breakfast, lunch, dinner, and snacks',
    action_type: 'tool',
    action_screen: 'MealLogger',
    duration: 10,
    xp_reward: 25,
    difficulty: 'easy',
    priority: 10,
    streak_eligible: true,
  });

  // Water tracking
  tasks.push({
    pillar: 'nutrition',
    title: 'Track Water Intake',
    description: 'Monitor hydration throughout the day',
    action_type: 'tool',
    action_screen: 'WaterTracker',
    duration: 2,
    xp_reward: 10,
    difficulty: 'easy',
    priority: 8,
    streak_eligible: true,
  });

  // Calorie calculation (weekly - Wednesday)
  if (new Date().getDay() === 3) {
    tasks.push({
      pillar: 'nutrition',
      title: 'Recalculate Your Calorie Needs',
      description: 'Update TDEE based on current weight and activity',
      action_type: 'tool',
      action_screen: 'CalorieCalculator',
      duration: 5,
      xp_reward: 15,
      difficulty: 'easy',
      priority: 7,
      streak_eligible: false,
    });
  }

  // Habit: Protein with every meal
  tasks.push({
    pillar: 'nutrition',
    title: 'Eat Protein with Every Meal',
    description: 'Eggs, meat, fish, or legumes',
    action_type: 'habit',
    duration: 5,
    xp_reward: 15,
    difficulty: 'easy',
    priority: 7,
    streak_eligible: true,
  });

  // Sunday meal prep
  if (new Date().getDay() === 0) {
    tasks.push({
      pillar: 'nutrition',
      title: 'Meal Prep for the Week',
      description: 'Prepare healthy meals in advance',
      action_type: 'habit',
      duration: 60,
      xp_reward: 40,
      difficulty: 'hard',
      priority: 9,
      streak_eligible: true,
    });
  }

  return tasks;
};

/**
 * Balance tasks across pillars and prioritize intelligently
 * Returns 6-8 tasks optimized for daily completion
 */
const balanceAndPrioritize = (tasks: SmartTask[]): SmartTask[] => {
  // Group by pillar
  const byPillar = {
    finance: tasks.filter(t => t.pillar === 'finance'),
    mental: tasks.filter(t => t.pillar === 'mental'),
    physical: tasks.filter(t => t.pillar === 'physical'),
    nutrition: tasks.filter(t => t.pillar === 'nutrition'),
  };

  const balanced: SmartTask[] = [];

  // Strategy: 2 from each pillar (1 lesson/challenge + 1 tool/habit)
  Object.entries(byPillar).forEach(([pillar, pillarTasks]) => {
    const sorted = pillarTasks.sort((a, b) => b.priority - a.priority);

    // First: Get highest priority lesson or challenge
    const lessonOrChallenge = sorted.find(t => t.action_type === 'lesson' || t.action_type === 'challenge');
    if (lessonOrChallenge) balanced.push(lessonOrChallenge);

    // Second: Get highest priority tool or habit
    const toolOrHabit = sorted.find(t =>
      (t.action_type === 'tool' || t.action_type === 'habit') &&
      t !== lessonOrChallenge
    );
    if (toolOrHabit) balanced.push(toolOrHabit);
  });

  // Sort final list by priority
  return balanced.sort((a, b) => b.priority - a.priority);
};

/**
 * Export for use in stores and components
 */
export const getSmartTasksForToday = async (userId: number): Promise<SmartTask[]> => {
  console.log('🧠 Generating intelligent tasks for user:', userId);
  const tasks = await generateIntelligentTasks(userId);
  console.log(`✅ Generated ${tasks.length} smart tasks`);
  return tasks;
};
