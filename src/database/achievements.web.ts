import AsyncStorage from '@react-native-async-storage/async-storage';

const ACHIEVEMENTS_KEY = 'lifequest.db:achievements';
const ACHIEVEMENTS_NEXT_ID_KEY = 'lifequest.db:achievements:next_id';
const USER_ACHIEVEMENTS_KEY = 'lifequest.db:user_achievements';
const USER_ACHIEVEMENTS_NEXT_ID_KEY = 'lifequest.db:user_achievements:next_id';
const USER_STATS_KEY = 'lifequest.db:user_stats';
const DAILY_TASKS_KEY = 'lifequest.db:daily_tasks';
const LESSON_PROGRESS_KEY = 'lifequest.db:lesson_progress';

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
  const data = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
  const achievements = data ? JSON.parse(data) : [];

  // Sort by category and requirement_value
  return achievements.sort((a: Achievement, b: Achievement) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.requirement_value - b.requirement_value;
  });
};

/**
 * Get user's unlocked achievements
 */
export const getUserAchievements = async (userId: number): Promise<any[]> => {
  const userAchievementsData = await AsyncStorage.getItem(USER_ACHIEVEMENTS_KEY);
  const userAchievements = userAchievementsData ? JSON.parse(userAchievementsData) : [];

  const achievementsData = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
  const achievements = achievementsData ? JSON.parse(achievementsData) : [];

  // Filter user achievements for this user
  const userUnlocked = userAchievements.filter((ua: UserAchievement) => ua.user_id === userId);

  // Join with achievement details
  const result = userUnlocked.map((ua: UserAchievement) => {
    const achievement = achievements.find((a: Achievement) => a.achievement_key === ua.achievement_key);
    return {
      ...ua,
      title: achievement?.title,
      description: achievement?.description,
      icon: achievement?.icon,
      category: achievement?.category,
      xp_reward: achievement?.xp_reward,
      badge_color: achievement?.badge_color,
    };
  });

  // Sort by unlocked_at DESC
  return result.sort((a: any, b: any) => {
    return new Date(b.unlocked_at).getTime() - new Date(a.unlocked_at).getTime();
  });
};

/**
 * Get achievements with progress
 */
export const getAchievementsWithProgress = async (userId: number): Promise<any[]> => {
  const achievementsData = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
  const achievements = achievementsData ? JSON.parse(achievementsData) : [];

  const userAchievementsData = await AsyncStorage.getItem(USER_ACHIEVEMENTS_KEY);
  const userAchievements = userAchievementsData ? JSON.parse(userAchievementsData) : [];

  // Create map of user achievements
  const userAchievementsMap = new Map();
  userAchievements
    .filter((ua: UserAchievement) => ua.user_id === userId)
    .forEach((ua: UserAchievement) => {
      userAchievementsMap.set(ua.achievement_key, ua);
    });

  // Merge achievements with user progress
  const result = achievements
    .map((a: Achievement) => {
      const ua = userAchievementsMap.get(a.achievement_key);
      return {
        ...a,
        unlocked_at: ua?.unlocked_at || null,
        progress: ua?.progress || 0,
        is_unlocked: ua?.unlocked_at ? 1 : 0,
      };
    })
    .filter((a: any) => a.is_secret === 0 || a.unlocked_at !== null);

  // Sort: unlocked first, then by category and requirement_value
  return result.sort((a: any, b: any) => {
    if (a.is_unlocked !== b.is_unlocked) {
      return b.is_unlocked - a.is_unlocked;
    }
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.requirement_value - b.requirement_value;
  });
};

/**
 * Unlock achievement for user
 */
