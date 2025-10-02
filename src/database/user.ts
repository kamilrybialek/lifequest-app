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
