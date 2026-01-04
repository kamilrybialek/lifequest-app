/**
 * Goals Store
 *
 * Manages time-based goals using Zustand state management:
 * - Monthly goals (30-day targets)
 * - Quarterly goals (90-day targets)
 * - Yearly goals (365-day targets)
 * - Life goals (300 lifetime aspirations - Steve Harvey method)
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TimeHorizon = 'month' | 'quarter' | 'year' | 'life';

export interface Goal {
  id: string;
  text: string;
  completed: boolean;
  timeHorizon: TimeHorizon;
  createdAt: number;
  completedAt?: number;
  category?: string; // Optional: finance, career, health, relationships, experiences, education, charity, hobbies
}

interface GoalsState {
  // Data
  goals: Goal[];
  isLoading: boolean;

  // Actions
  loadGoals: () => Promise<void>;
  addGoal: (text: string, timeHorizon: TimeHorizon, category?: string) => Promise<void>;
  toggleGoal: (goalId: string) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  updateGoal: (goalId: string, updates: Partial<Goal>) => Promise<void>;
  clearCompletedGoals: (timeHorizon?: TimeHorizon) => Promise<void>;

  // Selectors (helper methods)
  getGoalsByHorizon: (horizon: TimeHorizon) => Goal[];
  getGoalsByCategory: (category: string) => Goal[];
  getCompletedGoalsCount: (horizon?: TimeHorizon) => number;
  getTotalGoalsCount: (horizon?: TimeHorizon) => number;
  getLifeGoalsProgress: () => number; // Returns percentage towards 300 life goals
}

const STORAGE_KEY = '@lifequest:goals';

export const useGoalsStore = create<GoalsState>((set, get) => ({
  // Initial state
  goals: [],
  isLoading: false,

  // Load goals from AsyncStorage
  loadGoals: async () => {
    try {
      set({ isLoading: true });
      const storedGoals = await AsyncStorage.getItem(STORAGE_KEY);

      if (storedGoals) {
        const goals = JSON.parse(storedGoals) as Goal[];
        set({ goals, isLoading: false });
        console.log('📊 Loaded goals from storage:', goals.length);
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
      set({ isLoading: false });
    }
  },

  // Add a new goal
  addGoal: async (text: string, timeHorizon: TimeHorizon, category?: string) => {
    try {
      const newGoal: Goal = {
        id: Date.now().toString(),
        text: text.trim(),
        completed: false,
        timeHorizon,
        category,
        createdAt: Date.now(),
      };

      const updatedGoals = [...get().goals, newGoal];
      set({ goals: updatedGoals });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals));
      console.log('✅ Goal added:', newGoal.text);
    } catch (error) {
      console.error('Failed to add goal:', error);
    }
  },

  // Toggle goal completion status
  toggleGoal: async (goalId: string) => {
    try {
      const updatedGoals = get().goals.map((goal) => {
        if (goal.id === goalId) {
          const completed = !goal.completed;
          return {
            ...goal,
            completed,
            completedAt: completed ? Date.now() : undefined,
          };
        }
        return goal;
      });

      set({ goals: updatedGoals });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals));

      const toggledGoal = updatedGoals.find((g) => g.id === goalId);
      console.log(toggledGoal?.completed ? '✅ Goal completed' : '⏸️ Goal uncompleted', toggledGoal?.text);
    } catch (error) {
      console.error('Failed to toggle goal:', error);
    }
  },

  // Delete a goal
  deleteGoal: async (goalId: string) => {
    try {
      const updatedGoals = get().goals.filter((goal) => goal.id !== goalId);
      set({ goals: updatedGoals });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals));
      console.log('🗑️ Goal deleted');
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  },

  // Update a goal
  updateGoal: async (goalId: string, updates: Partial<Goal>) => {
    try {
      const updatedGoals = get().goals.map((goal) =>
        goal.id === goalId ? { ...goal, ...updates } : goal
      );

      set({ goals: updatedGoals });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals));
      console.log('📝 Goal updated:', goalId);
    } catch (error) {
      console.error('Failed to update goal:', error);
    }
  },

  // Clear completed goals
  clearCompletedGoals: async (timeHorizon?: TimeHorizon) => {
    try {
      const updatedGoals = get().goals.filter((goal) => {
        if (!goal.completed) return true;
        if (timeHorizon) {
          return goal.timeHorizon !== timeHorizon;
        }
        return false;
      });

      set({ goals: updatedGoals });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedGoals));
      console.log('🗑️ Completed goals cleared');
    } catch (error) {
      console.error('Failed to clear completed goals:', error);
    }
  },

  // Get goals by time horizon
  getGoalsByHorizon: (horizon: TimeHorizon) => {
    return get().goals.filter((goal) => goal.timeHorizon === horizon);
  },

  // Get goals by category
  getGoalsByCategory: (category: string) => {
    return get().goals.filter((goal) => goal.category === category);
  },

  // Get completed goals count
  getCompletedGoalsCount: (horizon?: TimeHorizon) => {
    const goals = horizon
      ? get().goals.filter((g) => g.timeHorizon === horizon)
      : get().goals;

    return goals.filter((g) => g.completed).length;
  },

  // Get total goals count
  getTotalGoalsCount: (horizon?: TimeHorizon) => {
    return horizon
      ? get().goals.filter((g) => g.timeHorizon === horizon).length
      : get().goals.length;
  },

  // Get life goals progress (towards 300)
  getLifeGoalsProgress: () => {
    const lifeGoals = get().goals.filter((g) => g.timeHorizon === 'life');
    return (lifeGoals.length / 300) * 100;
  },
}));

// ============================================================================
// SELECTIVE HOOKS (Performance Optimization)
// ============================================================================

/**
 * Use these hooks instead of useGoalsStore() to prevent unnecessary re-renders
 */

export const useGoals = () => useGoalsStore((state) => state.goals);
export const useGoalsByHorizon = (horizon: TimeHorizon) =>
  useGoalsStore((state) => state.getGoalsByHorizon(horizon));
export const useLifeGoalsProgress = () =>
  useGoalsStore((state) => state.getLifeGoalsProgress());
export const useGoalsActions = () =>
  useGoalsStore((state) => ({
    addGoal: state.addGoal,
    toggleGoal: state.toggleGoal,
    deleteGoal: state.deleteGoal,
    updateGoal: state.updateGoal,
    clearCompletedGoals: state.clearCompletedGoals,
  }));
