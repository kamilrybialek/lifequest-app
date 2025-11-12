// Web version - expo-file-system and expo-sharing don't work on web
import { Platform } from 'react-native';

/**
 * Export data to CSV file and share (web stub)
 */
export const exportToCSV = async (
  data: any[],
  filename: string,
  headers: string[]
): Promise<void> => {
  console.log('📊 CSV export not yet implemented on web');

  // TODO: Implement browser download
  // Can create CSV blob and download it

  if (Platform.OS === 'web') {
    alert('CSV export feature coming soon on web!');
  }
};
