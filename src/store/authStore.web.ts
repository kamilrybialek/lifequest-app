import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
// CRITICAL: Import from user.web (AsyncStorage) not user (SQLite)
import { getUserByEmail, createUser as createUserInDB, updateUserOnboarding } from '../database/user.web';
// CRITICAL: Import from createDemoAccount.web to avoid SQLite chain
import { createDemoAccount, isDemoEmail, getDemoUserId } from '../utils/createDemoAccount.web';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    // Handle demo account
    if (isDemoEmail(email)) {
      let userId = await getDemoUserId();

      // Create demo account if it doesn't exist
      if (!userId) {
        console.log('Creating demo account with sample data...');
        userId = await createDemoAccount();
      }

      // Load demo user from database
      const dbUser: any = await getUserByEmail(email);

      if (!dbUser) {
        throw new Error('Demo account creation failed');
      }

      const user: User = {
        id: dbUser.id,
        email: dbUser.email,
        age: dbUser.age,
        weight: dbUser.weight,
        height: dbUser.height,
        gender: dbUser.gender,
        onboarded: dbUser.onboarded === 1,
        createdAt: dbUser.created_at,
      };

      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
      return;
    }

    // Regular user login
    const dbUser: any = await getUserByEmail(email);

    if (!dbUser) {
      throw new Error('User not found');
    }

    const user: User = {
      id: dbUser.id,
      email: dbUser.email,
      age: dbUser.age,
      weight: dbUser.weight,
      height: dbUser.height,
      gender: dbUser.gender,
      onboarded: dbUser.onboarded === 1,
      createdAt: dbUser.created_at,
    };

    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  register: async (email: string, password: string) => {
    // Create user in database
    const userId = await createUserInDB(email, email.split('@')[0]);

    const newUser: User = {
      id: userId,
      email,
      onboarded: false,
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    set({ user: newUser, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (data: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;

    // Update in database
    await updateUserOnboarding(currentUser.id, {
      age: data.age,
      weight: data.weight,
      height: data.height,
      gender: data.gender,
      onboarded: data.onboarded ? 1 : 0,
    });

    // Update in state and AsyncStorage
    const updatedUser = { ...currentUser, ...data };
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  loadUser: async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      set({ isLoading: false });
    }
  },
}));
