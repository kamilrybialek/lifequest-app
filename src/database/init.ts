import * as SQLite from 'expo-sqlite';

const DB_NAME = 'lifequest.db';

export const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // Users table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      age INTEGER,
      weight REAL,
      height REAL,
      onboarded INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Finance Progress (main user finance data)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS finance_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      current_baby_step INTEGER DEFAULT 1,
      monthly_income REAL DEFAULT 0,
      monthly_expenses REAL DEFAULT 0,
      emergency_fund_goal REAL DEFAULT 1000,
      emergency_fund_current REAL DEFAULT 0,
      total_debt REAL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // User Budgets (Budget Manager tool)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      month TEXT NOT NULL,
      monthly_income REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Budget Categories
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS budget_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      budget_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      emoji TEXT,
      allocated_amount REAL NOT NULL,
      spent_amount REAL DEFAULT 0,
      FOREIGN KEY (budget_id) REFERENCES user_budgets(id)
    );
  `);

  // User Debts (Debt Tracker tool)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_debts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT,
      original_amount REAL NOT NULL,
      current_balance REAL NOT NULL,
      interest_rate REAL DEFAULT 0,
      minimum_payment REAL DEFAULT 0,
      snowball_order INTEGER,
      is_paid_off INTEGER DEFAULT 0,
      paid_off_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Debt Payments
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS debt_payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      debt_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      payment_date DATE NOT NULL,
      new_balance REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (debt_id) REFERENCES user_debts(id)
    );
  `);

  // User Expenses (Expense Logger tool)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      expense_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Daily Tasks
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS daily_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      task_date DATE NOT NULL,
      pillar TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER DEFAULT 0,
      xp_reward INTEGER DEFAULT 10,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // User Stats (streaks, levels, etc.)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total_xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      finance_streak INTEGER DEFAULT 0,
      mental_streak INTEGER DEFAULT 0,
      physical_streak INTEGER DEFAULT 0,
      nutrition_streak INTEGER DEFAULT 0,
      last_active_date DATE,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Lesson Progress
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id TEXT NOT NULL,
      step_id TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      answer TEXT,
      xp_earned INTEGER DEFAULT 0,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, lesson_id)
    );
  `);

  // Mental Health Progress (main user mental health data)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS mental_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      current_foundation INTEGER DEFAULT 1,
      total_lessons_completed INTEGER DEFAULT 0,
      dopamine_detox_count INTEGER DEFAULT 0,
      last_detox_date DATE,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Screen Time Logs (Screen Time Tracker tool)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS screen_time_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      log_date DATE NOT NULL,
      total_minutes INTEGER DEFAULT 0,
      app_usage TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Dopamine Detox Sessions (Dopamine Detox tool)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS dopamine_detox_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      start_date DATETIME NOT NULL,
      end_date DATETIME,
      duration_hours INTEGER DEFAULT 24,
      completed INTEGER DEFAULT 0,
      difficulty_rating INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Morning Routines (Morning Routine tool)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS morning_routines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      routine_date DATE NOT NULL,
      wake_time TIME,
      sunlight_exposure INTEGER DEFAULT 0,
      cold_shower INTEGER DEFAULT 0,
      meditation INTEGER DEFAULT 0,
      exercise INTEGER DEFAULT 0,
      no_phone_first_hour INTEGER DEFAULT 0,
      completion_percentage INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Meditation Sessions (Meditation Timer tool)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meditation_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_date DATETIME NOT NULL,
      duration_minutes INTEGER NOT NULL,
      type TEXT,
      quality_rating INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  console.log('✅ Database initialized successfully');
  return db;
};

export const getDatabase = async () => {
  return await SQLite.openDatabaseAsync(DB_NAME);
};

export const resetDatabase = async () => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // Drop all tables
  await db.execAsync(`DROP TABLE IF EXISTS users;`);
  await db.execAsync(`DROP TABLE IF EXISTS finance_progress;`);
  await db.execAsync(`DROP TABLE IF EXISTS user_budgets;`);
  await db.execAsync(`DROP TABLE IF EXISTS budget_categories;`);
  await db.execAsync(`DROP TABLE IF EXISTS user_debts;`);
  await db.execAsync(`DROP TABLE IF EXISTS debt_payments;`);
  await db.execAsync(`DROP TABLE IF EXISTS user_expenses;`);
  await db.execAsync(`DROP TABLE IF EXISTS daily_tasks;`);
  await db.execAsync(`DROP TABLE IF EXISTS user_stats;`);
  await db.execAsync(`DROP TABLE IF EXISTS lesson_progress;`);
  await db.execAsync(`DROP TABLE IF EXISTS mental_progress;`);
  await db.execAsync(`DROP TABLE IF EXISTS screen_time_logs;`);
  await db.execAsync(`DROP TABLE IF EXISTS dopamine_detox_sessions;`);
  await db.execAsync(`DROP TABLE IF EXISTS morning_routines;`);
  await db.execAsync(`DROP TABLE IF EXISTS meditation_sessions;`);

  console.log('🗑️ All tables dropped');

  // Reinitialize
  await initDatabase();

  console.log('✅ Database reset complete');
};
