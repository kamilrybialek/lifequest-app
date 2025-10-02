import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_NAME = 'lifequest.db';

// Web implementation using AsyncStorage (which uses IndexedDB)
// This is a simplified version that stores data as JSON

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
    'meditation_sessions'
  ];

  for (const table of tables) {
    const existing = await AsyncStorage.getItem(`${DB_NAME}:${table}`);
    if (!existing) {
      await AsyncStorage.setItem(`${DB_NAME}:${table}`, JSON.stringify([]));
    }
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
