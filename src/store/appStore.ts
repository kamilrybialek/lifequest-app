import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Task,
  Streak,
  Achievement,
  UserProgress,
  FinanceData,
  MentalHealthData,
  PhysicalHealthData,
  NutritionData,
  Pillar,
} from '../types';
import { getUserStats, getAllStreaks, getDailyProgress } from '../database/user';
import { checkAndGenerateTasks } from '../utils/taskGenerator';
import { getDatabase } from '../database/init';
import {
  scheduleStreakProtectionNotification,
  sendAchievementNotification,
  sendLevelUpNotification,
  sendTaskCompletedNotification,
} from '../utils/notifications';

interface AppState {
  // Progress
  progress: UserProgress;

  // Daily Tasks
  dailyTasks: Task[];

  // Pillar Data
  financeData: FinanceData;
  mentalHealthData: MentalHealthData;
  physicalHealthData: PhysicalHealthData;
  nutritionData: NutritionData;

  // Actions
  loadAppData: () => Promise<void>;
  loadDailyTasksFromDB: (userId: number) => Promise<void>;
  generateDailyTasks: () => void;
  completeTask: (taskId: string) => Promise<void>;
  updateStreak: (pillar: Pillar) => void;
  addPoints: (points: number) => Promise<void>;
  updateFinanceData: (data: Partial<FinanceData>) => Promise<void>;
  updateMentalHealthData: (data: Partial<MentalHealthData>) => Promise<void>;
  updatePhysicalHealthData: (data: Partial<PhysicalHealthData>) => Promise<void>;
  updateNutritionData: (data: Partial<NutritionData>) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;
}

const initialProgress: UserProgress = {
  level: 1,
  xp: 0,
  totalPoints: 0,
  streaks: [
    { pillar: 'finance', current: 0, longest: 0 },
    { pillar: 'mental', current: 0, longest: 0 },
    { pillar: 'physical', current: 0, longest: 0 },
    { pillar: 'nutrition', current: 0, longest: 0 },
  ],
  achievements: [
    { id: 'first_task', name: 'First Steps', description: 'Complete your first task', icon: '🎯', unlocked: false },
    { id: 'week_streak', name: '7 Day Warrior', description: 'Maintain a 7-day streak in any pillar', icon: '🔥', unlocked: false },
    { id: 'all_pillars', name: 'Balanced Life', description: 'Complete all 4 pillars in one day', icon: '⚖️', unlocked: false },
    { id: 'level_5', name: 'Growing Strong', description: 'Reach level 5', icon: '🌱', unlocked: false },
    { id: 'level_10', name: 'Peak Performance', description: 'Reach level 10', icon: '⭐', unlocked: false },
  ],
};

const initialFinanceData: FinanceData = {
  emergencyFund: 0,
  emergencyFundGoal: 1000,
  debts: [],
  budgetCategories: [],
};

const initialMentalHealthData: MentalHealthData = {
  gratitudeEntries: [],
  sleepLog: [],
};

const initialPhysicalHealthData: PhysicalHealthData = {
  dailySteps: 0,
  stepsGoal: 8000,
  workouts: [],
};

const initialNutritionData: NutritionData = {
  waterIntake: 0,
  waterGoal: 8,
  hadProtein: false,
};

