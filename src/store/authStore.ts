import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { User } from '../types';
import { getUserByEmail, createUser as createUserInDB, updateUserOnboarding } from '../database/user';
import { createDemoAccount, isDemoEmail, getDemoUserId } from '../utils/createDemoAccount';

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
    // On web platform, use AsyncStorage-only authentication
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform: Using AsyncStorage authentication');

      // Check if user exists in AsyncStorage
      const usersData = await AsyncStorage.getItem('web_users');
      const users = usersData ? JSON.parse(usersData) : [];
      const existingUser = users.find((u: any) => u.email === email);

      if (!existingUser) {
        throw new Error('User not found. Please register first.');
      }

      const user: User = {
        id: existingUser.id,
        email: existingUser.email,
        age: existingUser.age,
        weight: existingUser.weight,
        height: existingUser.height,
        gender: existingUser.gender,
        onboarded: existingUser.onboarded || false,
        createdAt: existingUser.createdAt || new Date().toISOString(),
      };

      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
      return;
    }

    // Mobile platform: Use database
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
    // On web platform, use AsyncStorage-only authentication
    if (Platform.OS === 'web') {
      console.log('🌐 Web platform: Registering user in AsyncStorage');

      // Load existing users
      const usersData = await AsyncStorage.getItem('web_users');
      const users = usersData ? JSON.parse(usersData) : [];

      // Check if user already exists
      if (users.find((u: any) => u.email === email)) {
        throw new Error('User already exists');
      }

      // Generate new user ID
      const newUserId = users.length > 0 ? Math.max(...users.map((u: any) => u.id)) + 1 : 1;

      const newUser: User = {
        id: newUserId,
        email,
        onboarded: false,
        createdAt: new Date().toISOString(),
      };

      // Save to web_users list
      users.push(newUser);
      await AsyncStorage.setItem('web_users', JSON.stringify(users));

      // Set as current user
      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      set({ user: newUser, isAuthenticated: true });
      return;
    }

    // Mobile platform: Use database
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

    // Update in state and AsyncStorage
    const updatedUser = { ...currentUser, ...data };
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

    // On web, also update in web_users list
    if (Platform.OS === 'web') {
      const usersData = await AsyncStorage.getItem('web_users');
      const users = usersData ? JSON.parse(usersData) : [];
      const userIndex = users.findIndex((u: any) => u.id === currentUser.id);

      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        await AsyncStorage.setItem('web_users', JSON.stringify(users));
      }
    } else {
      // Mobile: Update in database
      await updateUserOnboarding(currentUser.id, {
        age: data.age,
        weight: data.weight,
        height: data.height,
        gender: data.gender,
        onboarded: data.onboarded ? 1 : 0,
      });
    }

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