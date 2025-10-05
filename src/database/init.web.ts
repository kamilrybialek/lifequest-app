import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_NAME = 'lifequest.db';

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
  console.log('✅ Database initialized for web (using AsyncStorage/IndexedDB)');

  // Initialize empty structures if they don't exist
  const tables = [
    'users',
    'finance_progress',
    'user_budgets',
    'budget_categories',
    'user_debts',
    'debt_payments',
    'user_expenses',
    'daily_tasks',
    'user_stats',
    'lesson_progress',
    'mental_progress',
    'screen_time_logs',
    'dopamine_detox_sessions',
    'morning_routines',
    'meditation_sessions',
    'physical_progress',
    'workout_sessions',
    'water_intake_logs',
    'sleep_logs',
    'meal_plans',
    'meal_plan_items',
    'recipes',
    'random_action_tasks', // Quick Tasks for home screen
    'achievements',
    'user_achievements'
  ];

  for (const table of tables) {
    const existing = await AsyncStorage.getItem(`${DB_NAME}:${table}`);
    if (!existing) {
      await AsyncStorage.setItem(`${DB_NAME}:${table}`, JSON.stringify([]));
    }
  }

  // Seed random_action_tasks if empty
  const randomTasksData = await AsyncStorage.getItem(`${DB_NAME}:random_action_tasks`);
  const randomTasks = randomTasksData ? JSON.parse(randomTasksData) : [];
  if (randomTasks.length === 0) {
    await AsyncStorage.setItem(`${DB_NAME}:random_action_tasks`, JSON.stringify(DEFAULT_RANDOM_TASKS));
    console.log('✅ Seeded 50 default random action tasks for web');
  }

  return null; // Web doesn't return a db instance
};

export const getDatabase = async () => {
  return null; // Web doesn't use SQLite
};

export const resetDatabase = async () => {
  const tables = [
    'users',
    'finance_progress',
    'user_budgets',
    'budget_categories',
    'user_debts',
    'debt_payments',
    'user_expenses',
    'daily_tasks',
    'user_stats',
    'lesson_progress',
    'mental_progress',
    'screen_time_logs',
    'dopamine_detox_sessions',
    'morning_routines',
    'meditation_sessions'
  ];

  for (const table of tables) {
    await AsyncStorage.removeItem(`${DB_NAME}:${table}`);
    await AsyncStorage.setItem(`${DB_NAME}:${table}`, JSON.stringify([]));
  }

  console.log('✅ Database reset complete (web)');
};
