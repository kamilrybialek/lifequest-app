/**
 * Firebase Task Service
 *
 * Manages user tasks (Apple Reminders style) with tags and lists
 * Separate from daily smart tasks - these are user-created tasks
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserTask, TaskTag, TaskList } from '../types';

// ============================================================================
// USER TASKS
// ============================================================================

/**
 * Get all tasks for a user
 */
export const getUserTasks = async (userId: string): Promise<UserTask[]> => {
  try {
    const tasksRef = collection(db, 'user_tasks');
    const q = query(
      tasksRef,
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      updated_at: doc.data().updated_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      completed_at: doc.data().completed_at?.toDate?.()?.toISOString(),
      due_date: doc.data().due_date?.toDate?.()?.toISOString(),
    })) as UserTask[];
  } catch (error) {
    console.error('Error getting user tasks:', error);
    return [];
  }
};

/**
 * Get tasks by tag
 */
export const getTasksByTag = async (userId: string, tagName: string): Promise<UserTask[]> => {
  try {
    const tasksRef = collection(db, 'user_tasks');
    const q = query(
      tasksRef,
      where('user_id', '==', userId),
      where('tags', 'array-contains', tagName),
      orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      updated_at: doc.data().updated_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      completed_at: doc.data().completed_at?.toDate?.()?.toISOString(),
      due_date: doc.data().due_date?.toDate?.()?.toISOString(),
    })) as UserTask[];
  } catch (error) {
    console.error('Error getting tasks by tag:', error);
    return [];
  }
};

/**
 * Get tasks by list
 */
export const getTasksByList = async (userId: string, listId: string): Promise<UserTask[]> => {
  try {
    const tasksRef = collection(db, 'user_tasks');
    const q = query(
      tasksRef,
      where('user_id', '==', userId),
      where('list_id', '==', listId),
      orderBy('created_at', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      updated_at: doc.data().updated_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      completed_at: doc.data().completed_at?.toDate?.()?.toISOString(),
      due_date: doc.data().due_date?.toDate?.()?.toISOString(),
    })) as UserTask[];
  } catch (error) {
    console.error('Error getting tasks by list:', error);
    return [];
  }
};

/**
 * Create a new task
 */
export const createTask = async (
  userId: string,
  taskData: Omit<UserTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<string> => {
  try {
    const tasksRef = collection(db, 'user_tasks');

    const docRef = await addDoc(tasksRef, {
      user_id: userId,
      title: taskData.title,
      notes: taskData.notes || '',
      completed: taskData.completed || false,
      completed_at: taskData.completed_at ? Timestamp.fromDate(new Date(taskData.completed_at)) : null,
      due_date: taskData.due_date ? Timestamp.fromDate(new Date(taskData.due_date)) : null,
      priority: taskData.priority || 'none',
      tags: taskData.tags || [],
      list_id: taskData.list_id || null,
      flagged: taskData.flagged || false,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    console.log('✅ Task created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating task:', error);
    throw error;
  }
};

/**
 * Update a task
 */
export const updateTask = async (
  taskId: string,
  updates: Partial<Omit<UserTask, 'id' | 'user_id' | 'created_at'>>
): Promise<void> => {
  try {
    const taskRef = doc(db, 'user_tasks', taskId);

    const cleanUpdates: any = {
      updated_at: serverTimestamp(),
    };

    if (updates.title !== undefined) cleanUpdates.title = updates.title;
    if (updates.notes !== undefined) cleanUpdates.notes = updates.notes;
    if (updates.completed !== undefined) cleanUpdates.completed = updates.completed;
    if (updates.completed_at !== undefined) {
      cleanUpdates.completed_at = updates.completed_at
        ? Timestamp.fromDate(new Date(updates.completed_at))
        : null;
    }
    if (updates.due_date !== undefined) {
      cleanUpdates.due_date = updates.due_date
        ? Timestamp.fromDate(new Date(updates.due_date))
        : null;
    }
    if (updates.priority !== undefined) cleanUpdates.priority = updates.priority;
    if (updates.tags !== undefined) cleanUpdates.tags = updates.tags;
    if (updates.list_id !== undefined) cleanUpdates.list_id = updates.list_id;
    if (updates.flagged !== undefined) cleanUpdates.flagged = updates.flagged;

    await updateDoc(taskRef, cleanUpdates);
    console.log('✅ Task updated:', taskId);
  } catch (error) {
    console.error('❌ Error updating task:', error);
    throw error;
  }
};

/**
 * Toggle task completion
 */
export const toggleTaskCompletion = async (taskId: string, completed: boolean): Promise<void> => {
  try {
    const taskRef = doc(db, 'user_tasks', taskId);
    await updateDoc(taskRef, {
      completed,
      completed_at: completed ? serverTimestamp() : null,
      updated_at: serverTimestamp(),
    });
    console.log('✅ Task completion toggled:', taskId, completed);
  } catch (error) {
    console.error('❌ Error toggling task completion:', error);
    throw error;
  }
};

/**
 * Delete a task
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const taskRef = doc(db, 'user_tasks', taskId);
    await deleteDoc(taskRef);
    console.log('✅ Task deleted:', taskId);
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    throw error;
  }
};

// ============================================================================
// TASK TAGS
// ============================================================================

/**
 * Get all tags for a user
 */
export const getUserTags = async (userId: string): Promise<TaskTag[]> => {
  try {
    const tagsRef = collection(db, 'task_tags');
    const q = query(
      tagsRef,
      where('user_id', '==', userId),
      orderBy('created_at', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    })) as TaskTag[];
  } catch (error) {
    console.error('Error getting user tags:', error);
    return [];
  }
};

/**
 * Create a new tag
 */
export const createTag = async (
  userId: string,
  name: string,
  color: string
): Promise<string> => {
  try {
    const tagsRef = collection(db, 'task_tags');

    const docRef = await addDoc(tagsRef, {
      user_id: userId,
      name,
      color,
      created_at: serverTimestamp(),
    });

    console.log('✅ Tag created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating tag:', error);
    throw error;
  }
};

/**
 * Delete a tag
 */
export const deleteTag = async (tagId: string): Promise<void> => {
  try {
    const tagRef = doc(db, 'task_tags', tagId);
    await deleteDoc(tagRef);
    console.log('✅ Tag deleted:', tagId);
  } catch (error) {
    console.error('❌ Error deleting tag:', error);
    throw error;
  }
};

// ============================================================================
// TASK LISTS
// ============================================================================

/**
 * Get all lists for a user
 */
export const getUserLists = async (userId: string): Promise<TaskList[]> => {
  try {
    const listsRef = collection(db, 'task_lists');
    const q = query(
      listsRef,
      where('user_id', '==', userId),
      orderBy('created_at', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    })) as TaskList[];
  } catch (error) {
    console.error('Error getting user lists:', error);
    return [];
  }
};

/**
 * Create a new list
 */
export const createList = async (
  userId: string,
  name: string,
  color: string,
  icon: string
): Promise<string> => {
  try {
    const listsRef = collection(db, 'task_lists');

    const docRef = await addDoc(listsRef, {
      user_id: userId,
      name,
      color,
      icon,
      created_at: serverTimestamp(),
    });

    console.log('✅ List created with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating list:', error);
    throw error;
  }
};

/**
 * Delete a list
 */
export const deleteList = async (listId: string): Promise<void> => {
  try {
    const listRef = doc(db, 'task_lists', listId);
    await deleteDoc(listRef);
    console.log('✅ List deleted:', listId);
  } catch (error) {
    console.error('❌ Error deleting list:', error);
    throw error;
  }
};
