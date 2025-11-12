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

  // Finance Progress (main user finance data - 10 Steps Method)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS finance_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      current_step INTEGER DEFAULT 1,
      monthly_income REAL DEFAULT 0,
      monthly_expenses REAL DEFAULT 0,
      net_worth REAL DEFAULT 0,
      emergency_fund_goal REAL DEFAULT 1000,
      emergency_fund_current REAL DEFAULT 0,
      full_emergency_fund_goal REAL DEFAULT 0,
      full_emergency_fund_current REAL DEFAULT 0,
      total_debt REAL DEFAULT 0,
      debt_paid_off REAL DEFAULT 0,
      step1_completed INTEGER DEFAULT 0,
      step2_completed INTEGER DEFAULT 0,
      step3_completed INTEGER DEFAULT 0,
      step4_completed INTEGER DEFAULT 0,
      step5_completed INTEGER DEFAULT 0,
      step6_completed INTEGER DEFAULT 0,
      step7_completed INTEGER DEFAULT 0,
      step8_completed INTEGER DEFAULT 0,
      step9_completed INTEGER DEFAULT 0,
      step10_completed INTEGER DEFAULT 0,
      total_lessons_completed INTEGER DEFAULT 0,
      total_xp_earned INTEGER DEFAULT 0,
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

  // Daily Tasks (DEPRECATED - keeping for migration)
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

  // ========================================
  // UNIFIED TODO SYSTEM (Apple Reminders-style)
  // ========================================

  // Task Lists (like Reminders lists)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS task_lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT,
      is_smart_list INTEGER DEFAULT 0,
      smart_filter TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Tags (for organizing tasks)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, name)
    );
  `);

  // Tasks (unified system - manual + generated)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      notes TEXT,

      -- Organization
      list_id INTEGER,
      parent_task_id INTEGER,

      -- Properties
      pillar TEXT,
      priority INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,

      -- Dates & Time
      due_date DATE,
      due_time TIME,
      reminder_date DATETIME,
      completed_at DATETIME,

      -- Gamification
      xp_reward INTEGER DEFAULT 10,
      difficulty TEXT,

      -- Source tracking
      is_generated INTEGER DEFAULT 0,
      generation_source TEXT,

      -- Metadata
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (list_id) REFERENCES task_lists(id) ON DELETE SET NULL,
      FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );
  `);

  // Task Tags (many-to-many relationship)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS task_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE,
      UNIQUE(task_id, tag_id)
    );
  `);

  // Create default smart lists for each user (handled in migration function)

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

  // Lesson Progress (Enhanced for new Duolingo-style lessons)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id TEXT NOT NULL,
      step_id TEXT NOT NULL,
      pillar TEXT DEFAULT 'finance',
      completed INTEGER DEFAULT 0,
      current_phase TEXT DEFAULT 'intro',
      sections_completed INTEGER DEFAULT 0,
      total_sections INTEGER DEFAULT 0,
      quiz_score INTEGER DEFAULT 0,
      quiz_total INTEGER DEFAULT 0,
      action_answer TEXT,
      xp_earned INTEGER DEFAULT 0,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, lesson_id)
    );
  `);

  // Quiz Question Results (for detailed analytics)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS quiz_question_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      question_type TEXT NOT NULL,
      user_answer TEXT,
      is_correct INTEGER DEFAULT 0,
      xp_earned INTEGER DEFAULT 0,
      time_spent_seconds INTEGER,
      attempt_number INTEGER DEFAULT 1,
      answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
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

  // ===== NUTRITION TABLES =====

  // Nutrition Progress
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS nutrition_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      current_foundation INTEGER DEFAULT 1,
      total_lessons_completed INTEGER DEFAULT 0,
      total_meals_logged INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Food Items Database (Admin-manageable + user-custom)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS food_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT,
      serving_size TEXT,
      serving_unit TEXT,
      calories REAL NOT NULL,
      protein REAL DEFAULT 0,
      carbs REAL DEFAULT 0,
      fat REAL DEFAULT 0,
      fiber REAL DEFAULT 0,
      sugar REAL DEFAULT 0,
      sodium REAL DEFAULT 0,
      category TEXT,
      barcode TEXT,
      is_verified INTEGER DEFAULT 0,
      is_admin_created INTEGER DEFAULT 0,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  // Meals (individual eating occasions)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      meal_type TEXT CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'other')),
      meal_date DATE NOT NULL,
      meal_time TIME,
      total_calories REAL DEFAULT 0,
      total_protein REAL DEFAULT 0,
      total_carbs REAL DEFAULT 0,
      total_fat REAL DEFAULT 0,
      notes TEXT,
      photo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Meal Food Items (junction table with quantities)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meal_food_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_id INTEGER NOT NULL,
      food_item_id INTEGER NOT NULL,
      quantity REAL DEFAULT 1,
      servings REAL DEFAULT 1,
      notes TEXT,
      FOREIGN KEY (meal_id) REFERENCES meals(id),
      FOREIGN KEY (food_item_id) REFERENCES food_items(id)
    );
  `);

  // Meal Plans (weekly/daily plans)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS meal_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan_name TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      goal_type TEXT CHECK(goal_type IN ('weight_loss', 'muscle_gain', 'maintenance', 'general_health')),
      target_calories REAL,
      target_protein REAL,
      target_carbs REAL,
      target_fat REAL,
      is_active INTEGER DEFAULT 1,
      is_ai_generated INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Planned Meals (meals in a meal plan)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS planned_meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meal_plan_id INTEGER NOT NULL,
      day_of_week INTEGER,
      meal_date DATE,
      meal_type TEXT CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
      meal_name TEXT NOT NULL,
      description TEXT,
      recipe_url TEXT,
      estimated_calories REAL,
      estimated_protein REAL,
      estimated_carbs REAL,
      estimated_fat REAL,
      prep_time_minutes INTEGER,
      is_completed INTEGER DEFAULT 0,
      completed_at DATETIME,
      FOREIGN KEY (meal_plan_id) REFERENCES meal_plans(id)
    );
  `);

  // Recipes (user & admin created)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      cuisine_type TEXT,
      servings INTEGER DEFAULT 1,
      prep_time_minutes INTEGER,
      cook_time_minutes INTEGER,
      difficulty TEXT CHECK(difficulty IN ('easy', 'medium', 'hard')),
      instructions TEXT,
      photo_url TEXT,
      total_calories REAL,
      total_protein REAL,
      total_carbs REAL,
      total_fat REAL,
      is_public INTEGER DEFAULT 0,
      is_admin_created INTEGER DEFAULT 0,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  // Recipe Ingredients
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL,
      food_item_id INTEGER,
      ingredient_name TEXT,
      quantity REAL,
      unit TEXT,
      notes TEXT,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id),
      FOREIGN KEY (food_item_id) REFERENCES food_items(id)
    );
  `);

  // Daily Nutrition Summary
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS daily_nutrition_summary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      summary_date DATE NOT NULL,
      total_calories REAL DEFAULT 0,
      total_protein REAL DEFAULT 0,
      total_carbs REAL DEFAULT 0,
      total_fat REAL DEFAULT 0,
      total_fiber REAL DEFAULT 0,
      water_intake_ml INTEGER DEFAULT 0,
      water_goal_ml INTEGER DEFAULT 2000,
      meals_logged INTEGER DEFAULT 0,
      goal_met INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, summary_date)
    );
  `);

  // Water Intake Enhanced (separate from nutrition summary for flexibility)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS nutrition_water_intake (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      intake_date DATE NOT NULL,
      amount_ml INTEGER NOT NULL,
      intake_time TIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Macro Goals (user-defined macro targets)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS macro_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      goal_name TEXT NOT NULL,
      calories_target REAL NOT NULL,
      protein_target REAL NOT NULL,
      carbs_target REAL NOT NULL,
      fat_target REAL NOT NULL,
      is_active INTEGER DEFAULT 1,
      start_date DATE,
      end_date DATE,
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

  // Random Daily Action Tasks (RPG-style instant actions)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS random_action_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pillar TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      duration_minutes INTEGER DEFAULT 5,
      xp_reward INTEGER DEFAULT 15,
      difficulty TEXT DEFAULT 'easy',
      action_type TEXT DEFAULT 'instant',
      icon TEXT,
      is_active INTEGER DEFAULT 1,
      weight INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

  // Insert 50 default random action tasks (English)
  await db.execAsync(`
    INSERT OR IGNORE INTO random_action_tasks (pillar, title, description, duration_minutes, xp_reward, difficulty, icon, weight)
    VALUES
      -- FINANCE (15 tasks)
      ('finance', 'Plan your weekly budget', 'Sit down for 10 minutes and plan what you''ll spend money on this week', 10, 25, 'medium', '💰', 3),
      ('finance', 'Check your bank account', 'Log into your bank and review your balance and recent transactions', 5, 15, 'easy', '🏦', 5),
      ('finance', 'Log today''s expenses', 'Write down all expenses from today and add them to your tracker', 5, 20, 'easy', '📝', 4),
      ('finance', 'Find one subscription to cancel', 'Review your subscriptions and find one you don''t use', 10, 30, 'medium', '❌', 2),
      ('finance', 'Set a savings goal for the month', 'Decide how much you want to save this month', 5, 20, 'easy', '🎯', 3),
      ('finance', 'Analyze your biggest expense', 'Look at your largest expense from last week and evaluate if it was necessary', 10, 25, 'medium', '📊', 2),
      ('finance', 'Research before buying', 'Instead of impulse buying, read 3 reviews about the product', 15, 30, 'medium', '🔍', 2),
      ('finance', 'Add $20 to emergency fund', 'Transfer $20 to your savings account', 2, 40, 'hard', '🚨', 1),
      ('finance', 'Review last 7 days spending', 'See where your money went in the last week', 10, 25, 'medium', '📅', 3),
      ('finance', 'Negotiate a better price', 'Call your internet/phone provider and ask for a better deal', 20, 50, 'hard', '📞', 1),
      ('finance', 'Make a shopping list', 'Plan what to buy at the store and stick to the list', 5, 20, 'easy', '🛒', 4),
      ('finance', 'Plan free weekend fun', 'Find a free event or activity instead of spending money', 10, 25, 'medium', '🎉', 2),
      ('finance', 'Use the 30-day rule', 'Write down a product you want to buy and wait 30 days', 5, 20, 'easy', '⏳', 3),
      ('finance', 'Check credit card limit', 'See how much available credit you have and how much you''ve used', 3, 15, 'easy', '💳', 4),
      ('finance', 'Plan a no-spend day', 'Decide which day this week will be spend-free', 5, 25, 'medium', '🚫', 2),

      -- MENTAL (13 tasks)
      ('mental', '5 minutes deep breathing', 'Sit comfortably and focus only on your breath for 5 minutes', 5, 20, 'easy', '🧘', 5),
      ('mental', 'Write 3 things you''re grateful for', 'List 3 things from today in a notebook or phone', 5, 20, 'easy', '🙏', 4),
      ('mental', 'Take a 10-minute walk', 'Leave your phone at home and go for a short walk', 10, 25, 'medium', '🚶', 3),
      ('mental', 'No phone for 30 minutes', 'Set a timer and don''t touch your phone for half an hour', 30, 35, 'hard', '📵', 2),
      ('mental', 'Guided meditation (5 min)', 'Use a meditation app or YouTube and meditate for 5 minutes', 5, 20, 'easy', '🧠', 4),
      ('mental', 'Read 10 pages of a book', 'Pick up a book (not e-book) and read 10 pages', 15, 30, 'medium', '📖', 2),
      ('mental', 'Cold shower for 1 minute', 'End your shower with one minute of cold water', 5, 40, 'hard', '🚿', 1),
      ('mental', 'Turn off notifications for 2 hours', 'Set focus/DND mode on your phone for 2h', 5, 25, 'medium', '🔕', 3),
      ('mental', 'Morning sunlight exposure', 'Go outside within 30 minutes of waking up', 10, 30, 'medium', '☀️', 3),
      ('mental', 'Journal your thoughts', 'Spend 10 minutes writing down what''s on your mind', 10, 25, 'medium', '📔', 2),
      ('mental', 'Delete one distracting app', 'Uninstall the app that takes up most of your time', 5, 35, 'hard', '🗑️', 1),
      ('mental', 'Mindful eating practice', 'Eat a meal without phone, TV, computer - just eat', 15, 30, 'medium', '🍽️', 2),
      ('mental', 'Visualize your goals (5 min)', 'Close your eyes and imagine achieving your goal', 5, 20, 'easy', '✨', 3),

      -- PHYSICAL (12 tasks)
      ('physical', '20 push-ups', 'Do 20 push-ups (you can do them on your knees)', 5, 25, 'medium', '💪', 4),
      ('physical', '50 squats', 'Perform 50 bodyweight squats', 8, 30, 'medium', '🦵', 3),
      ('physical', '1 minute plank hold', 'Hold a plank position for one minute', 3, 25, 'medium', '🏋️', 4),
      ('physical', 'Drink 500ml of water now', 'Drink half a liter of water right now', 2, 15, 'easy', '💧', 5),
      ('physical', '10 minutes yoga or stretching', 'Do a short stretching session', 10, 25, 'easy', '🧘‍♀️', 3),
      ('physical', 'Walk 5000 steps today', 'Go out and walk until you reach 5000 steps', 40, 35, 'hard', '👟', 2),
      ('physical', 'Take stairs instead of elevator', 'Next time choose stairs instead of the elevator', 5, 20, 'easy', '🪜', 4),
      ('physical', '30 jumping jacks', 'Do 30 jumping jacks', 3, 20, 'easy', '🤸', 5),
      ('physical', 'Set yourself a challenge', 'Decide what workout you''ll do today and complete it', 30, 40, 'hard', '🎯', 1),
      ('physical', 'Stretch back and neck', 'Spend 5 minutes stretching your upper body', 5, 20, 'easy', '🙆', 4),
      ('physical', 'Do a set of burpees (10x)', 'Perform 10 burpees', 5, 30, 'hard', '🔥', 2),
      ('physical', 'Stand and walk every hour', 'Set a reminder - stand and walk 2 min every hour', 2, 15, 'easy', '⏰', 4),

      -- NUTRITION (10 tasks)
      ('nutrition', 'Add vegetables to every meal', 'Include vegetables in breakfast, lunch, and dinner', 5, 30, 'medium', '🥗', 3),
      ('nutrition', 'Prepare a healthy snack', 'Cut up fruits or vegetables for a snack', 10, 25, 'easy', '🍎', 4),
      ('nutrition', 'No sugar today', 'Zero sweets, sugar in coffee, or sugary drinks today', 5, 40, 'hard', '🍬', 1),
      ('nutrition', 'Drink 2L of water today', 'Track your water intake and make sure you drink 2 liters', 5, 30, 'medium', '💦', 3),
      ('nutrition', 'Cook a meal at home', 'Instead of ordering, cook something yourself', 30, 35, 'medium', '🍳', 2),
      ('nutrition', 'Eat protein with every meal', 'Add eggs, meat, fish, or legumes to your meals', 5, 25, 'medium', '🍗', 3),
      ('nutrition', 'Read product labels', 'Check the label and see what you''re actually eating', 3, 20, 'easy', '🔬', 4),
      ('nutrition', 'Replace soda with water', 'Today drink only water, tea, or coffee without sugar', 2, 25, 'easy', '🥤', 4),
      ('nutrition', 'Plan tomorrow''s meals', 'Think ahead about what you''ll eat tomorrow', 10, 25, 'easy', '📋', 3),
      ('nutrition', 'Eat slowly and mindfully', 'Spend at least 20 minutes on your main meal without rushing', 20, 30, 'medium', '⏱️', 2);
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

  // ===== PILLAR ASSESSMENTS =====
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pillar_assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      pillar TEXT NOT NULL CHECK(pillar IN ('finance', 'mental', 'physical', 'nutrition')),
      assessment_data TEXT NOT NULL,
      recommended_level INTEGER NOT NULL,
      completed_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, pillar)
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

  // ===== DATABASE MIGRATIONS =====
  // Migration: Add pillar column to lesson_progress if it doesn't exist
  try {
    await db.execAsync(`
      ALTER TABLE lesson_progress ADD COLUMN pillar TEXT DEFAULT 'finance';
    `);
    console.log('✅ Migration: Added pillar column to lesson_progress');
  } catch (error: any) {
    // Column already exists or other error - ignore
    if (!error.message.includes('duplicate column name')) {
      console.log('ℹ️ pillar column already exists or migration not needed');
    }
  }

  console.log('✅ Database initialized successfully');
  return db;
};

export const getDatabase = async () => {
  return await SQLite.openDatabaseAsync(DB_NAME);
};

export const resetUserData = async (userId: number) => {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  try {
    console.log(`🗑️ Resetting data for user ${userId}...`);

    // Delete user-specific data from all tables (but keep the tables)
    await db.runAsync(`DELETE FROM finance_progress WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM user_budgets WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM budget_categories WHERE budget_id IN (SELECT id FROM user_budgets WHERE user_id = ?)`, [userId]);
    await db.runAsync(`DELETE FROM user_debts WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM debt_payments WHERE debt_id IN (SELECT id FROM user_debts WHERE user_id = ?)`, [userId]);
    await db.runAsync(`DELETE FROM user_expenses WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM daily_tasks WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM user_stats WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM lesson_progress WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM mental_progress WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM screen_time_logs WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM dopamine_detox_sessions WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM morning_routines WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM meditation_sessions WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM physical_progress WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM workout_sessions WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM water_intake_logs WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM sleep_logs WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM pillar_assessments WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM user_achievements WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM user_challenges WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM user_milestones WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM recurring_transactions WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM transaction_categories WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM merchant_patterns WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM savings_goals WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM goal_contributions WHERE goal_id IN (SELECT id FROM savings_goals WHERE user_id = ?)`, [userId]);
    await db.runAsync(`DELETE FROM bill_reminders WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM financial_insights WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM net_worth_snapshots WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM account_balances WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM spending_trends WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM nutrition_progress WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM meals WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM meal_plans WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM macro_goals WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM nutrition_water_intake WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM daily_nutrition_summary WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM user_activity WHERE user_id = ?`, [userId]);
    await db.runAsync(`DELETE FROM user_feedback WHERE user_id = ?`, [userId]);

    console.log('✅ User data reset complete');
  } catch (error) {
    console.error('Error resetting user data:', error);
    throw error;
  }
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
  await db.execAsync(`DROP TABLE IF EXISTS pillar_assessments;`);
  await db.execAsync(`DROP TABLE IF EXISTS achievements;`);
  await db.execAsync(`DROP TABLE IF EXISTS user_achievements;`);
  await db.execAsync(`DROP TABLE IF EXISTS daily_challenges;`);
  await db.execAsync(`DROP TABLE IF EXISTS user_challenges;`);
  await db.execAsync(`DROP TABLE IF EXISTS user_milestones;`);
  await db.execAsync(`DROP TABLE IF EXISTS recurring_transactions;`);
  await db.execAsync(`DROP TABLE IF EXISTS transaction_categories;`);
  await db.execAsync(`DROP TABLE IF EXISTS merchant_patterns;`);
  await db.execAsync(`DROP TABLE IF EXISTS savings_goals;`);
  await db.execAsync(`DROP TABLE IF EXISTS goal_contributions;`);
  await db.execAsync(`DROP TABLE IF EXISTS bill_reminders;`);
  await db.execAsync(`DROP TABLE IF EXISTS financial_insights;`);
  await db.execAsync(`DROP TABLE IF EXISTS net_worth_snapshots;`);
  await db.execAsync(`DROP TABLE IF EXISTS account_balances;`);
  await db.execAsync(`DROP TABLE IF EXISTS spending_trends;`);

  console.log('🗑️ All tables dropped');

  // Reinitialize
  await initDatabase();

  console.log('✅ Database reset complete');
};