export const useAppStore = create<AppState>((set, get) => ({
  progress: initialProgress,
  dailyTasks: [],
  financeData: initialFinanceData,
  mentalHealthData: initialMentalHealthData,
  physicalHealthData: initialPhysicalHealthData,
  nutritionData: initialNutritionData,

  loadAppData: async () => {
    console.log('🔍 loadAppData: Starting...');
    try {
      // Load from AsyncStorage (pillar-specific data)
      console.log('🔍 loadAppData: Loading AsyncStorage data...');
      const financeData = await AsyncStorage.getItem('financeData');
      const mentalData = await AsyncStorage.getItem('mentalHealthData');
      const physicalData = await AsyncStorage.getItem('physicalHealthData');
      const nutritionData = await AsyncStorage.getItem('nutritionData');

      if (financeData) set({ financeData: JSON.parse(financeData) });
      if (mentalData) set({ mentalHealthData: JSON.parse(mentalData) });
      if (physicalData) set({ physicalHealthData: JSON.parse(physicalData) });
      if (nutritionData) set({ nutritionData: JSON.parse(nutritionData) });
      console.log('✅ loadAppData: AsyncStorage data loaded');

      // Load progress from SQLite (if user is logged in)
      const { useAuthStore } = require('./authStore');
      const authStore = useAuthStore.getState();
      const userId = authStore.user?.id;

      if (userId) {
        console.log('🔍 loadAppData: User logged in, loading from database...');
        try {
          // Get XP, level, and streaks from SQLite database
          console.log('🔍 loadAppData: Fetching user stats and streaks...');
          const [userStats, streaks] = await Promise.all([
            getUserStats(userId),
            getAllStreaks(userId),
          ]);
          console.log('✅ loadAppData: Got user stats:', userStats);
          console.log('✅ loadAppData: Got streaks:', streaks);

          // Transform SQLite data into AppStore format
          const updatedProgress: UserProgress = {
            level: userStats?.level || 1,
            xp: userStats?.total_xp || 0,
            totalPoints: userStats?.total_xp || 0,
            streaks: [
              { pillar: 'finance', current: streaks.finance || 0, longest: streaks.finance || 0 },
              { pillar: 'mental', current: streaks.mental || 0, longest: streaks.mental || 0 },
              { pillar: 'physical', current: streaks.physical || 0, longest: streaks.physical || 0 },
              { pillar: 'nutrition', current: streaks.nutrition || 0, longest: streaks.nutrition || 0 },
            ],
            achievements: get().progress.achievements, // Keep existing achievements
          };

          set({ progress: updatedProgress });
          console.log('✅ Loaded progress from SQLite:', updatedProgress);

          // Generate daily tasks from database (new intelligent system)
          console.log('🔍 loadAppData: Generating daily tasks...');
          await checkAndGenerateTasks(userId);
          console.log('🔍 loadAppData: Loading daily tasks from DB...');
          await get().loadDailyTasksFromDB(userId);
          console.log('✅ loadAppData: Daily tasks loaded');
        } catch (error) {
          console.error('❌ Error loading progress from SQLite:', error);
          console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown');
          console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
          // Fall back to AsyncStorage if SQLite fails
          console.log('⚠️ Falling back to AsyncStorage...');
          const progressData = await AsyncStorage.getItem('progress');
          if (progressData) set({ progress: JSON.parse(progressData) });
        }
      } else {
        console.log('🔍 loadAppData: No user logged in, using AsyncStorage fallback...');
        // No user logged in - use AsyncStorage fallback
        const progressData = await AsyncStorage.getItem('progress');
        if (progressData) set({ progress: JSON.parse(progressData) });

        const tasksData = await AsyncStorage.getItem('dailyTasks');
        const tasks = tasksData ? JSON.parse(tasksData) : [];
        if (tasks.length === 0) {
          get().generateDailyTasks(); // Fallback to old random task generation
        } else {
          set({ dailyTasks: tasks });
        }
      }
      console.log('✅ loadAppData: Complete!');
    } catch (error) {
      console.error('❌ Error loading app data:', error);
      console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown');
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
      throw error; // Re-throw to be caught by App.tsx
    }
  },

  loadDailyTasksFromDB: async (userId: number) => {
    try {
      const db = await getDatabase();

      // On web, getDatabase returns null - use fallback
      if (!db) {
        console.log('⚠️ Database not available on web, using AsyncStorage fallback');
        const tasksData = await AsyncStorage.getItem('dailyTasks');
        const tasks = tasksData ? JSON.parse(tasksData) : [];
        set({ dailyTasks: tasks });
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      // Load tasks from database
      const tasks = await db.getAllAsync<any>(
        `SELECT id, pillar, title, description, completed, xp_reward
         FROM daily_tasks
         WHERE user_id = ? AND task_date = ?
         ORDER BY id ASC`,
        [userId, today]
      );

      // Transform database tasks to app format
      const formattedTasks: Task[] = tasks.map((task: any) => ({
        id: String(task.id),
        pillar: task.pillar as Pillar,
        title: task.title,
        description: task.description || '',
        duration: 5, // Default duration
        completed: task.completed === 1,
        points: task.xp_reward || 10,
      }));

      set({ dailyTasks: formattedTasks });
      console.log(`✅ Loaded ${formattedTasks.length} daily tasks from database`);
    } catch (error) {
      console.error('Error loading daily tasks from DB:', error);
    }
  },

  generateDailyTasks: () => {
    // Task pools for each pillar
    const taskPools = {
      finance: [
        { title: 'Track Your Expenses', description: 'Record 3 expenses from today', duration: 5, points: 10 },
        { title: 'Review Budget', description: 'Check your budget categories', duration: 10, points: 15 },
        { title: 'Log Debt Payment', description: 'Make a payment on your smallest debt', duration: 5, points: 20 },
        { title: 'Update Emergency Fund', description: 'Add to your emergency savings', duration: 3, points: 10 },
        { title: 'Check Bank Balance', description: 'Review account balances', duration: 2, points: 5 },
      ],
      mental: [
        { title: 'Morning Sunlight', description: 'Get 10 minutes of sunlight exposure', duration: 10, points: 10 },
        { title: 'Meditation Practice', description: 'Complete 5-minute meditation', duration: 5, points: 15 },
        { title: 'Gratitude Journal', description: 'Write 3 things you are grateful for', duration: 5, points: 10 },
        { title: 'Deep Breathing', description: 'Practice box breathing for 3 minutes', duration: 3, points: 10 },
        { title: 'Digital Detox', description: 'Take 30-min break from screens', duration: 30, points: 20 },
      ],
      physical: [
        { title: 'Reach Step Goal', description: 'Walk 8,000 steps today', duration: 60, points: 15 },
        { title: 'Morning Mobility', description: 'Complete 10-minute stretching routine', duration: 10, points: 10 },
        { title: 'Log Workout', description: 'Record today exercise session', duration: 5, points: 15 },
        { title: 'Active Break', description: 'Take a 10-minute walk', duration: 10, points: 10 },
        { title: 'Cold Exposure', description: 'End shower with 30s cold water', duration: 1, points: 20 },
      ],
      nutrition: [
        { title: 'Drink Water', description: 'Drink 8 glasses of water today', duration: 1, points: 10 },
        { title: 'Protein Tracking', description: 'Log protein intake for meals', duration: 5, points: 10 },
        { title: 'Plan Meals', description: 'Plan tomorrow meals', duration: 10, points: 15 },
        { title: 'Mindful Eating', description: 'Eat one meal without distractions', duration: 20, points: 15 },
        { title: 'Hydration Check', description: 'Drink water every 2 hours', duration: 1, points: 10 },
      ],
    };

    // Randomly select one task from each pillar
    const tasks: Task[] = [];
    const pillars: Pillar[] = ['finance', 'mental', 'physical', 'nutrition'];

    pillars.forEach((pillar) => {
      const pool = taskPools[pillar];
      const randomTask = pool[Math.floor(Math.random() * pool.length)];

      tasks.push({
        id: `${pillar}_${Date.now()}_${Math.random()}`,
        pillar,
        title: randomTask.title,
        description: randomTask.description,
        duration: randomTask.duration,
        completed: false,
        points: randomTask.points,
      });
    });

    // Shuffle tasks for variety
    const shuffledTasks = tasks.sort(() => Math.random() - 0.5);

    set({ dailyTasks: shuffledTasks });
    AsyncStorage.setItem('dailyTasks', JSON.stringify(shuffledTasks));
  },

  completeTask: async (taskId: string) => {
    const tasks = get().dailyTasks;
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    const updatedTask = {
      ...task,
      completed: true,
      completedAt: new Date().toISOString(),
    };

    const updatedTasks = [...tasks];
    updatedTasks[taskIndex] = updatedTask;

    set({ dailyTasks: updatedTasks });
    await AsyncStorage.setItem('dailyTasks', JSON.stringify(updatedTasks));

    // Add points and update streak
    get().addPoints(task.points);
    get().updateStreak(task.pillar);

    // Send task completion notification
    const completedCount = updatedTasks.filter(t => t.completed).length;
    const totalCount = updatedTasks.length;
    await sendTaskCompletedNotification(task.title, task.points, completedCount, totalCount);

    // Schedule streak protection if tasks remain
    const remainingTasks = totalCount - completedCount;
    if (remainingTasks > 0) {
      const currentStreak = Math.max(...get().progress.streaks.map(s => s.current), 0);
      await scheduleStreakProtectionNotification(currentStreak, remainingTasks);
    }

    // Check for achievements
    if (completedCount === 1) {
      get().unlockAchievement('first_task');
    }
    if (completedCount === totalCount) {
      get().unlockAchievement('all_pillars');
    }
  },

  updateStreak: (pillar: Pillar) => {
    const progress = get().progress;
    const streakIndex = progress.streaks.findIndex(s => s.pillar === pillar);

    if (streakIndex === -1) return;

    const streak = progress.streaks[streakIndex];
    const today = new Date().toISOString().split('T')[0];
    const lastCompleted = streak.lastCompletedDate?.split('T')[0];

    if (lastCompleted === today) return;

    const newCurrent = streak.current + 1;
    const newLongest = Math.max(newCurrent, streak.longest);

    const updatedStreaks = [...progress.streaks];
    updatedStreaks[streakIndex] = {
      ...streak,
      current: newCurrent,
      longest: newLongest,
      lastCompletedDate: new Date().toISOString(),
    };

    const updatedProgress = { ...progress, streaks: updatedStreaks };
    set({ progress: updatedProgress });
    AsyncStorage.setItem('progress', JSON.stringify(updatedProgress));

    // Check for streak achievement
    if (newCurrent >= 7) {
      get().unlockAchievement('week_streak');
    }
  },

  addPoints: async (points: number) => {
    const progress = get().progress;
    const oldLevel = progress.level;
    const newTotalPoints = progress.totalPoints + points;
    const newXP = progress.xp + points;
    const newLevel = Math.floor(newXP / 100) + 1;

    const updatedProgress = {
      ...progress,
      totalPoints: newTotalPoints,
      xp: newXP,
      level: newLevel,
    };

    set({ progress: updatedProgress });
    await AsyncStorage.setItem('progress', JSON.stringify(updatedProgress));

    // Send level up notification if level changed
    if (newLevel > oldLevel) {
      await sendLevelUpNotification(newLevel);
    }

    // Check for level achievements
    if (newLevel >= 5) {
      get().unlockAchievement('level_5');
    }
    if (newLevel >= 10) {
      get().unlockAchievement('level_10');
    }
  },

  updateFinanceData: async (data: Partial<FinanceData>) => {
    const updated = { ...get().financeData, ...data };
    set({ financeData: updated });
    await AsyncStorage.setItem('financeData', JSON.stringify(updated));
  },

  updateMentalHealthData: async (data: Partial<MentalHealthData>) => {
    const updated = { ...get().mentalHealthData, ...data };
    set({ mentalHealthData: updated });
    await AsyncStorage.setItem('mentalHealthData', JSON.stringify(updated));
  },

  updatePhysicalHealthData: async (data: Partial<PhysicalHealthData>) => {
    const updated = { ...get().physicalHealthData, ...data };
    set({ physicalHealthData: updated });
    await AsyncStorage.setItem('physicalHealthData', JSON.stringify(updated));
  },

  updateNutritionData: async (data: Partial<NutritionData>) => {
    const updated = { ...get().nutritionData, ...data };
    set({ nutritionData: updated });
    await AsyncStorage.setItem('nutritionData', JSON.stringify(updated));
  },

  unlockAchievement: async (achievementId: string) => {
    const progress = get().progress;
    const achievementIndex = progress.achievements.findIndex(a => a.id === achievementId);

    if (achievementIndex === -1) return;

    const achievement = progress.achievements[achievementIndex];
    if (achievement.unlocked) return;

    const updatedAchievements = [...progress.achievements];
    updatedAchievements[achievementIndex] = {
      ...achievement,
      unlocked: true,
      unlockedAt: new Date().toISOString(),
    };

    const updatedProgress = { ...progress, achievements: updatedAchievements };
    set({ progress: updatedProgress });
    await AsyncStorage.setItem('progress', JSON.stringify(updatedProgress));

    // Send achievement notification
    const xpReward = 50; // Default XP for achievements
    await sendAchievementNotification(achievement.name, xpReward);
  },
}));