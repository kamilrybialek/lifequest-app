import AsyncStorage from '@react-native-async-storage/async-storage';

const RANDOM_TASKS_KEY = 'lifequest.db:random_action_tasks';
const NEXT_ID_KEY = 'lifequest.db:random_action_tasks:next_id';
const ACTIVITY_KEY = 'lifequest.db:user_activity';
const ACTIVITY_NEXT_ID_KEY = 'lifequest.db:user_activity:next_id';

// ===== RANDOM ACTION TASKS =====

export interface RandomActionTask {
  id: number;
  pillar: 'finance' | 'mental' | 'physical' | 'nutrition';
  title: string;
  description: string;
  duration_minutes: number;
  xp_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  action_type: string;
  icon: string;
  is_active: number;
  weight: number;
}

// Get random action tasks for home screen (3-5 tasks)
export const getRandomActionTasks = async (count: number = 4): Promise<RandomActionTask[]> => {
  const data = await AsyncStorage.getItem(RANDOM_TASKS_KEY);
  const allTasks: RandomActionTask[] = data ? JSON.parse(data) : [];

  // Filter active tasks
  const activeTasks = allTasks.filter(task => task.is_active === 1);

  // Shuffle and return random selection
  const shuffled = activeTasks.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get random action tasks by pillar
export const getRandomActionTasksByPillar = async (
  pillar: string,
  count: number = 3
): Promise<RandomActionTask[]> => {
  const data = await AsyncStorage.getItem(RANDOM_TASKS_KEY);
  const allTasks: RandomActionTask[] = data ? JSON.parse(data) : [];

  const pillarTasks = allTasks.filter(task => task.pillar === pillar && task.is_active === 1);
  const shuffled = pillarTasks.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Get all random action tasks (for admin)
export const getAllRandomActionTasks = async (): Promise<RandomActionTask[]> => {
  const data = await AsyncStorage.getItem(RANDOM_TASKS_KEY);
  const tasks: RandomActionTask[] = data ? JSON.parse(data) : [];

  // Sort by pillar, difficulty, title
  return tasks.sort((a, b) => {
    if (a.pillar !== b.pillar) return a.pillar.localeCompare(b.pillar);
    if (a.difficulty !== b.difficulty) return a.difficulty.localeCompare(b.difficulty);
    return a.title.localeCompare(b.title);
  });
};

// Create random action task (admin)
export const createRandomActionTask = async (task: {
  pillar: string;
  title: string;
  description: string;
  duration_minutes: number;
  xp_reward: number;
  difficulty: string;
  icon?: string;
  weight?: number;
}): Promise<number> => {
  const data = await AsyncStorage.getItem(RANDOM_TASKS_KEY);
  const tasks: RandomActionTask[] = data ? JSON.parse(data) : [];

  const nextIdData = await AsyncStorage.getItem(NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 51; // Start after seeded tasks

  const newTask: RandomActionTask = {
    id: nextId,
    pillar: task.pillar as any,
    title: task.title,
    description: task.description,
    duration_minutes: task.duration_minutes,
    xp_reward: task.xp_reward,
    difficulty: task.difficulty as any,
    action_type: 'instant',
    icon: task.icon || '⭐',
    is_active: 1,
    weight: task.weight || 1,
  };

  tasks.push(newTask);
  await AsyncStorage.setItem(RANDOM_TASKS_KEY, JSON.stringify(tasks));
  await AsyncStorage.setItem(NEXT_ID_KEY, String(nextId + 1));

  return nextId;
};

// Update random action task (admin)
export const updateRandomActionTask = async (
  id: number,
  task: Partial<{
    title: string;
    description: string;
    duration_minutes: number;
    xp_reward: number;
    difficulty: string;
    icon: string;
    weight: number;
    is_active: boolean;
  }>
): Promise<void> => {
  const data = await AsyncStorage.getItem(RANDOM_TASKS_KEY);
  const tasks: RandomActionTask[] = data ? JSON.parse(data) : [];

  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex !== -1) {
    const updates: any = {};
    if (task.title !== undefined) updates.title = task.title;
    if (task.description !== undefined) updates.description = task.description;
    if (task.duration_minutes !== undefined) updates.duration_minutes = task.duration_minutes;
    if (task.xp_reward !== undefined) updates.xp_reward = task.xp_reward;
    if (task.difficulty !== undefined) updates.difficulty = task.difficulty;
    if (task.icon !== undefined) updates.icon = task.icon;
    if (task.weight !== undefined) updates.weight = task.weight;
    if (task.is_active !== undefined) updates.is_active = task.is_active ? 1 : 0;

    tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
    await AsyncStorage.setItem(RANDOM_TASKS_KEY, JSON.stringify(tasks));
  }
};

// Delete random action task (admin)
export const deleteRandomActionTask = async (id: number): Promise<void> => {
  const data = await AsyncStorage.getItem(RANDOM_TASKS_KEY);
  const tasks: RandomActionTask[] = data ? JSON.parse(data) : [];

  const filtered = tasks.filter(t => t.id !== id);
  await AsyncStorage.setItem(RANDOM_TASKS_KEY, JSON.stringify(filtered));
};

// Delete ALL random action tasks (admin - for cleanup)
export const deleteAllRandomActionTasks = async (): Promise<void> => {
  await AsyncStorage.setItem(RANDOM_TASKS_KEY, JSON.stringify([]));
  console.log('✅ All random action tasks deleted');
};

// Remove duplicate tasks (admin - cleanup utility)
export const removeDuplicateRandomTasks = async (): Promise<number> => {
  const data = await AsyncStorage.getItem(RANDOM_TASKS_KEY);
  const tasks: RandomActionTask[] = data ? JSON.parse(data) : [];

  // Keep only unique title+pillar combinations
  const unique = new Map();
  tasks.forEach(task => {
    const key = `${task.title}:${task.pillar}`;
    if (!unique.has(key)) {
      unique.set(key, task);
    }
  });

  const uniqueTasks = Array.from(unique.values());
  await AsyncStorage.setItem(RANDOM_TASKS_KEY, JSON.stringify(uniqueTasks));

  console.log(`✅ Duplicates removed. Remaining tasks: ${uniqueTasks.length}`);
  return uniqueTasks.length;
};

// Complete a random action task (track for user)
export const completeRandomActionTask = async (
  userId: number,
  taskId: number
): Promise<void> => {
  const data = await AsyncStorage.getItem(RANDOM_TASKS_KEY);
  const tasks: RandomActionTask[] = data ? JSON.parse(data) : [];

  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  // Import XP and streak functions
  const { addXP, updateStreak } = require('./user.web');

  // Add XP to user
  const { totalXP, level } = await addXP(userId, task.xp_reward);

  // Update streak for pillar
  const pillar = task.pillar as 'finance' | 'mental' | 'physical' | 'nutrition';
  const { streak, isNewDay } = await updateStreak(userId, pillar);

  // Log activity
  const activityData = await AsyncStorage.getItem(ACTIVITY_KEY);
  const activities = activityData ? JSON.parse(activityData) : [];

  const nextIdData = await AsyncStorage.getItem(ACTIVITY_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  activities.push({
    id: nextId,
    user_id: userId,
    activity_type: 'random_action_completed',
    activity_data: JSON.stringify({
      task_id: taskId,
      title: task.title,
      pillar: task.pillar,
      xp: task.xp_reward,
      new_total_xp: totalXP,
      new_level: level,
      new_streak: streak,
      streak_updated: isNewDay,
    }),
    created_at: new Date().toISOString(),
  });

  await AsyncStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
  await AsyncStorage.setItem(ACTIVITY_NEXT_ID_KEY, String(nextId + 1));

  console.log(`✅ Task completed: ${task.title} (+${task.xp_reward} XP, Level ${level}, ${pillar} streak: ${streak})`);
};

// Get task statistics
export const getRandomTaskStats = async (): Promise<{
  total: number;
  byPillar: { pillar: string; count: number }[];
  byDifficulty: { difficulty: string; count: number }[];
}> => {
  const data = await AsyncStorage.getItem(RANDOM_TASKS_KEY);
  const tasks: RandomActionTask[] = data ? JSON.parse(data) : [];

  const activeTasks = tasks.filter(t => t.is_active === 1);

  // Count by pillar
  const pillarCounts = new Map<string, number>();
  activeTasks.forEach(task => {
    pillarCounts.set(task.pillar, (pillarCounts.get(task.pillar) || 0) + 1);
  });

  // Count by difficulty
  const difficultyCounts = new Map<string, number>();
  activeTasks.forEach(task => {
    difficultyCounts.set(task.difficulty, (difficultyCounts.get(task.difficulty) || 0) + 1);
  });

  return {
    total: activeTasks.length,
    byPillar: Array.from(pillarCounts.entries()).map(([pillar, count]) => ({ pillar, count })),
    byDifficulty: Array.from(difficultyCounts.entries()).map(([difficulty, count]) => ({ difficulty, count })),
  };
};
