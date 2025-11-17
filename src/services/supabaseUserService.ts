/**
 * Supabase User Service
 *
 * Handles all user-related database operations using Supabase
 */

import { supabase } from '../config/supabase';
import { Pillar } from '../types';

export interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  finance_streak: number;
  mental_streak: number;
  physical_streak: number;
  nutrition_streak: number;
  last_active_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get user stats (XP, level, streaks)
 */
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    const { data, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If stats don't exist, create them
      if (error.code === 'PGRST116') {
        const { data: newStats, error: insertError } = await supabase
          .from('user_stats')
          .insert({
            user_id: userId,
            total_xp: 0,
            level: 1,
            finance_streak: 0,
            mental_streak: 0,
            physical_streak: 0,
            nutrition_streak: 0,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newStats;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting user stats:', error);
    return null;
  }
};

/**
 * Update user stats
 */
export const updateUserStats = async (
  userId: string,
  updates: Partial<Omit<UserStats, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_stats')
      .update(updates)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};

/**
 * Add XP to user and calculate new level
 */
export const addXP = async (userId: string, xpAmount: number): Promise<{ totalXP: number; level: number }> => {
  try {
    const stats = await getUserStats(userId);
    if (!stats) throw new Error('User stats not found');

    const newTotalXP = stats.total_xp + xpAmount;
    const newLevel = Math.floor(newTotalXP / 100) + 1;

    await updateUserStats(userId, {
      total_xp: newTotalXP,
      level: newLevel,
    });

    return { totalXP: newTotalXP, level: newLevel };
  } catch (error) {
    console.error('Error adding XP:', error);
    throw error;
  }
};

/**
 * Update streak for a pillar
 */
export const updateStreak = async (userId: string, pillar: Pillar): Promise<number> => {
  try {
    const stats = await getUserStats(userId);
    if (!stats) throw new Error('User stats not found');

    const streakField = `${pillar}_streak` as keyof UserStats;
    const currentStreak = stats[streakField] as number || 0;

    const today = new Date().toISOString().split('T')[0];
    const lastActiveDate = stats.last_active_date;

    let newStreak = currentStreak;

    if (lastActiveDate) {
      const lastDate = new Date(lastActiveDate);
      const todayDate = new Date(today);
      const diffTime = todayDate.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        // Same day, don't increment streak
        return currentStreak;
      } else if (diffDays === 1) {
        // Next day, increment streak
        newStreak = currentStreak + 1;
      } else {
        // Streak broken, reset to 1
        newStreak = 1;
      }
    } else {
      // First day
      newStreak = 1;
    }

    await updateUserStats(userId, {
      [streakField]: newStreak,
      last_active_date: today,
    });

    return newStreak;
  } catch (error) {
    console.error('Error updating streak:', error);
    throw error;
  }
};

/**
 * Get all streaks for a user
 */
export const getAllStreaks = async (userId: string): Promise<{
  finance: number;
  mental: number;
  physical: number;
  nutrition: number;
}> => {
  try {
    const stats = await getUserStats(userId);
    if (!stats) {
      return { finance: 0, mental: 0, physical: 0, nutrition: 0 };
    }

    return {
      finance: stats.finance_streak || 0,
      mental: stats.mental_streak || 0,
      physical: stats.physical_streak || 0,
      nutrition: stats.nutrition_streak || 0,
    };
  } catch (error) {
    console.error('Error getting streaks:', error);
    return { finance: 0, mental: 0, physical: 0, nutrition: 0 };
  }
};

/**
 * Get daily tasks for a specific date
 */
export const getDailyTasks = async (userId: string, date?: string) => {
  try {
    const taskDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('task_date', taskDate)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error getting daily tasks:', error);
    return [];
  }
};

/**
 * Complete a task
 */
export const completeTask = async (taskId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('daily_tasks')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error completing task:', error);
    throw error;
  }
};

/**
 * Create daily tasks
 */
export const createDailyTasks = async (userId: string, tasks: Array<{
  pillar: Pillar;
  title: string;
  description: string;
  xp_reward: number;
}>) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const tasksToInsert = tasks.map(task => ({
      user_id: userId,
      task_date: today,
      ...task,
    }));

    const { data, error } = await supabase
      .from('daily_tasks')
      .insert(tasksToInsert)
      .select();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error creating daily tasks:', error);
    throw error;
  }
};
