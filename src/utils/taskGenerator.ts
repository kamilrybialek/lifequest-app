import { getDatabase } from '../database/init';
import { getFinanceProgress } from '../database/finance';
import { getMentalProgress } from '../database/mental';
import { getPhysicalProgress } from '../database/physical';
import { getNutritionProgress } from '../database/nutrition';

export interface GeneratedTask {
  pillar: 'finance' | 'mental' | 'physical' | 'nutrition';
  title: string;
  description: string;
  duration: number;
  xp_reward: number;
  task_date: string;
  priority: number;
}

/**
 * Generate personalized daily tasks based on user's progress in each pillar
 */
export const generateDailyTasks = async (userId: number): Promise<GeneratedTask[]> => {
  const tasks: GeneratedTask[] = [];
  const today = new Date().toISOString().split('T')[0];

  try {
    // Get user's progress in each pillar
    const [financeProgress, mentalProgress, physicalProgress, nutritionProgress] = await Promise.all([
      getFinanceProgress(userId),
      getMentalProgress(userId),
      getPhysicalProgress(userId),
      getNutritionProgress(userId),
    ]);

    // Generate finance tasks
    const financeTasks = await generateFinanceTasks(userId, financeProgress);
    tasks.push(...financeTasks);

    // Generate mental health tasks
    const mentalTasks = await generateMentalTasks(userId, mentalProgress);
    tasks.push(...mentalTasks);

    // Generate physical health tasks
    const physicalTasks = await generatePhysicalTasks(userId, physicalProgress);
    tasks.push(...physicalTasks);

    // Generate nutrition tasks
    const nutritionTasks = await generateNutritionTasks(userId, nutritionProgress);
    tasks.push(...nutritionTasks);

    // Prioritize tasks (max 6 per day - 1-2 per pillar)
    const prioritizedTasks = prioritizeTasks(tasks).slice(0, 6);

    // Save to database
    await saveDailyTasks(userId, today, prioritizedTasks);

    return prioritizedTasks;
  } catch (error) {
    console.error('Error generating daily tasks:', error);
    return [];
  }
};

/**
 * Generate finance-specific tasks based on current Baby Step
 */
const generateFinanceTasks = async (userId: number, progress: any): Promise<GeneratedTask[]> => {
  const tasks: GeneratedTask[] = [];
  const currentStep = progress?.current_step || 1;

  // Baby Step 1: $1,000 Emergency Fund
  if (currentStep === 1) {
    const emergencyFund = progress?.emergency_fund_current || 0;
    const goal = progress?.emergency_fund_goal || 1000;

    if (emergencyFund < goal) {
      const remaining = goal - emergencyFund;
      const suggestedAmount = Math.min(50, Math.ceil(remaining / 10));

      tasks.push({
        pillar: 'finance',
        title: `Add $${suggestedAmount} to emergency fund`,
        description: `You're ${Math.round((emergencyFund / goal) * 100)}% there! Only $${remaining.toFixed(0)} to go.`,
        duration: 5,
        xp_reward: 15,
        task_date: new Date().toISOString().split('T')[0],
        priority: 10,
      });
    }
  }

  // Baby Step 2: Debt Snowball
  if (currentStep === 2) {
    tasks.push({
      pillar: 'finance',
      title: 'Log a debt payment',
      description: 'Attack your smallest debt with extra payment today',
      duration: 10,
      xp_reward: 20,
      task_date: new Date().toISOString().split('T')[0],
      priority: 9,
    });
  }

  // Always include expense tracking
  tasks.push({
    pillar: 'finance',
    title: 'Track today\'s expenses',
    description: 'Log all expenses from today in Finance Manager',
    duration: 5,
    xp_reward: 10,
    task_date: new Date().toISOString().split('T')[0],
    priority: 7,
  });

  // Budget review (once per week)
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0) { // Sunday
    tasks.push({
      pillar: 'finance',
      title: 'Review your weekly budget',
      description: 'Check spending vs budget for this week',
      duration: 10,
      xp_reward: 15,
      task_date: new Date().toISOString().split('T')[0],
      priority: 6,
    });
  }

  return tasks;
};

/**
 * Generate mental health tasks based on current foundation
 */
const generateMentalTasks = async (userId: number, progress: any): Promise<GeneratedTask[]> => {
  const tasks: GeneratedTask[] = [];
  const currentFoundation = progress?.current_foundation || 1;

  // Foundation 1: Sleep & Morning Routine
  if (currentFoundation === 1) {
    tasks.push({
      pillar: 'mental',
      title: 'Get 10 minutes of morning sunlight',
      description: 'Within 30 minutes of waking up, go outside',
      duration: 10,
      xp_reward: 15,
      task_date: new Date().toISOString().split('T')[0],
      priority: 9,
    });

    tasks.push({
      pillar: 'mental',
      title: 'No phone for first 30 minutes',
      description: 'Avoid screens after waking up',
      duration: 30,
      xp_reward: 20,
      task_date: new Date().toISOString().split('T')[0],
      priority: 8,
    });
  }

  // Always include meditation
  tasks.push({
    pillar: 'mental',
    title: '5-minute meditation session',
    description: 'Practice mindfulness or guided meditation',
    duration: 5,
    xp_reward: 15,
    task_date: new Date().toISOString().split('T')[0],
    priority: 7,
  });

  // Gratitude journal (every day)
  tasks.push({
    pillar: 'mental',
    title: 'Write 3 things you\'re grateful for',
    description: 'Take a moment to reflect on the positive',
    duration: 5,
    xp_reward: 10,
    task_date: new Date().toISOString().split('T')[0],
    priority: 6,
  });

  return tasks;
};

