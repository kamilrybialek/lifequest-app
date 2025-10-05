import { getDatabase } from './init';

export const createUser = async (email: string, name: string) => {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO users (email, name) VALUES (?, ?)',
    [email, name]
  );
  return result.lastInsertRowId;
};

export const getUserByEmail = async (email: string) => {
  const db = await getDatabase();
  return await db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
};

export const updateUserOnboarding = async (userId: number, data: {
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  onboarded?: number;
}) => {
  const db = await getDatabase();
  const fields = Object.keys(data).map((key) => `${key} = ?`).join(', ');
  const values = [...Object.values(data), userId];

  await db.runAsync(
    `UPDATE users SET ${fields} WHERE id = ?`,
    values
  );

  console.log(`✅ User ${userId} onboarding updated:`, data);
};

export const getUserStats = async (userId: number) => {
  const db = await getDatabase();
  let stats: any = await db.getFirstAsync('SELECT * FROM user_stats WHERE user_id = ?', [userId]);

  if (!stats) {
    // Create initial stats
    await db.runAsync('INSERT INTO user_stats (user_id) VALUES (?)', [userId]);
    stats = await db.getFirstAsync('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
  }

  return stats;
};

export const updateUserStats = async (userId: number, updates: {
  total_xp?: number;
  level?: number;
  finance_streak?: number;
  mental_streak?: number;
  physical_streak?: number;
  nutrition_streak?: number;
  last_active_date?: string;
}) => {
  const db = await getDatabase();
  const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), userId];

  await db.runAsync(
    `UPDATE user_stats SET ${fields} WHERE user_id = ?`,
    values
  );
};

export const addXP = async (userId: number, xpAmount: number) => {
  const stats: any = await getUserStats(userId);
  const newTotalXP = (stats?.total_xp || 0) + xpAmount;
  const newLevel = Math.floor(newTotalXP / 100) + 1;

  await updateUserStats(userId, {
    total_xp: newTotalXP,
    level: newLevel,
  });

  return { totalXP: newTotalXP, level: newLevel };
};

/**
 * Update streak for a specific pillar
 * Checks if user completed task today and increments/resets streak accordingly
 */
export const updateStreak = async (
  userId: number,
  pillar: 'finance' | 'mental' | 'physical' | 'nutrition'
) => {
  const db = await getDatabase();
  const stats: any = await getUserStats(userId);
  const today = new Date().toISOString().split('T')[0];
  const lastActiveDate = stats?.last_active_date;

  // Calculate day difference
  let newStreak = 1;
  if (lastActiveDate) {
    const lastDate = new Date(lastActiveDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day - don't increment
      return { streak: stats[`${pillar}_streak`] || 0, isNewDay: false };
    } else if (diffDays === 1) {
      // Next day - increment streak
      newStreak = (stats[`${pillar}_streak`] || 0) + 1;
    }
    // If diffDays > 1, streak is broken, reset to 1
  }

  await updateUserStats(userId, {
    [`${pillar}_streak`]: newStreak,
    last_active_date: today,
  });

  return { streak: newStreak, isNewDay: true };
};

/**
 * Get daily progress - how many tasks completed today per pillar
 */
export const getDailyProgress = async (userId: number) => {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];

  // Count completed lessons per pillar today
  const progress = await db.getAllAsync(`
    SELECT
      SUM(CASE WHEN lesson_id LIKE 'finance%' THEN 1 ELSE 0 END) as finance,
      SUM(CASE WHEN lesson_id LIKE 'mental%' THEN 1 ELSE 0 END) as mental,
      SUM(CASE WHEN lesson_id LIKE 'physical%' THEN 1 ELSE 0 END) as physical,
      SUM(CASE WHEN lesson_id LIKE 'nutrition%' THEN 1 ELSE 0 END) as nutrition
    FROM lesson_progress
    WHERE user_id = ? AND DATE(completed_at) = ?
  `, [userId, today]);

  return progress[0] || { finance: 0, mental: 0, physical: 0, nutrition: 0 };
};

/**
 * Get current streak for all pillars
 */
export const getAllStreaks = async (userId: number) => {
  const stats: any = await getUserStats(userId);
  return {
    finance: stats?.finance_streak || 0,
    mental: stats?.mental_streak || 0,
    physical: stats?.physical_streak || 0,
    nutrition: stats?.nutrition_streak || 0,
  };
};
