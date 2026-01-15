import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';

const DB_NAME = 'lifequest.db';

let dbInstance: SQLite.SQLiteDatabase | null = null;

// Web implementation using AsyncStorage (which uses IndexedDB)
// This is a simplified version that stores data as JSON

// Default random action tasks seed data
const DEFAULT_RANDOM_TASKS = [
  // FINANCE (15 tasks)
  { id: 1, pillar: 'finance', title: 'Plan your weekly budget', description: 'Sit down for 10 minutes and plan what you\'ll spend money on this week', duration_minutes: 10, xp_reward: 25, difficulty: 'medium', action_type: 'instant', icon: '💰', is_active: 1, weight: 3 },
  { id: 2, pillar: 'finance', title: 'Check your bank account', description: 'Log into your bank and review your balance and recent transactions', duration_minutes: 5, xp_reward: 15, difficulty: 'easy', action_type: 'instant', icon: '🏦', is_active: 1, weight: 5 },
  { id: 3, pillar: 'finance', title: 'Log today\'s expenses', description: 'Write down all expenses from today and add them to your tracker', duration_minutes: 5, xp_reward: 20, difficulty: 'easy', action_type: 'instant', icon: '📝', is_active: 1, weight: 4 },
  { id: 4, pillar: 'finance', title: 'Find one subscription to cancel', description: 'Review your subscriptions and find one you don\'t use', duration_minutes: 10, xp_reward: 30, difficulty: 'medium', action_type: 'instant', icon: '❌', is_active: 1, weight: 2 },
  { id: 5, pillar: 'finance', title: 'Set a savings goal for the month', description: 'Decide how much you want to save this month', duration_minutes: 5, xp_reward: 20, difficulty: 'easy', action_type: 'instant', icon: '🎯', is_active: 1, weight: 3 },
  { id: 6, pillar: 'finance', title: 'Analyze your biggest expense', description: 'Look at your largest expense from last week and evaluate if it was necessary', duration_minutes: 10, xp_reward: 25, difficulty: 'medium', action_type: 'instant', icon: '📊', is_active: 1, weight: 2 },
  { id: 7, pillar: 'finance', title: 'Research before buying', description: 'Instead of impulse buying, read 3 reviews about the product', duration_minutes: 15, xp_reward: 30, difficulty: 'medium', action_type: 'instant', icon: '🔍', is_active: 1, weight: 2 },
  { id: 8, pillar: 'finance', title: 'Add $20 to emergency fund', description: 'Transfer $20 to your savings account', duration_minutes: 2, xp_reward: 40, difficulty: 'hard', action_type: 'instant', icon: '🚨', is_active: 1, weight: 1 },
  { id: 9, pillar: 'finance', title: 'Review last 7 days spending', description: 'See where your money went in the last week', duration_minutes: 10, xp_reward: 25, difficulty: 'medium', action_type: 'instant', icon: '📅', is_active: 1, weight: 3 },
  { id: 10, pillar: 'finance', title: 'Negotiate a better price', description: 'Call your internet/phone provider and ask for a better deal', duration_minutes: 20, xp_reward: 50, difficulty: 'hard', action_type: 'instant', icon: '📞', is_active: 1, weight: 1 },
  { id: 11, pillar: 'finance', title: 'Make a shopping list', description: 'Plan what to buy at the store and stick to the list', duration_minutes: 5, xp_reward: 20, difficulty: 'easy', action_type: 'instant', icon: '🛒', is_active: 1, weight: 4 },
  { id: 12, pillar: 'finance', title: 'Plan free weekend fun', description: 'Find a free event or activity instead of spending money', duration_minutes: 10, xp_reward: 25, difficulty: 'medium', action_type: 'instant', icon: '🎉', is_active: 1, weight: 2 },
  { id: 13, pillar: 'finance', title: 'Use the 30-day rule', description: 'Write down a product you want to buy and wait 30 days', duration_minutes: 5, xp_reward: 20, difficulty: 'easy', action_type: 'instant', icon: '⏳', is_active: 1, weight: 3 },
  { id: 14, pillar: 'finance', title: 'Check credit card limit', description: 'See how much available credit you have and how much you\'ve used', duration_minutes: 3, xp_reward: 15, difficulty: 'easy', action_type: 'instant', icon: '💳', is_active: 1, weight: 4 },
  { id: 15, pillar: 'finance', title: 'Plan a no-spend day', description: 'Decide which day this week will be spend-free', duration_minutes: 5, xp_reward: 25, difficulty: 'medium', action_type: 'instant', icon: '🚫', is_active: 1, weight: 2 },
  // MENTAL (13 tasks)
  { id: 16, pillar: 'mental', title: '5 minutes deep breathing', description: 'Sit comfortably and focus only on your breath for 5 minutes', duration_minutes: 5, xp_reward: 20, difficulty: 'easy', action_type: 'instant', icon: '🧘', is_active: 1, weight: 5 },
  { id: 17, pillar: 'mental', title: 'Write 3 things you\'re grateful for', description: 'List 3 things from today in a notebook or phone', duration_minutes: 5, xp_reward: 20, difficulty: 'easy', action_type: 'instant', icon: '🙏', is_active: 1, weight: 4 },
  { id: 18, pillar: 'mental', title: 'Take a 10-minute walk', description: 'Leave your phone at home and go for a short walk', duration_minutes: 10, xp_reward: 25, difficulty: 'medium', action_type: 'instant', icon: '🚶', is_active: 1, weight: 3 },
  { id: 19, pillar: 'mental', title: 'No phone for 30 minutes', description: 'Set a timer and don\'t touch your phone for half an hour', duration_minutes: 30, xp_reward: 35, difficulty: 'hard', action_type: 'instant', icon: '📵', is_active: 1, weight: 2 },
  { id: 20, pillar: 'mental', title: 'Guided meditation (5 min)', description: 'Use a meditation app or YouTube and meditate for 5 minutes', duration_minutes: 5, xp_reward: 20, difficulty: 'easy', action_type: 'instant', icon: '🧠', is_active: 1, weight: 4 },
  { id: 21, pillar: 'mental', title: 'Read 10 pages of a book', description: 'Pick up a book (not e-book) and read 10 pages', duration_minutes: 15, xp_reward: 30, difficulty: 'medium', action_type: 'instant', icon: '📖', is_active: 1, weight: 2 },
  { id: 22, pillar: 'mental', title: 'Cold shower for 1 minute', description: 'End your shower with one minute of cold water', duration_minutes: 5, xp_reward: 40, difficulty: 'hard', action_type: 'instant', icon: '🚿', is_active: 1, weight: 1 },
  { id: 23, pillar: 'mental', title: 'Turn off notifications for 2 hours', description: 'Set focus/DND mode on your phone for 2h', duration_minutes: 5, xp_reward: 25, difficulty: 'medium', action_type: 'instant', icon: '🔕', is_active: 1, weight: 3 },
  { id: 24, pillar: 'mental', title: 'Morning sunlight exposure', description: 'Go outside within 30 minutes of waking up', duration_minutes: 10, xp_reward: 30, difficulty: 'medium', action_type: 'instant', icon: '☀️', is_active: 1, weight: 3 },
  { id: 25, pillar: 'mental', title: 'Journal your thoughts', description: 'Spend 10 minutes writing down what\'s on your mind', duration_minutes: 10, xp_reward: 25, difficulty: 'medium', action_type: 'instant', icon: '📔', is_active: 1, weight: 2 },
  { id: 26, pillar: 'mental', title: 'Delete one distracting app', description: 'Uninstall the app that takes up most of your time', duration_minutes: 5, xp_reward: 35, difficulty: 'hard', action_type: 'instant', icon: '🗑️', is_active: 1, weight: 1 },
  { id: 27, pillar: 'mental', title: 'Mindful eating practice', description: 'Eat a meal without phone, TV, computer - just eat', duration_minutes: 15, xp_reward: 30, difficulty: 'medium', action_type: 'instant', icon: '🍽️', is_active: 1, weight: 2 },
  { id: 28, pillar: 'mental', title: 'Visualize your goals (5 min)', description: 'Close your eyes and imagine achieving your goal', duration_minutes: 5, xp_reward: 20, difficulty: 'easy', action_type: 'instant', icon: '✨', is_active: 1, weight: 3 },
  // PHYSICAL (12 tasks)
  { id: 29, pillar: 'physical', title: '20 push-ups', description: 'Do 20 push-ups (you can do them on your knees)', duration_minutes: 5, xp_reward: 25, difficulty: 'medium', action_type: 'instant', icon: '💪', is_active: 1, weight: 4 },
  { id: 30, pillar: 'physical', title: '50 squats', description: 'Perform 50 bodyweight squats', duration_minutes: 8, xp_reward: 30, difficulty: 'medium', action_type: 'instant', icon: '🦵', is_active: 1, weight: 3 },
  { id: 31, pillar: 'physical', title: '1 minute plank hold', description: 'Hold a plank position for one minute', duration_minutes: 3, xp_reward: 25, difficulty: 'medium', action_type: 'instant', icon: '🏋️', is_active: 1, weight: 4 },
  { id: 32, pillar: 'physical', title: 'Drink 500ml of water now', description: 'Drink half a liter of water right now', duration_minutes: 2, xp_reward: 15, difficulty: 'easy', action_type: 'instant', icon: '💧', is_active: 1, weight: 5 },
  { id: 33, pillar: 'physical', title: '10 minutes yoga or stretching', description: 'Do a short stretching session', duration_minutes: 10, xp_reward: 25, difficulty: 'easy', action_type: 'instant', icon: '🧘‍♀️', is_active: 1, weight: 3 },
  { id: 34, pillar: 'physical', title: 'Walk 5000 steps today', description: 'Go out and walk until you reach 5000 steps', duration_minutes: 40, xp_reward: 35, difficulty: 'hard', action_type: 'instant', icon: '👟', is_active: 1, weight: 2 },
  { id: 35, pillar: 'physical', title: 'Take stairs instead of elevator', description: 'Next time choose stairs instead of the elevator', duration_minutes: 5, xp_reward: 20, difficulty: 'easy', action_type: 'instant', icon: '🪜', is_active: 1, weight: 4 },
  { id: 36, pillar: 'physical', title: '30 jumping jacks', description: 'Do 30 jumping jacks', duration_minutes: 3, xp_reward: 20, difficulty: 'easy', action_type: 'instant', icon: '🤸', is_active: 1, weight: 5 },
  { id: 37, pillar: 'physical', title: 'Set yourself a challenge', description: 'Decide what workout you\'ll do today and complete it', duration_minutes: 30, xp_reward: 40, difficulty: 'hard', action_type: 'instant', icon: '🎯', is_active: 1, weight: 1 },
  { id: 38, pillar: 'physical', title: 'Stretch back and neck', description: 'Spend 5 minutes stretching your upper body', duration_minutes: 5, xp_reward: 20, difficulty: 'easy', action_type: 'instant', icon: '🙆', is_active: 1, weight: 4 },
  { id: 39, pillar: 'physical', title: 'Do a set of burpees (10x)', description: 'Perform 10 burpees', duration_minutes: 5, xp_reward: 30, difficulty: 'hard', action_type: 'instant', icon: '🔥', is_active: 1, weight: 2 },
  { id: 40, pillar: 'physical', title: 'Stand and walk every hour', description: 'Set a reminder - stand and walk 2 min every hour', duration_minutes: 2, xp_reward: 15, difficulty: 'easy', action_type: 'instant', icon: '⏰', is_active: 1, weight: 4 },
  // NUTRITION (10 tasks)
  { id: 41, pillar: 'nutrition', title: 'Add vegetables to every meal', description: 'Include vegetables in breakfast, lunch, and dinner', duration_minutes: 5, xp_reward: 30, difficulty: 'medium', action_type: 'instant', icon: '🥗', is_active: 1, weight: 3 },
  { id: 42, pillar: 'nutrition', title: 'Prepare a healthy snack', description: 'Cut up fruits or vegetables for a snack', duration_minutes: 10, xp_reward: 25, difficulty: 'easy', action_type: 'instant', icon: '🍎', is_active: 1, weight: 4 },
  { id: 43, pillar: 'nutrition', title: 'No sugar today', description: 'Zero sweets, sugar in coffee, or sugary drinks today', duration_minutes: 5, xp_reward: 40, difficulty: 'hard', action_type: 'instant', icon: '🍬', is_active: 1, weight: 1 },
  { id: 44, pillar: 'nutrition', title: 'Drink 2L of water today', description: 'Track your water intake and make sure you drink 2 liters', duration_minutes: 5, xp_reward: 30, difficulty: 'medium', action_type: 'instant', icon: '💦', is_active: 1, weight: 3 },
  { id: 45, pillar: 'nutrition', title: 'Cook a meal at home', description: 'Instead of ordering, cook something yourself', duration_minutes: 30, xp_reward: 35, difficulty: 'medium', action_type: 'instant', icon: '🍳', is_active: 1, weight: 2 },
  { id: 46, pillar: 'nutrition', title: 'Eat protein with every meal', description: 'Add eggs, meat, fish, or legumes to your meals', duration_minutes: 5, xp_reward: 25, difficulty: 'medium', action_type: 'instant', icon: '🍗', is_active: 1, weight: 3 },
  { id: 47, pillar: 'nutrition', title: 'Read product labels', description: 'Check the label and see what you\'re actually eating', duration_minutes: 3, xp_reward: 20, difficulty: 'easy', action_type: 'instant', icon: '🔬', is_active: 1, weight: 4 },
  { id: 48, pillar: 'nutrition', title: 'Replace soda with water', description: 'Today drink only water, tea, or coffee without sugar', duration_minutes: 2, xp_reward: 25, difficulty: 'easy', action_type: 'instant', icon: '🥤', is_active: 1, weight: 4 },
  { id: 49, pillar: 'nutrition', title: 'Plan tomorrow\'s meals', description: 'Think ahead about what you\'ll eat tomorrow', duration_minutes: 10, xp_reward: 25, difficulty: 'easy', action_type: 'instant', icon: '📋', is_active: 1, weight: 3 },
  { id: 50, pillar: 'nutrition', title: 'Eat slowly and mindfully', description: 'Spend at least 20 minutes on your main meal without rushing', duration_minutes: 20, xp_reward: 30, difficulty: 'medium', action_type: 'instant', icon: '⏱️', is_active: 1, weight: 2 },
];

