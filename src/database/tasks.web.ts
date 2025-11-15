import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = 'lifequest.db:tasks';
const TAGS_KEY = 'lifequest.db:tags';
const TASK_TAGS_KEY = 'lifequest.db:task_tags';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  notes?: string;
  list_id?: number;
  parent_task_id?: number;
  pillar?: string;
  priority: number;
  completed: number;
  due_date?: string;
  due_time?: string;
  reminder_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  tags?: Tag[];
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
}

export interface Tag {
  id: number;
  user_id: number;
  name: string;
  color?: string;
  icon?: string;
  created_at: string;
}

// Helper functions
const getAllTasks = async (): Promise<Task[]> => {
  const data = await AsyncStorage.getItem(TASKS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveAllTasks = async (tasks: Task[]): Promise<void> => {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
};

const getAllTags = async (): Promise<Tag[]> => {
  const data = await AsyncStorage.getItem(TAGS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveAllTags = async (tags: Tag[]): Promise<void> => {
  await AsyncStorage.setItem(TAGS_KEY, JSON.stringify(tags));
};

export const createTask = async (
  userId: number,
  taskData: Partial<Task>
): Promise<number> => {
  const tasks = await getAllTasks();
  const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  const now = new Date().toISOString();

  const newTask: Task = {
    id: newId,
    user_id: userId,
    title: taskData.title || '',
    notes: taskData.notes,
    list_id: taskData.list_id,
    parent_task_id: taskData.parent_task_id,
    pillar: taskData.pillar,
    priority: taskData.priority || 0,
    completed: 0,
    due_date: taskData.due_date,
    due_time: taskData.due_time,
    reminder_date: taskData.reminder_date,
    created_at: now,
    updated_at: now,
  };

  tasks.push(newTask);
  await saveAllTasks(tasks);

  return newId;
};

export const updateTask = async (
  taskId: number,
  updates: Partial<Task>
): Promise<void> => {
  const tasks = await getAllTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updated_at: new Date().toISOString(),
  };

  await saveAllTasks(tasks);
};

export const toggleTaskComplete = async (taskId: number): Promise<void> => {
  const tasks = await getAllTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    throw new Error('Task not found');
  }

  const isCompleted = tasks[taskIndex].completed === 1;
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    completed: isCompleted ? 0 : 1,
    completed_at: isCompleted ? undefined : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await saveAllTasks(tasks);
};

export const deleteTask = async (taskId: number): Promise<void> => {
  const tasks = await getAllTasks();
  const filteredTasks = tasks.filter(t => t.id !== taskId);
  await saveAllTasks(filteredTasks);
};

export const getTaskById = async (taskId: number): Promise<Task | null> => {
  const tasks = await getAllTasks();
  return tasks.find(t => t.id === taskId) || null;
};

export const getTasks = async (
  userId: number,
  filters?: {
    listId?: number;
    completed?: boolean;
    pillar?: string;
    parentTaskId?: number;
  }
): Promise<Task[]> => {
  let tasks = await getAllTasks();
  tasks = tasks.filter(t => t.user_id === userId);

  if (filters) {
    if (filters.listId !== undefined) {
      tasks = tasks.filter(t => t.list_id === filters.listId);
    }
    if (filters.completed !== undefined) {
      tasks = tasks.filter(t => (t.completed === 1) === filters.completed);
    }
    if (filters.pillar) {
      tasks = tasks.filter(t => t.pillar === filters.pillar);
    }
    if (filters.parentTaskId !== undefined) {
      tasks = tasks.filter(t => t.parent_task_id === filters.parentTaskId);
    }
  }

  return tasks;
};

export const getTasksForToday = async (userId: number): Promise<Task[]> => {
  const tasks = await getAllTasks();
  const today = new Date().toISOString().split('T')[0];

  return tasks.filter(
    t => t.user_id === userId && t.due_date === today && t.completed === 0
  );
};

export const getScheduledTasks = async (userId: number): Promise<Task[]> => {
  const tasks = await getAllTasks();
  return tasks.filter(
    t => t.user_id === userId && t.due_date && t.completed === 0
  );
};

export const getImportantTasks = async (userId: number): Promise<Task[]> => {
  const tasks = await getAllTasks();
  return tasks.filter(
    t => t.user_id === userId && t.priority >= 2 && t.completed === 0
  );
};

export const getCompletedTasks = async (
  userId: number,
  limit: number = 50
): Promise<Task[]> => {
  const tasks = await getAllTasks();
  return tasks
    .filter(t => t.user_id === userId && t.completed === 1)
    .sort((a, b) => (b.completed_at || '').localeCompare(a.completed_at || ''))
    .slice(0, limit);
};

// Tag functions
export const createTag = async (
  userId: number,
  name: string,
  color?: string,
  icon?: string
): Promise<number> => {
  const tags = await getAllTags();
  const newId = tags.length > 0 ? Math.max(...tags.map(t => t.id)) + 1 : 1;

  const newTag: Tag = {
    id: newId,
    user_id: userId,
    name,
    color,
    icon,
    created_at: new Date().toISOString(),
  };

  tags.push(newTag);
  await saveAllTags(tags);

  return newId;
};

export const getTags = async (userId: number): Promise<Tag[]> => {
  const tags = await getAllTags();
  return tags.filter(t => t.user_id === userId);
};

export const deleteTag = async (tagId: number): Promise<void> => {
  const tags = await getAllTags();
  const filteredTags = tags.filter(t => t.id !== tagId);
  await saveAllTags(filteredTags);
};

export const updateTag = async (
  tagId: number,
  name: string,
  color?: string,
  icon?: string
): Promise<void> => {
  const tags = await getAllTags();
  const tagIndex = tags.findIndex(t => t.id === tagId);

  if (tagIndex === -1) {
    throw new Error('Tag not found');
  }

  tags[tagIndex] = {
    ...tags[tagIndex],
    name,
    color,
    icon,
  };

  await saveAllTags(tags);
};

// Simplified tag-task relations (not fully implemented for web)
export const addTagToTask = async (taskId: number, tagId: number): Promise<void> => {
  // Simplified - just log for now
  console.log('addTagToTask not fully implemented on web', taskId, tagId);
};

export const removeTagFromTask = async (taskId: number, tagId: number): Promise<void> => {
  console.log('removeTagFromTask not fully implemented on web', taskId, tagId);
};

export const setTaskTags = async (taskId: number, tagIds: number[]): Promise<void> => {
  console.log('setTaskTags not fully implemented on web', taskId, tagIds);
};

// Stub functions for completeness
export const completeTask = toggleTaskComplete;

// Task Lists - AsyncStorage implementation
const TASK_LISTS_KEY = 'lifequest.db:task_lists';

const getAllTaskLists = async (): Promise<TaskList[]> => {
  const data = await AsyncStorage.getItem(TASK_LISTS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveAllTaskLists = async (lists: TaskList[]): Promise<void> => {
  await AsyncStorage.setItem(TASK_LISTS_KEY, JSON.stringify(lists));
};

export const getTaskLists = async (userId: number): Promise<(TaskList & { task_count?: number })[]> => {
  const lists = await getAllTaskLists();
  const userLists = lists.filter(l => l.user_id === userId);

  // Get task count for each list
  const tasks = await getAllTasks();
  const listsWithCounts = userLists.map(list => ({
    ...list,
    task_count: tasks.filter(t => t.list_id === list.id && t.completed === 0).length,
  }));

  // Sort: smart lists first, then by sort_order
  return listsWithCounts.sort((a, b) => {
    if (a.is_smart_list !== b.is_smart_list) {
      return b.is_smart_list - a.is_smart_list;
    }
    return a.sort_order - b.sort_order;
  });
};

export const initializeDefaultLists = async (userId: number): Promise<void> => {
  // Use getAllTaskLists to avoid infinite recursion
  const allLists = await getAllTaskLists();
  const existingLists = allLists.filter(l => l.user_id === userId);

  if (existingLists.length > 0) {
    return; // Already initialized
  }

  const now = new Date().toISOString();
  const defaultLists: TaskList[] = [
    {
      id: 1,
      user_id: userId,
      name: 'Today',
      icon: '📅',
      color: '#58CC02',
      is_smart_list: 1,
      smart_filter: 'today',
      sort_order: 1,
      created_at: now,
      updated_at: now,
    },
    {
      id: 2,
      user_id: userId,
      name: 'Important',
      icon: '⭐',
      color: '#FF4B4B',
      is_smart_list: 1,
      smart_filter: 'important',
      sort_order: 2,
      created_at: now,
      updated_at: now,
    },
    {
      id: 3,
      user_id: userId,
      name: 'All',
      icon: '📋',
      color: '#1CB0F6',
      is_smart_list: 1,
      smart_filter: 'all',
      sort_order: 3,
      created_at: now,
      updated_at: now,
    },
    {
      id: 4,
      user_id: userId,
      name: 'Completed',
      icon: '✅',
      color: '#58CC02',
      is_smart_list: 1,
      smart_filter: 'completed',
      sort_order: 4,
      created_at: now,
      updated_at: now,
    },
  ];

  await saveAllTaskLists(defaultLists);
};

export const createList = async (
  userId: number,
  name: string,
  icon?: string,
  color?: string
): Promise<number> => {
  const lists = await getAllTaskLists();
  const newId = lists.length > 0 ? Math.max(...lists.map(l => l.id)) + 1 : 1;
  const now = new Date().toISOString();

  const newList: TaskList = {
    id: newId,
    user_id: userId,
    name,
    icon,
    color,
    is_smart_list: 0,
    sort_order: lists.length + 1,
    created_at: now,
    updated_at: now,
  };

  lists.push(newList);
  await saveAllTaskLists(lists);

  return newId;
};

export const updateList = async (
  listId: number,
  name: string,
  icon?: string,
  color?: string
): Promise<void> => {
  const lists = await getAllTaskLists();
  const listIndex = lists.findIndex(l => l.id === listId);

  if (listIndex === -1) {
    throw new Error('List not found');
  }

  lists[listIndex] = {
    ...lists[listIndex],
    name,
    icon,
    color,
    updated_at: new Date().toISOString(),
  };

  await saveAllTaskLists(lists);
};

export const deleteList = async (listId: number): Promise<void> => {
  const lists = await getAllTaskLists();
  const filteredLists = lists.filter(l => l.id !== listId);
  await saveAllTaskLists(filteredLists);

  // Also delete all tasks in this list
  const tasks = await getAllTasks();
  const filteredTasks = tasks.filter(t => t.list_id !== listId);
  await saveAllTasks(filteredTasks);
};

export const getTaskStats = async (userId: number): Promise<{
  total: number;
  active: number;
  completed: number;
  today: number;
  overdue: number;
}> => {
  const tasks = await getAllTasks();
  const userTasks = tasks.filter(t => t.user_id === userId);
  const today = new Date().toISOString().split('T')[0];

  return {
    total: userTasks.length,
    active: userTasks.filter(t => t.completed === 0).length,
    completed: userTasks.filter(t => t.completed === 1).length,
    today: userTasks.filter(t => t.due_date === today && t.completed === 0).length,
    overdue: userTasks.filter(t => {
      if (!t.due_date || t.completed === 1) return false;
      return t.due_date < today;
    }).length,
  };
};
