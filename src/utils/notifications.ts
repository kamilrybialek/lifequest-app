import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Notification permissions denied');
      return false;
    }

    console.log('✅ Notification permissions granted');

    // Get push token for future use (if needed for backend)
    if (Platform.OS !== 'web') {
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      await AsyncStorage.setItem('pushToken', token);
      console.log('📱 Push token:', token);
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Schedule streak protection notification (8 PM daily)
 */
export const scheduleStreakProtectionNotification = async (
  streak: number,
  remainingTasks: number
): Promise<void> => {
  try {
    // Cancel existing streak notifications
    await cancelNotificationsByIdentifier('streak-protection');

    // Only schedule if there are remaining tasks
    if (remainingTasks === 0) return;

    const trigger: Notifications.NotificationTriggerInput = {
      hour: 20, // 8 PM
      minute: 0,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      identifier: 'streak-protection',
      content: {
        title: `🔥 Don't lose your ${streak}-day streak!`,
        body: `You have ${remainingTasks} ${remainingTasks === 1 ? 'task' : 'tasks'} left. Complete ${remainingTasks === 1 ? 'it' : 'them'} in 10 minutes!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'streak-protection', streak, remainingTasks },
      },
      trigger,
    });

    console.log('✅ Streak protection notification scheduled for 8 PM');
  } catch (error) {
    console.error('Error scheduling streak notification:', error);
  }
};

/**
 * Schedule morning motivation notification (8 AM daily)
 */
export const scheduleMorningMotivation = async (): Promise<void> => {
  try {
    // Cancel existing morning notifications
    await cancelNotificationsByIdentifier('morning-motivation');

    const messages = [
      '☀️ Good morning! Start your day with 3 quick wins',
      '🌅 New day, new opportunities! Check your daily tasks',
      '💪 Rise and shine! Your daily quests await',
      '🎯 Today's the day! Complete your first task now',
      '🚀 Good morning, champion! Let's make today count',
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    const trigger: Notifications.NotificationTriggerInput = {
      hour: 8,
      minute: 0,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      identifier: 'morning-motivation',
      content: {
        title: 'LifeQuest',
        body: randomMessage,
        sound: true,
        data: { type: 'morning-motivation' },
      },
      trigger,
    });

    console.log('✅ Morning motivation notification scheduled for 8 AM');
  } catch (error) {
    console.error('Error scheduling morning notification:', error);
  }
};

/**
 * Send achievement unlocked notification
 */
export const sendAchievementNotification = async (
  achievementTitle: string,
  xpReward: number
): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏆 Achievement Unlocked!',
        body: `${achievementTitle} - You earned ${xpReward} XP!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { type: 'achievement', title: achievementTitle, xp: xpReward },
      },
      trigger: null, // Send immediately
    });

    console.log(`🏆 Achievement notification sent: ${achievementTitle}`);
  } catch (error) {
    console.error('Error sending achievement notification:', error);
  }
};

/**
 * Send level up notification
 */
export const sendLevelUpNotification = async (newLevel: number): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `⭐ Level Up! You're now Level ${newLevel}!`,
        body: `Amazing progress! Keep crushing those goals 💪`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { type: 'level-up', level: newLevel },
      },
      trigger: null,
    });

    console.log(`⭐ Level up notification sent: Level ${newLevel}`);
  } catch (error) {
    console.error('Error sending level up notification:', error);
  }
};

/**
 * Schedule bill reminder notification
 */
export const scheduleBillReminder = async (
  billTitle: string,
  amount: number,
  dueDate: Date
): Promise<void> => {
  try {
    // Schedule notification 3 days before due date
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - 3);
    reminderDate.setHours(10, 0, 0, 0); // 10 AM

    // Only schedule if reminder date is in the future
    if (reminderDate > new Date()) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Bill Due Soon',
          body: `${billTitle} - $${amount.toFixed(2)} due in 3 days`,
          sound: true,
          data: { type: 'bill-reminder', billTitle, amount, dueDate: dueDate.toISOString() },
        },
        trigger: reminderDate,
      });

      console.log(`📅 Bill reminder scheduled: ${billTitle} on ${reminderDate.toLocaleDateString()}`);
    }
  } catch (error) {
    console.error('Error scheduling bill reminder:', error);
  }
};

