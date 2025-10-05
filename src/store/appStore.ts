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
import { useAuthStore } from './authStore';

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
  generateDailyTasks: () => void;
  completeTask: (taskId: string) => Promise<void>;
  updateStreak: (pillar: Pillar) => void;
  addPoints: (points: number) => void;
  updateFinanceData: (data: Partial<FinanceData>) => Promise<void>;
  updateMentalHealthData: (data: Partial<MentalHealthData>) => Promise<void>;
  updatePhysicalHealthData: (data: Partial<PhysicalHealthData>) => Promise<void>;
  updateNutritionData: (data: Partial<NutritionData>) => Promise<void>;
  unlockAchievement: (achievementId: string) => void;
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
    try {
      // Get user ID from auth store
      const userId = useAuthStore.getState().user?.id;
      if (!userId) {
        console.log('No user logged in, skipping stats load');
        return;
      }

      // Load user stats from database
      const stats = await getUserStats(userId);
      const streaks = await getAllStreaks(userId);
      const dailyProgress = await getDailyProgress(userId);

      // Update progress with database data
      const updatedProgress: UserProgress = {
        level: stats?.level || 1,
        xp: stats?.total_xp || 0,
        totalPoints: stats?.total_xp || 0,
        streaks: [
          { pillar: 'finance', current: streaks.finance, longest: streaks.finance },
          { pillar: 'mental', current: streaks.mental, longest: streaks.mental },
          { pillar: 'physical', current: streaks.physical, longest: streaks.physical },
          { pillar: 'nutrition', current: streaks.nutrition, longest: streaks.nutrition },
        ],
        achievements: get().progress.achievements, // Keep existing achievements for now
      };

      set({ progress: updatedProgress });

      // Load other data from AsyncStorage
      const tasksData = await AsyncStorage.getItem('dailyTasks');
      const financeData = await AsyncStorage.getItem('financeData');
      const mentalData = await AsyncStorage.getItem('mentalHealthData');
      const physicalData = await AsyncStorage.getItem('physicalHealthData');
      const nutritionData = await AsyncStorage.getItem('nutritionData');

      if (tasksData) set({ dailyTasks: JSON.parse(tasksData) });
      if (financeData) set({ financeData: JSON.parse(financeData) });
      if (mentalData) set({ mentalHealthData: JSON.parse(mentalData) });
      if (physicalData) set({ physicalHealthData: JSON.parse(physicalData) });
      if (nutritionData) set({ nutritionData: JSON.parse(nutritionData) });

      // Generate tasks if none exist or it's a new day
      const tasks = tasksData ? JSON.parse(tasksData) : [];
      if (tasks.length === 0) {
        get().generateDailyTasks();
      }
    } catch (error) {
      console.error('Error loading app data:', error);
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

    // Check for achievements
    const completedCount = updatedTasks.filter(t => t.completed).length;
    if (completedCount === 1) {
      get().unlockAchievement('first_task');
    }
    if (completedCount === 4) {
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

  addPoints: (points: number) => {
    const progress = get().progress;
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
    AsyncStorage.setItem('progress', JSON.stringify(updatedProgress));

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

  unlockAchievement: (achievementId: string) => {
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
    AsyncStorage.setItem('progress', JSON.stringify(updatedProgress));
  },
}));