export const unlockAchievement = async (userId: number, achievementKey: string): Promise<boolean> => {
  const userAchievementsData = await AsyncStorage.getItem(USER_ACHIEVEMENTS_KEY);
  const userAchievements = userAchievementsData ? JSON.parse(userAchievementsData) : [];

  // Check if already unlocked
  const existing = userAchievements.find(
    (ua: UserAchievement) => ua.user_id === userId && ua.achievement_key === achievementKey
  );

  if (existing) {
    return false; // Already unlocked
  }

  // Get achievement details for XP reward
  const achievementsData = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
  const achievements = achievementsData ? JSON.parse(achievementsData) : [];
  const achievement = achievements.find((a: Achievement) => a.achievement_key === achievementKey);

  // Get next ID
  const nextIdData = await AsyncStorage.getItem(USER_ACHIEVEMENTS_NEXT_ID_KEY);
  const nextId = nextIdData ? parseInt(nextIdData) : 1;

  // Create new user achievement
  const newUserAchievement: UserAchievement = {
    id: nextId,
    user_id: userId,
    achievement_key: achievementKey,
    unlocked_at: new Date().toISOString(),
    progress: 100,
  };

  userAchievements.push(newUserAchievement);

  await AsyncStorage.setItem(USER_ACHIEVEMENTS_KEY, JSON.stringify(userAchievements));
  await AsyncStorage.setItem(USER_ACHIEVEMENTS_NEXT_ID_KEY, String(nextId + 1));

  // Award XP if applicable
  if (achievement && achievement.xp_reward > 0) {
    const userStatsData = await AsyncStorage.getItem(USER_STATS_KEY);
    const userStats = userStatsData ? JSON.parse(userStatsData) : [];
    const statsIndex = userStats.findIndex((s: any) => s.user_id === userId);

    if (statsIndex !== -1) {
      userStats[statsIndex].total_xp = (userStats[statsIndex].total_xp || 0) + achievement.xp_reward;
      await AsyncStorage.setItem(USER_STATS_KEY, JSON.stringify(userStats));
    }
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
  const userAchievementsData = await AsyncStorage.getItem(USER_ACHIEVEMENTS_KEY);
  const userAchievements = userAchievementsData ? JSON.parse(userAchievementsData) : [];

  const existingIndex = userAchievements.findIndex(
    (ua: UserAchievement) => ua.user_id === userId && ua.achievement_key === achievementKey
  );

  if (existingIndex !== -1) {
    // Update existing progress
    userAchievements[existingIndex].progress = progress;
  } else {
    // Create new progress entry
    const nextIdData = await AsyncStorage.getItem(USER_ACHIEVEMENTS_NEXT_ID_KEY);
    const nextId = nextIdData ? parseInt(nextIdData) : 1;

    const newUserAchievement: UserAchievement = {
      id: nextId,
      user_id: userId,
      achievement_key: achievementKey,
      unlocked_at: '',
      progress,
    };

    userAchievements.push(newUserAchievement);
    await AsyncStorage.setItem(USER_ACHIEVEMENTS_NEXT_ID_KEY, String(nextId + 1));
  }

  await AsyncStorage.setItem(USER_ACHIEVEMENTS_KEY, JSON.stringify(userAchievements));

  // Check if achievement should be unlocked
  const achievementsData = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
  const achievements = achievementsData ? JSON.parse(achievementsData) : [];
  const achievement = achievements.find((a: Achievement) => a.achievement_key === achievementKey);

  if (achievement && progress >= achievement.requirement_value) {
    await unlockAchievement(userId, achievementKey);
  }
};

/**
 * Check and unlock achievements based on user stats
 */
export const checkAchievements = async (userId: number): Promise<string[]> => {
  const unlockedAchievements: string[] = [];

  // Get user stats
  const userStatsData = await AsyncStorage.getItem(USER_STATS_KEY);
  const userStats = userStatsData ? JSON.parse(userStatsData) : [];
  const stats = userStats.find((s: any) => s.user_id === userId);

  if (!stats) return [];

  // Calculate total streak (max of all pillars)
  const totalStreak = Math.max(
    stats.finance_streak || 0,
    stats.mental_streak || 0,
    stats.physical_streak || 0,
    stats.nutrition_streak || 0
  );

  // Get completed tasks count
  const dailyTasksData = await AsyncStorage.getItem(DAILY_TASKS_KEY);
  const dailyTasks = dailyTasksData ? JSON.parse(dailyTasksData) : [];
  const completedTasks = dailyTasks.filter(
    (task: any) => task.user_id === userId && task.completed === 1
  ).length;

  // Get completed lessons count
  const lessonProgressData = await AsyncStorage.getItem(LESSON_PROGRESS_KEY);
  const lessonProgress = lessonProgressData ? JSON.parse(lessonProgressData) : [];
  const completedLessons = lessonProgress.filter(
    (lesson: any) => lesson.user_id === userId && lesson.completed === 1
  ).length;

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
  if (completedTasks >= 50 && await unlockAchievement(userId, 'tasks_50')) {
    unlockedAchievements.push('tasks_50');
  }
  if (completedTasks >= 100 && await unlockAchievement(userId, 'tasks_100')) {
    unlockedAchievements.push('tasks_100');
  }

  // Check lesson-based achievements
  if (completedLessons >= 1 && await unlockAchievement(userId, 'first_lesson')) {
    unlockedAchievements.push('first_lesson');
  }

  return unlockedAchievements;
};

/**
 * Get achievement unlock count
 */
export const getAchievementCount = async (userId: number): Promise<{ unlocked: number; total: number }> => {
  const userAchievementsData = await AsyncStorage.getItem(USER_ACHIEVEMENTS_KEY);
  const userAchievements = userAchievementsData ? JSON.parse(userAchievementsData) : [];

  const achievementsData = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
  const achievements = achievementsData ? JSON.parse(achievementsData) : [];

  const unlocked = userAchievements.filter((ua: UserAchievement) => ua.user_id === userId).length;
  const total = achievements.filter((a: Achievement) => a.is_secret === 0).length;

  return {
    unlocked,
    total,
  };
};