/**
 * Send task completion notification
 */
export const sendTaskCompletedNotification = async (
  taskTitle: string,
  xpEarned: number,
  completedToday: number,
  totalToday: number
): Promise<void> => {
  try {
    const isAllComplete = completedToday === totalToday;

    const title = isAllComplete
      ? '🎉 All tasks complete!'
      : `✅ Task completed! (${completedToday}/${totalToday})`;

    const body = isAllComplete
      ? `Amazing! You earned ${xpEarned} XP today. See you tomorrow! 💪`
      : `Great job on "${taskTitle}"! +${xpEarned} XP`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: isAllComplete,
        data: { type: 'task-completed', completedToday, totalToday },
      },
      trigger: null,
    });

    console.log(`✅ Task completion notification sent`);
  } catch (error) {
    console.error('Error sending task completion notification:', error);
  }
};

/**
 * Schedule weekly summary notification (Sunday evening)
 */
export const scheduleWeeklySummary = async (): Promise<void> => {
  try {
    await cancelNotificationsByIdentifier('weekly-summary');

    const trigger: Notifications.NotificationTriggerInput = {
      weekday: 1, // Sunday
      hour: 19, // 7 PM
      minute: 0,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      identifier: 'weekly-summary',
      content: {
        title: '📊 Your Weekly Summary is Ready!',
        body: 'Check out your progress from this week',
        sound: true,
        data: { type: 'weekly-summary' },
      },
      trigger,
    });

    console.log('✅ Weekly summary notification scheduled for Sundays at 7 PM');
  } catch (error) {
    console.error('Error scheduling weekly summary:', error);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ All notifications canceled');
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};

/**
 * Cancel notifications by identifier
 */
export const cancelNotificationsByIdentifier = async (identifier: string): Promise<void> => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const toCancel = scheduled.filter(n => n.identifier === identifier);

    for (const notification of toCancel) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }

    console.log(`✅ Canceled ${toCancel.length} notifications with identifier: ${identifier}`);
  } catch (error) {
    console.error('Error canceling notifications by identifier:', error);
  }
};

/**
 * Get all scheduled notifications (for debugging)
 */
export const getAllScheduledNotifications = async (): Promise<Notifications.NotificationRequest[]> => {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    console.log(`📱 ${notifications.length} notifications scheduled`);
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};

/**
 * Setup notification listeners (call this in App.tsx)
 */
export const setupNotificationListeners = () => {
  // Listener for when notification is received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener(notification => {
    console.log('📩 Notification received:', notification.request.content.title);
  });

  // Listener for when user taps on notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('👆 Notification tapped:', response.notification.request.content.data);

    const data = response.notification.request.content.data;

    // Handle different notification types
    switch (data.type) {
      case 'streak-protection':
        // Navigate to Home screen
        console.log('Navigate to Home for streak protection');
        break;
      case 'morning-motivation':
        // Navigate to Home screen
        console.log('Navigate to Home');
        break;
      case 'achievement':
        // Navigate to Achievements screen
        console.log('Navigate to Achievements');
        break;
      case 'bill-reminder':
        // Navigate to Finance Manager
        console.log('Navigate to Finance Manager');
        break;
    }
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};

/**
 * Initialize notifications (call this on app start)
 */
export const initializeNotifications = async (): Promise<boolean> => {
  const hasPermission = await requestNotificationPermissions();

  if (hasPermission) {
    // Schedule recurring notifications
    await scheduleMorningMotivation();
    await scheduleWeeklySummary();

    // Setup listeners
    setupNotificationListeners();

    console.log('✅ Notifications initialized');
  }

  return hasPermission;
};