export const initDatabase = async () => {
  try {
    console.log('🔧 Initializing SQLite database for web...');

    // Open or create database
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);

    console.log('✅ Database instance created for web');

    // Create tables
    await dbInstance.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      -- Tasks table
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        notes TEXT,
        list_id INTEGER,
        parent_task_id INTEGER,
        pillar TEXT CHECK(pillar IN ('finance', 'mental', 'physical', 'nutrition')),
        priority INTEGER DEFAULT 0 CHECK(priority IN (0, 1, 2, 3)),
        completed INTEGER DEFAULT 0,
        due_date TEXT,
        due_time TEXT,
        reminder_date TEXT,
        completed_at TEXT,
        xp_reward INTEGER DEFAULT 10,
        difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
        is_generated INTEGER DEFAULT 0,
        generation_source TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (list_id) REFERENCES task_lists(id) ON DELETE SET NULL,
        FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
      );

      -- Task lists table
      CREATE TABLE IF NOT EXISTS task_lists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT,
        is_smart_list INTEGER DEFAULT 0,
        smart_filter TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Tags table
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        color TEXT,
        icon TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Task tags junction table
      CREATE TABLE IF NOT EXISTS task_tags (
        task_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (task_id, tag_id),
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );

      -- Random action tasks
      CREATE TABLE IF NOT EXISTS random_action_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pillar TEXT NOT NULL CHECK(pillar IN ('finance', 'mental', 'physical', 'nutrition')),
        title TEXT NOT NULL,
        description TEXT,
        duration_minutes INTEGER DEFAULT 10,
        xp_reward INTEGER DEFAULT 25,
        difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
        action_type TEXT DEFAULT 'instant',
        icon TEXT,
        is_active INTEGER DEFAULT 1,
        weight INTEGER DEFAULT 1
      );

      -- Daily tasks (legacy, for backward compatibility)
      CREATE TABLE IF NOT EXISTS daily_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        pillar TEXT,
        task_date TEXT,
        xp_reward INTEGER DEFAULT 10,
        completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indices
      CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
      CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
      CREATE INDEX IF NOT EXISTS idx_tasks_pillar ON tasks(pillar);
      CREATE INDEX IF NOT EXISTS idx_task_lists_user_id ON task_lists(user_id);
      CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);
      CREATE INDEX IF NOT EXISTS idx_daily_tasks_user_id ON daily_tasks(user_id);
    `);

    console.log('✅ Database tables created for web');

    // Seed random_action_tasks if empty
    const randomTasksCount = await dbInstance.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM random_action_tasks'
    );

    if (!randomTasksCount || randomTasksCount.count === 0) {
      console.log('🌱 Seeding random action tasks...');
      for (const task of DEFAULT_RANDOM_TASKS) {
        await dbInstance.runAsync(
          `INSERT INTO random_action_tasks (id, pillar, title, description, duration_minutes, xp_reward, difficulty, action_type, icon, is_active, weight)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [task.id, task.pillar, task.title, task.description, task.duration_minutes, task.xp_reward, task.difficulty, task.action_type, task.icon, task.is_active, task.weight]
        );
      }
      console.log('✅ Seeded 50 default random action tasks for web');
    }

    console.log('✅ Database initialized for web (using expo-sqlite with sql.js)');
    return dbInstance;
  } catch (error) {
    console.error('❌ Error initializing database for web:', error);
    throw error;
  }
};

export const getDatabase = async () => {
  if (!dbInstance) {
    console.log('⚠️ Database not initialized, initializing now...');
    await initDatabase();
  }
  return dbInstance;
};

export const resetDatabase = async () => {
  try {
    const db = await getDatabase();
    if (!db) {
      console.error('❌ Cannot reset database: db is null');
      return;
    }

    // Delete all data from tables
    await db.execAsync(`
      DELETE FROM task_tags;
      DELETE FROM tasks;
      DELETE FROM tags;
      DELETE FROM task_lists;
      DELETE FROM random_action_tasks;
    `);

    // Re-seed random action tasks
    for (const task of DEFAULT_RANDOM_TASKS) {
      await db.runAsync(
        `INSERT INTO random_action_tasks (id, pillar, title, description, duration_minutes, xp_reward, difficulty, action_type, icon, is_active, weight)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [task.id, task.pillar, task.title, task.description, task.duration_minutes, task.xp_reward, task.difficulty, task.action_type, task.icon, task.is_active, task.weight]
      );
    }

    console.log('✅ Database reset complete (web)');
  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  }
};
