// Web version - expo-file-system and expo-sharing don't work on web
// Use browser download API instead

export const exportUserDataToJSON = async (userId: number): Promise<string> => {
  console.log('📦 Export not yet implemented on web');
  return JSON.stringify({ message: 'Export coming soon on web' });
};

export const shareUserData = async (userId: number): Promise<void> => {
  console.log('📤 Share not yet implemented on web');

  // TODO: Implement web download
  // Can use:
  // const blob = new Blob([jsonData], { type: 'application/json' });
  // const url = URL.createObjectURL(blob);
  // const a = document.createElement('a');
  // a.href = url;
  // a.download = 'lifequest-data.json';
  // a.click();

  alert('Export feature coming soon on web!');
};
