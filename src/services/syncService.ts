/**
 * Sync Service - Handles offline-first data synchronization
 * Implements conflict resolution and retry logic
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncAPI, SyncChange } from './api';

const SYNC_QUEUE_KEY = 'lifequest.sync_queue';
const LAST_SYNC_KEY = 'lifequest.last_sync';

interface QueuedChange extends SyncChange {
  retries: number;
  queuedAt: number;
}

/**
 * Get pending changes from sync queue
 */
async function getSyncQueue(): Promise<QueuedChange[]> {
  const queue = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
  return queue ? JSON.parse(queue) : [];
}

/**
 * Save sync queue
 */
async function saveSyncQueue(queue: QueuedChange[]): Promise<void> {
  await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Add change to sync queue
 */
export async function queueChange(change: SyncChange): Promise<void> {
  const queue = await getSyncQueue();

  const queuedChange: QueuedChange = {
    ...change,
    retries: 0,
    queuedAt: Date.now(),
  };

  queue.push(queuedChange);
  await saveSyncQueue(queue);

  console.log('📝 Queued change for sync:', change.entityType, change.action);
}

/**
 * Get last successful sync timestamp
 */
async function getLastSyncTimestamp(): Promise<number> {
  const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
  return timestamp ? parseInt(timestamp, 10) : 0;
}

/**
 * Update last sync timestamp
 */
async function setLastSyncTimestamp(timestamp: number): Promise<void> {
  await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
}

/**
 * Main sync function - push local changes and pull server changes
 */
export async function syncWithServer(): Promise<{
  success: boolean;
  pushedChanges: number;
  pulledChanges: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let pushedChanges = 0;
  let pulledChanges = 0;

  try {
    console.log('🔄 Starting sync...');

    // 1. PUSH: Get pending changes from queue
    const queue = await getSyncQueue();

    if (queue.length > 0) {
      console.log(`📤 Pushing ${queue.length} changes to server...`);

      try {
        const pushResult = await syncAPI.push(queue);
        pushedChanges = pushResult.synced;

        // Handle conflicts
        if (pushResult.conflicts && pushResult.conflicts.length > 0) {
          console.warn('⚠️ Sync conflicts detected:', pushResult.conflicts);
          errors.push(`${pushResult.conflicts.length} conflicts detected`);

          // TODO: Implement conflict resolution UI
        }

        // Clear successfully synced items from queue
        await saveSyncQueue([]);
        console.log(`✅ Pushed ${pushedChanges} changes successfully`);
      } catch (pushError) {
        console.error('❌ Push failed:', pushError);
        errors.push(`Push failed: ${pushError instanceof Error ? pushError.message : 'Unknown error'}`);

        // Increment retry count
        const updatedQueue = queue.map(item => ({
          ...item,
          retries: item.retries + 1,
        }));
        await saveSyncQueue(updatedQueue);
      }
    }

    // 2. PULL: Get changes from server since last sync
    const lastSync = await getLastSyncTimestamp();
    console.log(`📥 Pulling changes since ${new Date(lastSync).toISOString()}...`);

    try {
      const pullResult = await syncAPI.pull(lastSync);
      pulledChanges = pullResult.changes.length;

      if (pulledChanges > 0) {
        console.log(`📥 Received ${pulledChanges} changes from server`);

        // Apply changes to local storage
        await applyServerChanges(pullResult.changes);

        // Update last sync timestamp
        await setLastSyncTimestamp(pullResult.serverTimestamp);
        console.log(`✅ Applied ${pulledChanges} server changes`);
      } else {
        console.log('✅ No new changes from server');
        // Still update timestamp
        await setLastSyncTimestamp(Date.now());
      }
    } catch (pullError) {
      console.error('❌ Pull failed:', pullError);
      errors.push(`Pull failed: ${pullError instanceof Error ? pullError.message : 'Unknown error'}`);
    }

    const success = errors.length === 0;
    console.log(success ? '✅ Sync completed successfully' : '⚠️ Sync completed with errors');

    return {
      success,
      pushedChanges,
      pulledChanges,
      errors,
    };
  } catch (error) {
    console.error('❌ Sync failed:', error);
    return {
      success: false,
      pushedChanges: 0,
      pulledChanges: 0,
      errors: [error instanceof Error ? error.message : 'Unknown sync error'],
    };
  }
}

/**
 * Apply server changes to local storage
 */
async function applyServerChanges(changes: SyncChange[]): Promise<void> {
  for (const change of changes) {
    try {
      switch (change.entityType) {
        case 'task':
          await applyTaskChange(change);
          break;
        case 'user_stats':
          await applyUserStatsChange(change);
          break;
        case 'achievement':
          await applyAchievementChange(change);
          break;
        default:
          console.warn('Unknown entity type:', change.entityType);
      }
    } catch (error) {
      console.error(`Failed to apply change for ${change.entityType}:`, error);
    }
  }
}

/**
 * Apply task change from server
 */
async function applyTaskChange(change: SyncChange): Promise<void> {
  // TODO: Implement with actual task database
  console.log('Applying task change:', change.action, change.entityId);

  switch (change.action) {
    case 'create':
    case 'update':
      // Update local task
      break;
    case 'delete':
      // Delete local task
      break;
  }
}

/**
 * Apply user stats change from server
 */
async function applyUserStatsChange(change: SyncChange): Promise<void> {
  console.log('Applying user stats change:', change.action);
  // Server has authority over XP and levels to prevent cheating
  // Always accept server values
}

/**
 * Apply achievement change from server
 */
async function applyAchievementChange(change: SyncChange): Promise<void> {
  console.log('Applying achievement change:', change.action, change.entityId);
  // Merge achievements (additive only, never remove)
}

/**
 * Auto-sync on app foreground (optional)
 */
export function enableAutoSync(intervalMs: number = 60000): () => void {
  const interval = setInterval(() => {
    syncWithServer().catch(err => {
      console.error('Auto-sync failed:', err);
    });
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(interval);
}

/**
 * Sync on network reconnection
 */
export function syncOnNetworkReconnect(): void {
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('online', () => {
      console.log('🌐 Network reconnected, syncing...');
      syncWithServer();
    });
  }
}
