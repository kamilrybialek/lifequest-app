import { getDatabase } from './init';

// ========================================
// TYPES
// ========================================

export interface Task {
  id: number;
  user_id: number;
  title: string;
  notes?: string;
  list_id?: number;
  parent_task_id?: number;
  pillar?: 'finance' | 'mental' | 'physical' | 'nutrition';
  priority: 0 | 1 | 2 | 3; // 0=none, 1=low, 2=medium, 3=high
  completed: number;
  due_date?: string;
  due_time?: string;
  reminder_date?: string;
  completed_at?: string;
  xp_reward: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  is_generated: number;
  generation_source?: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
  subtasks?: Task[];
}

export interface TaskList {
  id: number;
  user_id: number;
  name: string;
  icon?: string;
  color?: string;
  is_smart_list: number;
  smart_filter?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  task_count?: number;
}

export interface Tag {
  id: number;
  user_id: number;
  name: string;
  color?: string;
  icon?: string;
  created_at: string;
  task_count?: number;
}

// ========================================
// TASKS CRUD
// ========================================

export const createTask = async (
  userId: number,
  taskData: {
    title: string;
    notes?: string;
    list_id?: number;
    parent_task_id?: number;
    pillar?: 'finance' | 'mental' | 'physical' | 'nutrition';
    priority?: 0 | 1 | 2 | 3;
    due_date?: string;
    due_time?: string;
    reminder_date?: string;
    xp_reward?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    is_generated?: number;
    generation_source?: string;
    tags?: number[]; // Array of tag IDs
  }
): Promise<number> => {
  const db = await getDatabase();

  const result = await db.runAsync(
    `INSERT INTO tasks (
      user_id, title, notes, list_id, parent_task_id, pillar, priority,
      due_date, due_time, reminder_date, xp_reward, difficulty,
      is_generated, generation_source, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      userId,
      taskData.title,
      taskData.notes || null,
      taskData.list_id || null,
      taskData.parent_task_id || null,
      taskData.pillar || null,
      taskData.priority || 0,
      taskData.due_date || null,
      taskData.due_time || null,
      taskData.reminder_date || null,
      taskData.xp_reward || 10,
      taskData.difficulty || null,
      taskData.is_generated || 0,
      taskData.generation_source || null,
    ]
  );

  const taskId = result.lastInsertRowId;

  // Add tags if provided
  if (taskData.tags && taskData.tags.length > 0) {
    for (const tagId of taskData.tags) {
      await db.runAsync(
        'INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)',
        [taskId, tagId]
      );
    }
  }

  return taskId;
};

export const updateTask = async (
  taskId: number,
  updates: Partial<{
    title: string;
    notes: string;
    list_id: number;
    pillar: 'finance' | 'mental' | 'physical' | 'nutrition';
    priority: 0 | 1 | 2 | 3;
    completed: number;
    due_date: string;
    due_time: string;
    reminder_date: string;
    xp_reward: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }>
) => {
  const db = await getDatabase();

  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(', ');

  const values = [...Object.values(updates), taskId];

  await db.runAsync(
    `UPDATE tasks SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values
  );
};

export const toggleTaskComplete = async (taskId: number) => {
  const db = await getDatabase();

  const task: any = await db.getFirstAsync('SELECT completed FROM tasks WHERE id = ?', [taskId]);

  if (!task) return;

  const newStatus = task.completed ? 0 : 1;
  const completedAt = newStatus ? new Date().toISOString() : null;

  await db.runAsync(
    'UPDATE tasks SET completed = ?, completed_at = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [newStatus, completedAt, taskId]
  );

  return newStatus;
};

export const deleteTask = async (taskId: number) => {
  const db = await getDatabase();

  // Delete tags associations
  await db.runAsync('DELETE FROM task_tags WHERE task_id = ?', [taskId]);

  // Delete task (subtasks will be deleted by CASCADE)
  await db.runAsync('DELETE FROM tasks WHERE id = ?', [taskId]);
};

export const getTaskById = async (taskId: number): Promise<Task | null> => {
  const db = await getDatabase();

  const task: any = await db.getFirstAsync('SELECT * FROM tasks WHERE id = ?', [taskId]);

  if (!task) return null;

  // Get tags
  const tags: any[] = await db.getAllAsync(
    `SELECT t.* FROM tags t
     INNER JOIN task_tags tt ON t.id = tt.tag_id
     WHERE tt.task_id = ?`,
    [taskId]
  );

  // Get subtasks
  const subtasks: any[] = await db.getAllAsync(
    'SELECT * FROM tasks WHERE parent_task_id = ? ORDER BY created_at ASC',
    [taskId]
  );

  return {
    ...task,
    tags,
    subtasks,
  };
};

