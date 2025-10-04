import { getDatabase } from './init';

export interface Achievement {
  id: number;
  achievement_key: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  badge_color: string;
  is_secret: number;
  created_at: string;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_key: string;
  unlocked_at: string;
  progress: number;
}

/**
 * Get all achievements
 */
export const getAllAchievements = async (): Promise<Achievement[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync<Achievement>('SELECT * FROM achievements ORDER BY category, requirement_value');
  return result || [];
};

/**
 * Get user's unlocked achievements
 */
export const getUserAchievements = async (userId: number): Promise<any[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    `SELECT ua.*, a.title, a.description, a.icon, a.category, a.xp_reward, a.badge_color
     FROM user_achievements ua
     JOIN achievements a ON ua.achievement_key = a.achievement_key
     WHERE ua.user_id = ?
     ORDER BY ua.unlocked_at DESC`,
    [userId]
  );
  return result || [];
};

/**
 * Get achievements with progress
 */
export const getAchievementsWithProgress = async (userId: number): Promise<any[]> => {
  const db = await getDatabase();
  const result = await db.getAllAsync(
    `SELECT
      a.*,
      COALESCE(ua.unlocked_at, NULL) as unlocked_at,
      COALESCE(ua.progress, 0) as progress,
      CASE WHEN ua.unlocked_at IS NOT NULL THEN 1 ELSE 0 END as is_unlocked
     FROM achievements a
     LEFT JOIN user_achievements ua ON a.achievement_key = ua.achievement_key AND ua.user_id = ?
     WHERE a.is_secret = 0 OR ua.unlocked_at IS NOT NULL
     ORDER BY is_unlocked DESC, a.category, a.requirement_value`,
    [userId]
  );
  return result || [];
};

/**
 * Unlock achievement for user
 */
export const unlockAchievement = async (userId: number, achievementKey: string): Promise<boolean> => {
  const db = await getDatabase();

  // Check if already unlocked
  const existing = await db.getFirstAsync(
    'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_key = ?',
    [userId, achievementKey]
  );

  if (existing) {
    return false; // Already unlocked
  }

  // Unlock achievement
  await db.runAsync(
    'INSERT INTO user_achievements (user_id, achievement_key, progress) VALUES (?, ?, 100)',
    [userId, achievementKey]
  );

  // Get achievement details for XP reward
  const achievement = await db.getFirstAsync<Achievement>(
    'SELECT * FROM achievements WHERE achievement_key = ?',
    [achievementKey]
  );

  if (achievement && achievement.xp_reward > 0) {
    // Award XP
    await db.runAsync(
      'UPDATE user_stats SET total_xp = total_xp + ? WHERE user_id = ?',
      [achievement.xp_reward, userId]
    );
  }

  console.log(`🏆 Achievement unlocked: ${achievementKey}`);
  return true;
};

/**
 * Update achievement progress
 */
export const updateAchievementProgress = async (
  userId: number,
  achievementKey: string,
  progress: number
): Promise<void> => {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT INTO user_achievements (user_id, achievement_key, progress)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, achievement_key) DO UPDATE SET progress = ?`,
    [userId, achievementKey, progress, progress]
  );

  // Check if achievement should be unlocked
  const achievement = await db.getFirstAsync<Achievement>(
    'SELECT * FROM achievements WHERE achievement_key = ?',
    [achievementKey]
  );

  if (achievement && progress >= achievement.requirement_value) {
    await unlockAchievement(userId, achievementKey);
  }
};

/**
 * Check and unlock achievements based on user stats
 */
export const checkAchievements = async (userId: number): Promise<string[]> => {
  const db = await getDatabase();
  const unlockedAchievements: string[] = [];

  // Get user stats
  const stats = await db.getFirstAsync<any>(
    'SELECT * FROM user_stats WHERE user_id = ?',
    [userId]
  );

  if (!stats) return [];

  // Calculate total streak (max of all pillars)
  const totalStreak = Math.max(
    stats.finance_streak || 0,
    stats.mental_streak || 0,
    stats.physical_streak || 0,
    stats.nutrition_streak || 0
  );

  // Get completed tasks count
  const completedTasks = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM daily_tasks WHERE user_id = ? AND completed = 1',
    [userId]
  );

  // Get completed lessons count
  const completedLessons = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM lesson_progress WHERE user_id = ? AND completed = 1',
    [userId]
  );

  // Check level-based achievements
  if (stats.level >= 5 && await unlockAchievement(userId, 'level_5')) {
    unlockedAchievements.push('level_5');
  }
  if (stats.level >= 10 && await unlockAchievement(userId, 'level_10')) {
    unlockedAchievements.push('level_10');
  }

  // Check streak-based achievements
  if (totalStreak >= 7 && await unlockAchievement(userId, 'streak_7')) {
    unlockedAchievements.push('streak_7');
  }
  if (totalStreak >= 30 && await unlockAchievement(userId, 'streak_30')) {
    unlockedAchievements.push('streak_30');
  }

  // Check task-based achievements
  const taskCount = completedTasks?.count || 0;
  if (taskCount >= 50 && await unlockAchievement(userId, 'tasks_50')) {
    unlockedAchievements.push('tasks_50');
  }
  if (taskCount >= 100 && await unlockAchievement(userId, 'tasks_100')) {
    unlockedAchievements.push('tasks_100');
  }

  // Check lesson-based achievements
  const lessonCount = completedLessons?.count || 0;
  if (lessonCount >= 1 && await unlockAchievement(userId, 'first_lesson')) {
    unlockedAchievements.push('first_lesson');
  }

  return unlockedAchievements;
};

/**
 * Get achievement unlock count
 */
export const getAchievementCount = async (userId: number): Promise<{ unlocked: number; total: number }> => {
  const db = await getDatabase();

  const unlocked = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ?',
    [userId]
  );

  const total = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM achievements WHERE is_secret = 0'
  );

  return {
    unlocked: unlocked?.count || 0,
    total: total?.count || 0,
  };
};
