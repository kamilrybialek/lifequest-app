import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  darkMode: boolean;
  notificationsEnabled: boolean;
  dailyReminderTime: string;
  language: 'en' | 'pl';

  toggleDarkMode: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDailyReminderTime: (time: string) => void;
  setLanguage: (lang: 'en' | 'pl') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: false,
      notificationsEnabled: true,
      dailyReminderTime: '09:00',
      language: 'en',

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setDailyReminderTime: (time) => set({ dailyReminderTime: time }),
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
