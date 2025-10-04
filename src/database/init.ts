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
      gender TEXT,
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

  // Physical Health Progress
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS physical_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      current_foundation INTEGER DEFAULT 1,
      total_lessons_completed INTEGER DEFAULT 0,
      bmi REAL,
      tdee REAL,
      target_calories REAL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Workout Sessions
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      workout_date DATETIME NOT NULL,
      type TEXT,
      duration_minutes INTEGER,
      intensity INTEGER,
      calories_burned INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Water Intake Logs
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS water_intake_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      log_date DATE NOT NULL,
      amount_ml INTEGER DEFAULT 0,
      goal_ml INTEGER DEFAULT 2000,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Sleep Logs
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sleep_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      sleep_date DATE NOT NULL,
      bed_time TIME,
      wake_time TIME,
      duration_hours REAL,
      quality_rating INTEGER,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // ===== ADMIN TABLES =====

  // Admin Users
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      role TEXT DEFAULT 'admin',
      is_active INTEGER DEFAULT 1,
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Admin Activity Logs
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS admin_activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admin_users(id)
    );
  `);

  // Task Templates (for admin to create random tasks)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS task_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pillar TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER DEFAULT 5,
      xp_reward INTEGER DEFAULT 10,
      difficulty TEXT DEFAULT 'easy',
      is_active INTEGER DEFAULT 1,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES admin_users(id)
    );
  `);

  // Content Management (lessons, tips, articles)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS content_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      pillar TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      order_index INTEGER DEFAULT 0,
      is_published INTEGER DEFAULT 0,
      published_at DATETIME,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES admin_users(id)
    );
  `);

  // Push Notifications
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS push_notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      target_user_id INTEGER,
      target_segment TEXT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      data TEXT,
      scheduled_at DATETIME,
      sent_at DATETIME,
      status TEXT DEFAULT 'pending',
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (target_user_id) REFERENCES users(id),
      FOREIGN KEY (created_by) REFERENCES admin_users(id)
    );
  `);

  // User Activity Tracking
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      activity_type TEXT NOT NULL,
      activity_data TEXT,
      session_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // App Analytics
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS app_analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric_name TEXT NOT NULL,
      metric_value REAL NOT NULL,
      metric_date DATE NOT NULL,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // User Feedback
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      feedback_type TEXT NOT NULL,
      rating INTEGER,
      message TEXT,
      screenshot_url TEXT,
      status TEXT DEFAULT 'new',
      admin_response TEXT,
      responded_by INTEGER,
      responded_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (responded_by) REFERENCES admin_users(id)
    );
  `);

  // Insert default admin user (kamil.rybialek@gmail.com)
  await db.execAsync(`
    INSERT OR IGNORE INTO admin_users (email, name, role)
    VALUES ('kamil.rybialek@gmail.com', 'Kamil Rybiałek', 'superadmin');
  `);

  // ===== ACHIEVEMENTS & BADGES SYSTEM =====
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      achievement_key TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL,
      requirement_type TEXT NOT NULL,
      requirement_value INTEGER NOT NULL,
      xp_reward INTEGER DEFAULT 0,
      badge_color TEXT DEFAULT '#FFD700',
      is_secret INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      achievement_key TEXT NOT NULL,
      unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
      progress INTEGER DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, achievement_key)
    );
  `);

  // Insert default achievements
  await db.execAsync(`
    INSERT OR IGNORE INTO achievements (achievement_key, title, description, icon, category, requirement_type, requirement_value, xp_reward, badge_color)
    VALUES
      ('first_lesson', 'First Steps', 'Complete your first lesson', '🎓', 'education', 'lessons_completed', 1, 50, '#58CC02'),
      ('streak_7', 'Week Warrior', 'Maintain a 7-day streak', '🔥', 'consistency', 'streak_days', 7, 100, '#FF9500'),
      ('streak_30', 'Monthly Master', 'Maintain a 30-day streak', '🏆', 'consistency', 'streak_days', 30, 500, '#FFD700'),
      ('level_5', 'Rising Star', 'Reach Level 5', '⭐', 'progression', 'level', 5, 200, '#CE82FF'),
      ('level_10', 'Elite Achiever', 'Reach Level 10', '💎', 'progression', 'level', 10, 500, '#1CB0F6'),
      ('tasks_50', 'Task Master', 'Complete 50 tasks', '✅', 'tasks', 'tasks_completed', 50, 300, '#58CC02'),
      ('tasks_100', 'Century Club', 'Complete 100 tasks', '💯', 'tasks', 'tasks_completed', 100, 1000, '#FFD700'),
      ('perfect_week', 'Perfect Week', 'Complete all daily tasks for 7 days', '🌟', 'tasks', 'perfect_days', 7, 400, '#FF9500'),
      ('finance_step1', 'Emergency Ready', 'Complete Baby Step 1', '💰', 'finance', 'baby_step', 1, 250, '#00C853'),
      ('mental_foundation1', 'Mental Clarity', 'Complete Mental Foundation 1', '🧠', 'mental', 'foundation', 1, 250, '#9C27B0'),
      ('physical_foundation1', 'Body Builder', 'Complete Physical Foundation 1', '💪', 'physical', 'foundation', 1, 250, '#FF5722'),
      ('early_bird', 'Early Bird', 'Complete morning routine 10 times', '🌅', 'habits', 'morning_routines', 10, 150, '#FFC107'),
      ('meditation_master', 'Zen Master', 'Complete 20 meditation sessions', '🧘', 'mental', 'meditation_count', 20, 200, '#9C27B0'),
      ('workout_warrior', 'Fitness Fanatic', 'Complete 30 workouts', '🏋️', 'physical', 'workout_count', 30, 300, '#FF5722'),
      ('social_sharer', 'Inspiration Spreader', 'Share your progress 5 times', '📱', 'social', 'shares_count', 5, 100, '#2196F3');
  `);

  // ===== DAILY CHALLENGES SYSTEM =====
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS daily_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      challenge_date TEXT NOT NULL,
      challenge_type TEXT NOT NULL,
      challenge_description TEXT NOT NULL,
      xp_reward INTEGER DEFAULT 50,
      pillar TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(challenge_date, challenge_type)
    );
  `);

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_challenges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (challenge_id) REFERENCES daily_challenges(id),
      UNIQUE(user_id, challenge_id)
    );
  `);

  // ===== USER MILESTONES =====
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_milestones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      milestone_type TEXT NOT NULL,
      milestone_value INTEGER NOT NULL,
      achieved_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // ===== ENHANCED FINANCE FEATURES =====

  // Recurring Transactions (subscriptions, bills, income)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recurring_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
      category TEXT NOT NULL,
      merchant_name TEXT,
      amount REAL NOT NULL,
      frequency TEXT NOT NULL CHECK(frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually')),
      start_date TEXT NOT NULL,
      end_date TEXT,
      next_due_date TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      auto_detected INTEGER DEFAULT 0,
      reminder_days_before INTEGER DEFAULT 3,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Transaction Categories with AI learning
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS transaction_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      parent_category_id INTEGER,
      is_system INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (parent_category_id) REFERENCES transaction_categories(id)
    );
  `);

  // Merchant Learning (for AI categorization)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS merchant_patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      merchant_name TEXT NOT NULL,
      category_id INTEGER NOT NULL,
      confidence_score REAL DEFAULT 1.0,
      learned_from_count INTEGER DEFAULT 1,
      last_used TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (category_id) REFERENCES transaction_categories(id),
      UNIQUE(user_id, merchant_name)
    );
  `);

  // Savings Goals (like YNAB goals)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS savings_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      goal_name TEXT NOT NULL,
      goal_type TEXT CHECK(goal_type IN ('target_amount', 'monthly_funding', 'target_date')),
      target_amount REAL NOT NULL,
      current_amount REAL DEFAULT 0,
      target_date TEXT,
      monthly_contribution REAL,
      icon TEXT,
      color TEXT,
      priority INTEGER DEFAULT 0,
      is_completed INTEGER DEFAULT 0,
      completed_at TEXT,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Savings Goal Contributions
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS goal_contributions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goal_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      contribution_date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goal_id) REFERENCES savings_goals(id)
    );
  `);

  // Bill Reminders
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS bill_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      recurring_transaction_id INTEGER,
      title TEXT NOT NULL,
      amount REAL,
      due_date TEXT NOT NULL,
      is_paid INTEGER DEFAULT 0,
      paid_at TEXT,
      reminder_sent INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (recurring_transaction_id) REFERENCES recurring_transactions(id)
    );
  `);

  // Financial Insights & Analytics
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS financial_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      insight_type TEXT NOT NULL CHECK(insight_type IN ('overspending', 'savings_opportunity', 'recurring_detected', 'budget_warning', 'goal_progress', 'trend_alert')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL,
      category TEXT,
      severity TEXT CHECK(severity IN ('info', 'warning', 'critical')),
      is_read INTEGER DEFAULT 0,
      action_taken INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Net Worth Tracking
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS net_worth_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      snapshot_date TEXT NOT NULL,
      total_assets REAL DEFAULT 0,
      total_liabilities REAL DEFAULT 0,
      net_worth REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, snapshot_date)
    );
  `);

  // Account Balances (preparation for bank connection)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS account_balances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      account_name TEXT NOT NULL,
      account_type TEXT CHECK(account_type IN ('checking', 'savings', 'credit_card', 'investment', 'loan', 'other')),
      institution_name TEXT,
      current_balance REAL DEFAULT 0,
      currency TEXT DEFAULT 'USD',
      is_active INTEGER DEFAULT 1,
      last_synced TEXT,
      sync_enabled INTEGER DEFAULT 0,
      external_account_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Spending Trends
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS spending_trends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      month TEXT NOT NULL,
      total_spent REAL DEFAULT 0,
      transaction_count INTEGER DEFAULT 0,
      avg_transaction REAL DEFAULT 0,
      compared_to_previous REAL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, category, month)
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
  await db.execAsync(`DROP TABLE IF EXISTS physical_progress;`);
  await db.execAsync(`DROP TABLE IF EXISTS workout_sessions;`);
  await db.execAsync(`DROP TABLE IF EXISTS water_intake_logs;`);
  await db.execAsync(`DROP TABLE IF EXISTS sleep_logs;`);

  console.log('🗑️ All tables dropped');

  // Reinitialize
  await initDatabase();

  console.log('✅ Database reset complete');
};
