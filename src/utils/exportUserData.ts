import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '../database/init';

export const exportUserDataToJSON = async (userId: number): Promise<string> => {
  try {
    const db = await getDatabase();

    const exportData: any = {
      exportDate: new Date().toISOString(),
      userId,
      user: {},
      tasks: [],
      finance: {},
      mental: {},
      physical: {},
      nutrition: {},
      achievements: [],
    };

    // Export user data
    const user = await db.getFirstAsync('SELECT * FROM users WHERE id = ?', [userId]);
    if (user) {
      exportData.user = user;
    }

    // Export tasks
    const tasks = await db.getAllAsync('SELECT * FROM tasks WHERE user_id = ?', [userId]);
    exportData.tasks = tasks || [];

    // Export finance progress
    const finance = await db.getFirstAsync('SELECT * FROM finance_progress WHERE user_id = ?', [userId]);
    if (finance) {
      exportData.finance = finance;
    }

    // Export mental progress
    const mental = await db.getFirstAsync('SELECT * FROM mental_progress WHERE user_id = ?', [userId]);
    if (mental) {
      exportData.mental = mental;
    }

    // Export physical progress
    const physical = await db.getFirstAsync('SELECT * FROM physical_progress WHERE user_id = ?', [userId]);
    if (physical) {
      exportData.physical = physical;
    }

    // Export nutrition progress
    const nutrition = await db.getFirstAsync('SELECT * FROM nutrition_progress WHERE user_id = ?', [userId]);
    if (nutrition) {
      exportData.nutrition = nutrition;
    }

    // Export achievements
    const achievements = await db.getAllAsync('SELECT * FROM user_achievements WHERE user_id = ?', [userId]);
    exportData.achievements = achievements || [];

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting user data to JSON:', error);
    throw error;
  }
};

export const shareUserData = async (userId: number): Promise<void> => {
  try {
    const jsonData = await exportUserDataToJSON(userId);
    const fileName = `lifequest_data_${userId}_${Date.now()}.json`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(fileUri, jsonData);

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Export LifeQuest Data',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
};