export const getTasks = async (
  userId: number,
  filters?: {
    list_id?: number;
    pillar?: string;
    priority?: number;
    completed?: number;
    due_date?: string;
    tag_id?: number;
    parent_task_id?: number;
    is_generated?: number;
  }
): Promise<Task[]> => {
  const db = await getDatabase();

  let query = 'SELECT * FROM tasks WHERE user_id = ?';
  const params: any[] = [userId];

  if (filters) {
    if (filters.list_id !== undefined) {
      query += ' AND list_id = ?';
      params.push(filters.list_id);
    }

    if (filters.pillar) {
      query += ' AND pillar = ?';
      params.push(filters.pillar);
    }

    if (filters.priority !== undefined) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters.completed !== undefined) {
      query += ' AND completed = ?';
      params.push(filters.completed);
    }

    if (filters.due_date) {
      query += ' AND due_date = ?';
      params.push(filters.due_date);
    }

    if (filters.tag_id) {
      query = `SELECT DISTINCT t.* FROM tasks t
               INNER JOIN task_tags tt ON t.id = tt.task_id
               WHERE t.user_id = ? AND tt.tag_id = ?`;
      params.push(filters.tag_id);
    }

    if (filters.parent_task_id !== undefined) {
      if (filters.parent_task_id === null) {
        query += ' AND parent_task_id IS NULL';
      } else {
        query += ' AND parent_task_id = ?';
        params.push(filters.parent_task_id);
      }
    }

    if (filters.is_generated !== undefined) {
      query += ' AND is_generated = ?';
      params.push(filters.is_generated);
    }
  }

  // Only get parent tasks by default
  if (!filters?.parent_task_id) {
    query += ' AND parent_task_id IS NULL';
  }

  query += ' ORDER BY priority DESC, due_date ASC, created_at DESC';

  const tasks: any[] = await db.getAllAsync(query, params);

  // Load tags for each task
  for (const task of tasks) {
    const tags: any[] = await db.getAllAsync(
      `SELECT t.* FROM tags t
       INNER JOIN task_tags tt ON t.id = tt.tag_id
       WHERE tt.task_id = ?`,
      [task.id]
    );
    task.tags = tags;

    // Load subtasks count
    const subtasksResult: any = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM tasks WHERE parent_task_id = ?',
      [task.id]
    );
    task.subtasks_count = subtasksResult?.count || 0;

    const completedSubtasksResult: any = await db.getFirstAsync(
      'SELECT COUNT(*) as count FROM tasks WHERE parent_task_id = ? AND completed = 1',
      [task.id]
    );
    task.subtasks_completed = completedSubtasksResult?.count || 0;
  }

  return tasks;
};

export const getTasksForToday = async (userId: number): Promise<Task[]> => {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const tasks: any[] = await db.getAllAsync(
    `SELECT * FROM tasks
     WHERE user_id = ?
     AND parent_task_id IS NULL
     AND completed = 0
     AND (due_date = ? OR due_date IS NULL)
     ORDER BY priority DESC, created_at DESC
     LIMIT 20`,
    [userId, today]
  );

  // Load tags for each task
  for (const task of tasks) {
    const tags: any[] = await db.getAllAsync(
      `SELECT t.* FROM tags t
       INNER JOIN task_tags tt ON t.id = tt.tag_id
       WHERE tt.task_id = ?`,
      [task.id]
    );
    task.tags = tags;
  }

  return tasks;
};

export const getScheduledTasks = async (userId: number): Promise<Task[]> => {
  const db = await getDatabase();

  const tasks: any[] = await db.getAllAsync(
    `SELECT * FROM tasks
     WHERE user_id = ?
     AND parent_task_id IS NULL
     AND completed = 0
     AND due_date IS NOT NULL
     ORDER BY due_date ASC, due_time ASC`,
    [userId]
  );

  // Load tags
  for (const task of tasks) {
    const tags: any[] = await db.getAllAsync(
      `SELECT t.* FROM tags t
       INNER JOIN task_tags tt ON t.id = tt.tag_id
       WHERE tt.task_id = ?`,
      [task.id]
    );
    task.tags = tags;
  }

  return tasks;
};

export const getImportantTasks = async (userId: number): Promise<Task[]> => {
  return await getTasks(userId, { completed: 0, priority: 3 });
};

export const getCompletedTasks = async (userId: number, limit: number = 50): Promise<Task[]> => {
  const db = await getDatabase();

  const tasks: any[] = await db.getAllAsync(
    `SELECT * FROM tasks
     WHERE user_id = ?
     AND completed = 1
     AND parent_task_id IS NULL
     ORDER BY completed_at DESC
     LIMIT ?`,
    [userId, limit]
  );

  // Load tags
  for (const task of tasks) {
    const tags: any[] = await db.getAllAsync(
      `SELECT t.* FROM tags t
       INNER JOIN task_tags tt ON t.id = tt.tag_id
       WHERE tt.task_id = ?`,
      [task.id]
    );
    task.tags = tags;
  }

  return tasks;
};

