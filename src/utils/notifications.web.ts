// Web stub for notifications - notifications don't work on web platform
// This file prevents crashes when importing notifications in web builds

/**
 * Request notification permissions (Web stub - always returns false)
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  console.log('🌐 Notifications not supported on web platform');
  return false;
};

/**
 * Schedule streak protection notification (Web stub - no-op)
 */
export const scheduleStreakProtectionNotification = async (): Promise<void> => {
  console.log('🌐 Notifications not supported on web platform');
};

/**
 * Schedule daily reminder at specific time (Web stub - no-op)
 */
export const scheduleDailyReminder = async (hour: number, minute: number): Promise<void> => {
  console.log('🌐 Notifications not supported on web platform');
};

/**
 * Cancel daily reminder (Web stub - no-op)
 */
export const cancelDailyReminder = async (): Promise<void> => {
  console.log('🌐 Notifications not supported on web platform');
};

/**
 * Schedule immediate notification (Web stub - no-op)
 */
export const scheduleImmediateNotification = async (
  title: string,
  body: string,
  data?: any
): Promise<void> => {
  console.log('🌐 Notifications not supported on web platform');
};

/**
 * Cancel all scheduled notifications (Web stub - no-op)
 */
export const cancelAllScheduledNotifications = async (): Promise<void> => {
  console.log('🌐 Notifications not supported on web platform');
};

/**
 * Initialize notifications system (Web stub - no-op)
 */
export const initializeNotifications = async (): Promise<void> => {
  console.log('🌐 Notifications not supported on web platform - skipping initialization');
};
