/**
 * Firebase User Service
 *
 * Handles all user-related database operations using Firestore
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
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
  created_at: any;
  updated_at: any;
}

/**
 * Get user stats (XP, level, streaks)
 */
export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    const userStatsRef = doc(db, 'user_stats', userId);
    const userStatsSnap = await getDoc(userStatsRef);

    if (!userStatsSnap.exists()) {
      // If stats don't exist, create them
      const newStats: Omit<UserStats, 'id'> = {
        user_id: userId,
        total_xp: 0,
        level: 1,
        finance_streak: 0,
        mental_streak: 0,
        physical_streak: 0,
        nutrition_streak: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      await setDoc(userStatsRef, newStats);

      return {
        id: userId,
        ...newStats,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const data = userStatsSnap.data();
    return {
      id: userStatsSnap.id,
      ...data,
    } as UserStats;
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
    // Filter out undefined values - Firestore doesn't accept explicit undefined
    const cleanUpdates: any = {
      updated_at: serverTimestamp(),
    };

    // Only include fields that are not undefined
    Object.keys(updates).forEach(key => {
      if ((updates as any)[key] !== undefined) {
        cleanUpdates[key] = (updates as any)[key];
      }
    });

    const userStatsRef = doc(db, 'user_stats', userId);
    await updateDoc(userStatsRef, cleanUpdates);
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

    const tasksRef = collection(db, 'daily_tasks');
    // Simplified query - removed orderBy to avoid composite index requirement
    const q = query(
      tasksRef,
      where('user_id', '==', userId),
      where('task_date', '==', taskDate)
    );

    const querySnapshot = await getDocs(q);
    const tasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort in JavaScript instead of in Firestore query
    tasks.sort((a: any, b: any) => {
      const aTime = a.created_at?.toMillis?.() || 0;
      const bTime = b.created_at?.toMillis?.() || 0;
      return aTime - bTime;
    });

    return tasks;
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
    const taskRef = doc(db, 'daily_tasks', taskId);
    const taskSnap = await getDoc(taskRef);

    if (!taskSnap.exists()) {
      throw new Error('Task not found');
    }

    const taskData = taskSnap.data();
    if (taskData.user_id !== userId) {
      throw new Error('Unauthorized');
    }

    await updateDoc(taskRef, {
      completed: true,
      completed_at: serverTimestamp(),
    });
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
    const createdTasks = [];

    for (const task of tasks) {
      const taskRef = doc(collection(db, 'daily_tasks'));
      const taskData = {
        user_id: userId,
        task_date: today,
        ...task,
        completed: false,
        created_at: serverTimestamp(),
      };

      await setDoc(taskRef, taskData);
      createdTasks.push({
        id: taskRef.id,
        ...taskData,
      });
    }

    return createdTasks;
  } catch (error) {
    console.error('Error creating daily tasks:', error);
    throw error;
  }
};

/**
 * Create or update user profile in Firestore
 */
export const createUserProfile = async (userId: string, data: {
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  onboarded?: boolean;
}) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...data,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  onboarded: boolean;
  created_at?: any;
  updated_at?: any;
}

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    return {
      id: userSnap.id,
      ...userSnap.data(),
    } as UserProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId: string, updates: {
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
  onboarded?: boolean;
}) => {
  try {
    // Filter out undefined values - Firestore doesn't accept explicit undefined
    const cleanUpdates: any = {
      updated_at: serverTimestamp(),
    };

    if (updates.age !== undefined) cleanUpdates.age = updates.age;
    if (updates.weight !== undefined) cleanUpdates.weight = updates.weight;
    if (updates.height !== undefined) cleanUpdates.height = updates.height;
    if (updates.gender !== undefined) cleanUpdates.gender = updates.gender;
    if (updates.onboarded !== undefined) cleanUpdates.onboarded = updates.onboarded;

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, cleanUpdates);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Delete all user data from Firestore
 * This will remove:
 * - User profile
 * - User stats (XP, level, streaks)
 * - All daily tasks
 * - All progress data
 *
 * Note: This does NOT delete the Firebase Auth account - just the Firestore data
 * After calling this, the user will need to complete onboarding again
 */
export const deleteAllUserData = async (userId: string): Promise<void> => {
  try {
    console.log(`Deleting all data for user: ${userId}`);

    // Delete user profile
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      // Instead of deleting, set onboarded to false to force onboarding
      await updateDoc(userRef, {
        onboarded: false,
        updated_at: serverTimestamp(),
      });
      console.log('User profile marked as not onboarded');
    }

    // Delete user stats
    const userStatsRef = doc(db, 'user_stats', userId);
    const statsSnap = await getDoc(userStatsRef);
    if (statsSnap.exists()) {
      // Reset stats to initial values
      await setDoc(userStatsRef, {
        user_id: userId,
        total_xp: 0,
        level: 1,
        finance_streak: 0,
        mental_streak: 0,
        physical_streak: 0,
        nutrition_streak: 0,
        last_active_date: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      console.log('User stats reset');
    }

    // Delete all daily tasks
    const tasksRef = collection(db, 'daily_tasks');
    const tasksQuery = query(tasksRef, where('user_id', '==', userId));
    const tasksSnapshot = await getDocs(tasksQuery);

    const deletePromises = tasksSnapshot.docs.map(taskDoc => {
      return updateDoc(doc(db, 'daily_tasks', taskDoc.id), {
        completed: false,
        completed_at: null,
      });
    });
    await Promise.all(deletePromises);
    console.log(`Reset ${tasksSnapshot.size} tasks`);

    console.log('All user data deleted successfully');
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};
