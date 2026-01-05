/**
 * Optimized Zustand Store Selectors
 * Prevents unnecessary re-renders by subscribing to specific state slices
 *
 * BEFORE (❌ BAD - re-renders on any state change):
 * const { progress, dailyTasks, financeData } = useAppStore();
 *
 * AFTER (✅ GOOD - only re-renders when specific data changes):
 * const level = useAppLevel();
 * const xp = useAppXP();
 */

import { useAppStore as useAppStoreBase } from '../store/appStore';

// ============================================================================
// PROGRESS SELECTORS
// ============================================================================

export const useAppLevel = () => useAppStoreBase((state) => state.progress.level);
export const useAppXP = () => useAppStoreBase((state) => state.progress.xp);
export const useAppTotalPoints = () => useAppStoreBase((state) => state.progress.totalPoints);

export const useAppStreaks = () => useAppStoreBase((state) => state.progress.streaks);
export const useAppStreak = (pillar: 'finance' | 'mental' | 'physical' | 'nutrition') =>
  useAppStoreBase((state) => state.progress.streaks.find((s) => s.pillar === pillar));

export const useAppAchievements = () => useAppStoreBase((state) => state.progress.achievements);
export const useUnlockedAchievements = () =>
  useAppStoreBase((state) => state.progress.achievements.filter((a) => a.unlocked));

// ============================================================================
// TASK SELECTORS
// ============================================================================

export const useDailyTasks = () => useAppStoreBase((state) => state.dailyTasks);
export const useCompletedTasks = () =>
  useAppStoreBase((state) => state.dailyTasks.filter((t) => t.completed));
export const usePendingTasks = () =>
  useAppStoreBase((state) => state.dailyTasks.filter((t) => !t.completed));

// ============================================================================
// PILLAR DATA SELECTORS
// ============================================================================

export const useFinanceData = () => useAppStoreBase((state) => state.financeData);
export const useMentalHealthData = () => useAppStoreBase((state) => state.mentalHealthData);
export const usePhysicalHealthData = () => useAppStoreBase((state) => state.physicalHealthData);
export const useNutritionData = () => useAppStoreBase((state) => state.nutritionData);

// ============================================================================
// ACTION SELECTORS
// ============================================================================

export const useLoadAppData = () => useAppStoreBase((state) => state.loadAppData);
export const useCompleteTask = () => useAppStoreBase((state) => state.completeTask);
export const useUpdateStreak = () => useAppStoreBase((state) => state.updateStreak);
export const useAddPoints = () => useAppStoreBase((state) => state.addPoints);

// ============================================================================
// COMPOSITE SELECTORS (for common combinations)
// ============================================================================

export const useUserProgress = () =>
  useAppStoreBase((state) => ({
    level: state.progress.level,
    xp: state.progress.xp,
    totalPoints: state.progress.totalPoints,
  }));

export const useStreakStats = () =>
  useAppStoreBase((state) => {
    const streaks = state.progress.streaks;
    return {
      totalStreak: streaks.reduce((sum, s) => sum + s.current, 0),
      bestStreak: Math.max(...streaks.map((s) => s.longest), 0),
      streaks,
    };
  });

export const useAchievementStats = () =>
  useAppStoreBase((state) => {
    const achievements = state.progress.achievements;
    return {
      unlocked: achievements.filter((a) => a.unlocked).length,
      total: achievements.length,
      achievements,
    };
  });

// ============================================================================
// RE-EXPORT BASE STORE (for backward compatibility)
// ============================================================================

export { useAppStore } from '../store/appStore';
