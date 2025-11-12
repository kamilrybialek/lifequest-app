import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { openDatabase } from '../database/database';

export const exportUserDataToJSON = async (userId: number): Promise<string> => {
  const db = openDatabase();

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

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Export user data
      tx.executeSql(
        'SELECT * FROM users WHERE id = ?',
        [userId],
        (_, { rows }) => {
          if (rows.length > 0) {
            exportData.user = rows.item(0);
          }
        }
      );

      // Export tasks
      tx.executeSql(
        'SELECT * FROM tasks WHERE user_id = ?',
        [userId],
        (_, { rows }) => {
          for (let i = 0; i < rows.length; i++) {
            exportData.tasks.push(rows.item(i));
          }
        }
      );

      // Export finance progress
      tx.executeSql(
        'SELECT * FROM finance_progress WHERE user_id = ?',
        [userId],
        (_, { rows }) => {
          if (rows.length > 0) {
            exportData.finance = rows.item(0);
          }
        }
      );

      // Export mental progress
      tx.executeSql(
        'SELECT * FROM mental_progress WHERE user_id = ?',
        [userId],
        (_, { rows }) => {
          if (rows.length > 0) {
            exportData.mental = rows.item(0);
          }
        }
      );

      // Export physical progress
      tx.executeSql(
        'SELECT * FROM physical_progress WHERE user_id = ?',
        [userId],
        (_, { rows }) => {
          if (rows.length > 0) {
            exportData.physical = rows.item(0);
          }
        }
      );

      // Export nutrition progress
      tx.executeSql(
        'SELECT * FROM nutrition_progress WHERE user_id = ?',
        [userId],
        (_, { rows }) => {
          if (rows.length > 0) {
            exportData.nutrition = rows.item(0);
          }
        }
      );

      // Export achievements
      tx.executeSql(
        'SELECT * FROM user_achievements WHERE user_id = ?',
        [userId],
        (_, { rows }) => {
          for (let i = 0; i < rows.length; i++) {
            exportData.achievements.push(rows.item(i));
          }
          resolve(JSON.stringify(exportData, null, 2));
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
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