// ========================================
// TASK TAGS
// ========================================

export const addTagToTask = async (taskId: number, tagId: number) => {
  const db = await getDatabase();

  try {
    await db.runAsync('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)', [taskId, tagId]);
  } catch (error) {
    // Ignore duplicate errors
    console.error('Error adding tag to task:', error);
  }
};

export const removeTagFromTask = async (taskId: number, tagId: number) => {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?', [taskId, tagId]);
};

export const setTaskTags = async (taskId: number, tagIds: number[]) => {
  const db = await getDatabase();

  // Remove all existing tags
  await db.runAsync('DELETE FROM task_tags WHERE task_id = ?', [taskId]);

  // Add new tags
  for (const tagId of tagIds) {
    await db.runAsync('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)', [taskId, tagId]);
  }
};

// ========================================
// TAGS CRUD
// ========================================

export const createTag = async (
  userId: number,
  tagData: {
    name: string;
    color?: string;
    icon?: string;
  }
): Promise<number> => {
  const db = await getDatabase();

  const result = await db.runAsync(
    'INSERT INTO tags (user_id, name, color, icon) VALUES (?, ?, ?, ?)',
    [userId, tagData.name, tagData.color || null, tagData.icon || null]
  );

  return result.lastInsertRowId;
};

export const updateTag = async (
  tagId: number,
  updates: {
    name?: string;
    color?: string;
    icon?: string;
  }
) => {
  const db = await getDatabase();

  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(', ');

  const values = [...Object.values(updates), tagId];

  await db.runAsync(`UPDATE tags SET ${fields} WHERE id = ?`, values);
};

export const deleteTag = async (tagId: number) => {
  const db = await getDatabase();

  // Delete tag associations
  await db.runAsync('DELETE FROM task_tags WHERE tag_id = ?', [tagId]);

  // Delete tag
  await db.runAsync('DELETE FROM tags WHERE id = ?', [tagId]);
};