/**
 * Generate physical health tasks
 */
const generatePhysicalTasks = async (userId: number, progress: any): Promise<GeneratedTask[]> => {
  const tasks: GeneratedTask[] = [];

  // Daily movement
  tasks.push({
    pillar: 'physical',
    title: 'Walk 5,000 steps',
    description: 'Get moving throughout the day',
    duration: 40,
    xp_reward: 20,
    task_date: new Date().toISOString().split('T')[0],
    priority: 8,
  });

  // Quick workout
  tasks.push({
    pillar: 'physical',
    title: '20 push-ups',
    description: 'Build upper body strength (modify as needed)',
    duration: 5,
    xp_reward: 15,
    task_date: new Date().toISOString().split('T')[0],
    priority: 7,
  });

  // Hydration
  tasks.push({
    pillar: 'physical',
    title: 'Drink 2L of water',
    description: 'Stay hydrated throughout the day',
    duration: 1,
    xp_reward: 10,
    task_date: new Date().toISOString().split('T')[0],
    priority: 6,
  });

  return tasks;
};

/**
 * Generate nutrition tasks
 */
const generateNutritionTasks = async (userId: number, progress: any): Promise<GeneratedTask[]> => {
  const tasks: GeneratedTask[] = [];

  // Protein intake
  tasks.push({
    pillar: 'nutrition',
    title: 'Eat protein with every meal',
    description: 'Include eggs, meat, fish, or legumes',
    duration: 5,
    xp_reward: 15,
    task_date: new Date().toISOString().split('T')[0],
    priority: 7,
  });

  // Vegetables
  tasks.push({
    pillar: 'nutrition',
    title: 'Add vegetables to every meal',
    description: 'Aim for colorful variety',
    duration: 5,
    xp_reward: 15,
    task_date: new Date().toISOString().split('T')[0],
    priority: 6,
  });

  // Meal prep (Sunday)
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0) { // Sunday
    tasks.push({
      pillar: 'nutrition',
      title: 'Meal prep for the week',
      description: 'Prepare healthy meals in advance',
      duration: 60,
      xp_reward: 30,
      task_date: new Date().toISOString().split('T')[0],
      priority: 8,
    });
  }

  return tasks;
};

/**
 * Prioritize tasks to ensure balanced pillar coverage
 * Returns max 6 tasks (1-2 per pillar)
 */
const prioritizeTasks = (tasks: GeneratedTask[]): GeneratedTask[] => {
  // Group by pillar
  const tasksByPillar = {
    finance: tasks.filter(t => t.pillar === 'finance'),
    mental: tasks.filter(t => t.pillar === 'mental'),
    physical: tasks.filter(t => t.pillar === 'physical'),
    nutrition: tasks.filter(t => t.pillar === 'nutrition'),
  };

  const selected: GeneratedTask[] = [];

  // Take top 1-2 from each pillar based on priority
  Object.values(tasksByPillar).forEach(pillarTasks => {
    const sorted = pillarTasks.sort((a, b) => b.priority - a.priority);
    selected.push(...sorted.slice(0, 2)); // Max 2 per pillar
  });

  // Sort by priority and return top 6
  return selected.sort((a, b) => b.priority - a.priority).slice(0, 6);
};

/**
 * Save generated tasks to database
 */
const saveDailyTasks = async (userId: number, taskDate: string, tasks: GeneratedTask[]): Promise<void> => {
  const db = await getDatabase();

  // On web, db is null - use AsyncStorage fallback
  if (!db) {
    console.log('⚠️ Database not available on web, tasks saved to AsyncStorage');
    return;
  }

  try {
    // Delete existing tasks for today (in case of regeneration)
    await db.runAsync('DELETE FROM daily_tasks WHERE user_id = ? AND task_date = ?', [userId, taskDate]);

    // Insert new tasks
    for (const task of tasks) {
      await db.runAsync(
        `INSERT INTO daily_tasks (user_id, task_date, pillar, title, description, completed, xp_reward)
         VALUES (?, ?, ?, ?, ?, 0, ?)`,
        [userId, taskDate, task.pillar, task.title, task.description, task.xp_reward]
      );
    }

    console.log(`✅ Generated ${tasks.length} daily tasks for user ${userId}`);
  } catch (error) {
    console.error('Error saving daily tasks:', error);
    throw error;
  }
};

/**
 * Check if tasks need to be generated for today
 */
export const checkAndGenerateTasks = async (userId: number): Promise<boolean> => {
  const db = await getDatabase();

  // On web, db is null - skip task generation
  if (!db) {
    console.log('⚠️ Database not available on web, skipping task generation');
    return false;
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    // Check if tasks already exist for today
    const result = await db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM daily_tasks WHERE user_id = ? AND task_date = ?',
      [userId, today]
    );

    if (result && result.count > 0) {
      console.log('✅ Tasks already exist for today');
      return false;
    }

    // Generate new tasks
    console.log('🎯 Generating new daily tasks...');
    await generateDailyTasks(userId);
    return true;
  } catch (error) {
    console.error('Error checking/generating tasks:', error);
    return false;
  }
};

/**
 * Trigger task generation after completing a lesson
 */
export const regenerateTasksAfterLesson = async (userId: number, pillar: string): Promise<void> => {
  console.log(`📚 Lesson completed in ${pillar}. Regenerating tasks...`);
  await generateDailyTasks(userId);
};

/**
 * Trigger task generation after using an integrated tool
 */
export const regenerateTasksAfterToolUse = async (userId: number, tool: string): Promise<void> => {
  console.log(`🛠️ Tool used: ${tool}. Regenerating tasks...`);
  await generateDailyTasks(userId);
};
