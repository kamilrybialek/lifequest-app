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
import {
  scheduleStreakProtectionNotification,
  sendAchievementNotification,
  sendLevelUpNotification,
  sendTaskCompletedNotification,
} from '../utils/notifications.web';
import { getSmartTasksForToday, loadTasks, saveTasks, SmartTask } from '../utils/intelligentTaskGenerator.web';

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
  generateSmartTasks: (userId: number) => Promise<void>;
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
    console.log('🔍 [WEB] loadAppData: Starting...');
    try {
      // Load from AsyncStorage
      console.log('🔍 [WEB] Loading AsyncStorage data...');
      const [financeData, mentalData, physicalData, nutritionData, progressData] = await Promise.all([
        AsyncStorage.getItem('financeData'),
        AsyncStorage.getItem('mentalHealthData'),
        AsyncStorage.getItem('physicalHealthData'),
        AsyncStorage.getItem('nutritionData'),
        AsyncStorage.getItem('progress'),
      ]);

      if (financeData) set({ financeData: JSON.parse(financeData) });
      if (mentalData) set({ mentalHealthData: JSON.parse(mentalData) });
      if (physicalData) set({ physicalHealthData: JSON.parse(physicalData) });
      if (nutritionData) set({ nutritionData: JSON.parse(nutritionData) });
      if (progressData) set({ progress: JSON.parse(progressData) });

      // Try to load or generate smart tasks
      const tasks = await loadTasks();
      if (tasks.length === 0) {
        console.log('🧠 [WEB] No tasks found, generating smart tasks...');
        await get().generateSmartTasks(1); // Use userId 1 as default for web
      } else {
        console.log(`📥 [WEB] Loaded ${tasks.length} existing tasks`);
        set({ dailyTasks: tasks as any });
      }

      console.log('✅ [WEB] loadAppData: Complete!');
    } catch (error) {
      console.error('❌ [WEB] Error loading app data:', error);
      throw error;
    }
  },

  generateSmartTasks: async (userId: number) => {
    try {
      console.log('🧠 [WEB] Generating smart tasks for user:', userId);

      // Try to load existing tasks from today first
      const existingTasks = await loadTasks();

      // Check if tasks are from today
      const today = new Date().toISOString().split('T')[0];
      const tasksDate = await AsyncStorage.getItem('tasks_generated_date');

      if (tasksDate === today && existingTasks.length > 0) {
        console.log('✅ [WEB] Using existing tasks from today');
        set({ dailyTasks: existingTasks as any });
        return;
      }

      // Generate new smart tasks
      const smartTasks = await getSmartTasksForToday(userId);

      // Save generation date
      await AsyncStorage.setItem('tasks_generated_date', today);

      // Convert SmartTask to Task format for store
      const tasks: Task[] = smartTasks.map(st => ({
        id: st.id,
        pillar: st.pillar,
        title: st.title,
        description: st.description,
        duration: st.duration,
        completed: st.completed,
        points: st.points,
        action_type: st.action_type,
        action_screen: st.action_screen,
        action_params: st.action_params,
        difficulty: st.difficulty,
        streak_eligible: st.streak_eligible,
      }));

      set({ dailyTasks: tasks });
      console.log(`✅ [WEB] Generated ${tasks.length} smart tasks`);
    } catch (error) {
      console.error('❌ [WEB] Error generating smart tasks:', error);
      set({ dailyTasks: [] });
    }
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

    // Save to storage
    await AsyncStorage.setItem('dailyTasks', JSON.stringify(updatedTasks));
    await saveTasks(updatedTasks as any);

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
