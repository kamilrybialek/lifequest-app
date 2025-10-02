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
      const progressData = await AsyncStorage.getItem('progress');
      const tasksData = await AsyncStorage.getItem('dailyTasks');
      const financeData = await AsyncStorage.getItem('financeData');
      const mentalData = await AsyncStorage.getItem('mentalHealthData');
      const physicalData = await AsyncStorage.getItem('physicalHealthData');
      const nutritionData = await AsyncStorage.getItem('nutritionData');

      if (progressData) set({ progress: JSON.parse(progressData) });
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
    const tasks: Task[] = [
      // Finance
      {
        id: 'finance_' + Date.now(),
        pillar: 'finance',
        title: 'Track Your Expenses',
        description: 'Record 3 expenses from today',
        duration: 5,
        completed: false,
        points: 10,
      },
      // Mental Health
      {
        id: 'mental_' + Date.now(),
        pillar: 'mental',
        title: 'Morning Sunlight',
        description: 'Get 10 minutes of sunlight exposure',
        duration: 10,
        completed: false,
        points: 10,
      },
      // Physical Health
      {
        id: 'physical_' + Date.now(),
        pillar: 'physical',
        title: 'Reach Step Goal',
        description: 'Walk 8,000 steps today',
        duration: 60,
        completed: false,
        points: 10,
      },
      // Nutrition
      {
        id: 'nutrition_' + Date.now(),
        pillar: 'nutrition',
        title: 'Drink Water',
        description: 'Drink 8 glasses of water today',
        duration: 1,
        completed: false,
        points: 10,
      },
    ];

    set({ dailyTasks: tasks });
    AsyncStorage.setItem('dailyTasks', JSON.stringify(tasks));
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