export const getTags = async (userId: number): Promise<Tag[]> => {
  const db = await getDatabase();

  const tags: any[] = await db.getAllAsync(
    'SELECT * FROM tags WHERE user_id = ? ORDER BY name ASC',
    [userId]
  );

  // Get task count for each tag
  for (const tag of tags) {
    const result: any = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM task_tags WHERE tag_id = ?`,
      [tag.id]
    );
    tag.task_count = result?.count || 0;
  }

  return tags;
};

export const getTagById = async (tagId: number): Promise<Tag | null> => {
  const db = await getDatabase();
  return await db.getFirstAsync('SELECT * FROM tags WHERE id = ?', [tagId]);
};

// ========================================
// TASK LISTS CRUD
// ========================================

export const createTaskList = async (
  userId: number,
  listData: {
    name: string;
    icon?: string;
    color?: string;
    is_smart_list?: number;
    smart_filter?: string;
  }
): Promise<number> => {
  const db = await getDatabase();

  // Get max sort_order
  const maxOrder: any = await db.getFirstAsync(
    'SELECT MAX(sort_order) as max_order FROM task_lists WHERE user_id = ?',
    [userId]
  );

  const sortOrder = (maxOrder?.max_order || 0) + 1;

  const result = await db.runAsync(
    `INSERT INTO task_lists (user_id, name, icon, color, is_smart_list, smart_filter, sort_order, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [
      userId,
      listData.name,
      listData.icon || null,
      listData.color || null,
      listData.is_smart_list || 0,
      listData.smart_filter || null,
      sortOrder,
    ]
  );

  return result.lastInsertRowId;
};

export const updateTaskList = async (
  listId: number,
  updates: {
    name?: string;
    icon?: string;
    color?: string;
  }
) => {
  const db = await getDatabase();

  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(', ');

  const values = [...Object.values(updates), listId];

  await db.runAsync(
    `UPDATE task_lists SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values
  );
};

export const deleteTaskList = async (listId: number) => {
  const db = await getDatabase();

  // Set list_id to NULL for tasks in this list
  await db.runAsync('UPDATE tasks SET list_id = NULL WHERE list_id = ?', [listId]);

  // Delete list
  await db.runAsync('DELETE FROM task_lists WHERE id = ?', [listId]);
};

export const getTaskLists = async (userId: number): Promise<TaskList[]> => {
  const db = await getDatabase();

  const lists: any[] = await db.getAllAsync(
    'SELECT * FROM task_lists WHERE user_id = ? ORDER BY is_smart_list DESC, sort_order ASC',
    [userId]
  );

  // Get task count for each list
  for (const list of lists) {
    const result: any = await db.getFirstAsync(
      `SELECT COUNT(*) as count FROM tasks WHERE list_id = ? AND completed = 0`,
      [list.id]
    );
    list.task_count = result?.count || 0;
  }

  return lists;
};

export const getTaskListById = async (listId: number): Promise<TaskList | null> => {
  const db = await getDatabase();
  return await db.getFirstAsync('SELECT * FROM task_lists WHERE id = ?', [listId]);
};

// ========================================
// INITIALIZATION & MIGRATION
// ========================================

export const initializeDefaultLists = async (userId: number) => {
  const db = await getDatabase();

  // Check if user already has lists
  const existingLists: any = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM task_lists WHERE user_id = ?',
    [userId]
  );

  if (existingLists && existingLists.count > 0) {
    return; // Already initialized
  }

  // Create default smart lists
  const defaultLists = [
    { name: 'Today', icon: '📅', color: '#1CB0F6', is_smart_list: 1, smart_filter: 'today' },
    { name: 'Important', icon: '⭐', color: '#FF9500', is_smart_list: 1, smart_filter: 'important' },
    { name: 'Scheduled', icon: '📆', color: '#9C27B0', is_smart_list: 1, smart_filter: 'scheduled' },
    { name: 'Completed', icon: '✅', color: '#58CC02', is_smart_list: 1, smart_filter: 'completed' },
  ];

  for (let i = 0; i < defaultLists.length; i++) {
    const list = defaultLists[i];
    await db.runAsync(
      `INSERT INTO task_lists (user_id, name, icon, color, is_smart_list, smart_filter, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [userId, list.name, list.icon, list.color, list.is_smart_list, list.smart_filter, i]
    );
  }

  // Create default custom lists for each pillar
  const pillarLists = [
    { name: 'Finance', icon: '💰', color: '#FFB800' },
    { name: 'Mental', icon: '🧠', color: '#CE82FF' },
    { name: 'Physical', icon: '💪', color: '#FF4B4B' },
    { name: 'Nutrition', icon: '🥗', color: '#58CC02' },
  ];

  for (let i = 0; i < pillarLists.length; i++) {
    const list = pillarLists[i];
    await db.runAsync(
      `INSERT INTO task_lists (user_id, name, icon, color, is_smart_list, sort_order, updated_at)
       VALUES (?, ?, ?, ?, 0, ?, CURRENT_TIMESTAMP)`,
      [userId, list.name, list.icon, list.color, defaultLists.length + i]
    );
  }
};

export const migrateDailyTasksToNewSystem = async (userId: number) => {
  const db = await getDatabase();

  // Get all daily_tasks for this user
  const dailyTasks: any[] = await db.getAllAsync(
    'SELECT * FROM daily_tasks WHERE user_id = ?',
    [userId]
  );

  for (const dailyTask of dailyTasks) {
    // Check if already migrated
    const existing: any = await db.getFirstAsync(
      `SELECT id FROM tasks
       WHERE user_id = ? AND title = ? AND is_generated = 1
       AND generation_source = 'daily_tasks_migration'
       AND created_at = ?`,
      [userId, dailyTask.title, dailyTask.created_at]
    );

    if (existing) {
      continue; // Already migrated
    }

    // Create task in new system
    await createTask(userId, {
      title: dailyTask.title,
      notes: dailyTask.description,
      pillar: dailyTask.pillar,
      due_date: dailyTask.task_date,
      xp_reward: dailyTask.xp_reward,
      is_generated: 1,
      generation_source: 'daily_tasks_migration',
    });
  }
};

// ========================================
// STATISTICS
// ========================================

export const getTaskStats = async (userId: number) => {
  const db = await getDatabase();

  const today = new Date().toISOString().split('T')[0];

  const [totalResult, completedResult, todayResult, overdueResult] = await Promise.all([
    db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND parent_task_id IS NULL',
      [userId]
    ),
    db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM tasks WHERE user_id = ? AND completed = 1 AND parent_task_id IS NULL',
      [userId]
    ),
    db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM tasks
       WHERE user_id = ? AND parent_task_id IS NULL AND completed = 0
       AND (due_date = ? OR due_date IS NULL)`,
      [userId, today]
    ),
    db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM tasks
       WHERE user_id = ? AND parent_task_id IS NULL AND completed = 0
       AND due_date < ?`,
      [userId, today]
    ),
  ]);

  return {
    total: totalResult?.count || 0,
    completed: completedResult?.count || 0,
    today: todayResult?.count || 0,
    overdue: overdueResult?.count || 0,
    active: (totalResult?.count || 0) - (completedResult?.count || 0),
  };
};
