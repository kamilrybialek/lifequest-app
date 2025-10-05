import { getDatabase } from './init';
import { addXP, updateStreak } from './user';

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
  const db = await getDatabase();

  // Weighted random selection
  const tasks = await db.getAllAsync<RandomActionTask>(`
    SELECT * FROM random_action_tasks
    WHERE is_active = 1
    ORDER BY RANDOM()
    LIMIT ?
  `, [count]);

  return tasks || [];
};

// Get random action tasks by pillar
export const getRandomActionTasksByPillar = async (
  pillar: string,
  count: number = 3
): Promise<RandomActionTask[]> => {
  const db = await getDatabase();

  const tasks = await db.getAllAsync<RandomActionTask>(`
    SELECT * FROM random_action_tasks
    WHERE pillar = ? AND is_active = 1
    ORDER BY RANDOM()
    LIMIT ?
  `, [pillar, count]);

  return tasks || [];
};

// Get all random action tasks (for admin)
export const getAllRandomActionTasks = async (): Promise<RandomActionTask[]> => {
  const db = await getDatabase();

  const tasks = await db.getAllAsync<RandomActionTask>(`
    SELECT * FROM random_action_tasks
    ORDER BY pillar, difficulty, title
  `);

  return tasks || [];
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
  const db = await getDatabase();

  const result = await db.runAsync(`
    INSERT INTO random_action_tasks (pillar, title, description, duration_minutes, xp_reward, difficulty, icon, weight)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    task.pillar,
    task.title,
    task.description,
    task.duration_minutes,
    task.xp_reward,
    task.difficulty,
    task.icon || '⭐',
    task.weight || 1,
  ]);

  return result.lastInsertRowId;
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
  const db = await getDatabase();

  const fields: string[] = [];
  const values: any[] = [];

  if (task.title !== undefined) {
    fields.push('title = ?');
    values.push(task.title);
  }
  if (task.description !== undefined) {
    fields.push('description = ?');
    values.push(task.description);
  }
  if (task.duration_minutes !== undefined) {
    fields.push('duration_minutes = ?');
    values.push(task.duration_minutes);
  }
  if (task.xp_reward !== undefined) {
    fields.push('xp_reward = ?');
    values.push(task.xp_reward);
  }
  if (task.difficulty !== undefined) {
    fields.push('difficulty = ?');
    values.push(task.difficulty);
  }
  if (task.icon !== undefined) {
    fields.push('icon = ?');
    values.push(task.icon);
  }
  if (task.weight !== undefined) {
    fields.push('weight = ?');
    values.push(task.weight);
  }
  if (task.is_active !== undefined) {
    fields.push('is_active = ?');
    values.push(task.is_active ? 1 : 0);
  }

  if (fields.length === 0) return;

  values.push(id);

  await db.runAsync(`
    UPDATE random_action_tasks
    SET ${fields.join(', ')}
    WHERE id = ?
  `, values);
};

// Delete random action task (admin)
export const deleteRandomActionTask = async (id: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync('UPDATE random_action_tasks SET is_active = 0 WHERE id = ?', [id]);
};

// Complete a random action task (track for user)
export const completeRandomActionTask = async (
  userId: number,
  taskId: number
): Promise<void> => {
  const db = await getDatabase();

  // Get task details
  const task = await db.getFirstAsync<RandomActionTask>(
    'SELECT * FROM random_action_tasks WHERE id = ?',
    [taskId]
  );

  if (!task) return;

  // Add XP using proper function
  const { totalXP, level } = await addXP(userId, task.xp_reward);

  // Update streak for the pillar
  const pillar = task.pillar as 'finance' | 'mental' | 'physical' | 'nutrition';
  const { streak } = await updateStreak(userId, pillar);

  // Log activity
  await db.runAsync(`
    INSERT INTO user_activity (user_id, activity_type, activity_data)
    VALUES (?, ?, ?)
  `, [
    userId,
    'random_action_completed',
    JSON.stringify({
      task_id: taskId,
      title: task.title,
      pillar: task.pillar,
      xp: task.xp_reward,
      new_total_xp: totalXP,
      new_level: level,
      new_streak: streak,
    })
  ]);

  console.log(`✅ Task completed: ${task.title} (+${task.xp_reward} XP, Level ${level}, ${pillar} streak: ${streak})`);
};

// Get task statistics
export const getRandomTaskStats = async (): Promise<{
  total: number;
  byPillar: { pillar: string; count: number }[];
  byDifficulty: { difficulty: string; count: number }[];
}> => {
  const db = await getDatabase();

  const total = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM random_action_tasks WHERE is_active = 1'
  );

  const byPillar = await db.getAllAsync<{ pillar: string; count: number }>(`
    SELECT pillar, COUNT(*) as count
    FROM random_action_tasks
    WHERE is_active = 1
    GROUP BY pillar
  `);

  const byDifficulty = await db.getAllAsync<{ difficulty: string; count: number }>(`
    SELECT difficulty, COUNT(*) as count
    FROM random_action_tasks
    WHERE is_active = 1
    GROUP BY difficulty
  `);

  return {
    total: total?.count || 0,
    byPillar: byPillar || [],
    byDifficulty: byDifficulty || [],
  };
};
