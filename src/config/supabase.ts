import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://bxofbbqocwnhwjgykhqd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4b2ZiYnFvY3duaHdqZ3lraHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMzMjUzNDEsImV4cCI6MjA3ODkwMTM0MX0.U9b8swND8FE5L4HKDMNyHPTXOZ5PgiVRI4hvijoDUBo';

// Configure storage adapter based on platform
const storage = Platform.OS === 'web'
  ? undefined  // Use default localStorage on web
  : {
      // Use AsyncStorage on mobile
      getItem: async (key: string) => {
        return await AsyncStorage.getItem(key);
      },
      setItem: async (key: string, value: string) => {
        await AsyncStorage.setItem(key, value);
      },
      removeItem: async (key: string) => {
        await AsyncStorage.removeItem(key);
      },
    };

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Database types (will be auto-generated later, for now basic types)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          age?: number;
          weight?: number;
          height?: number;
          gender?: string;
          onboarded: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
          age?: number;
          weight?: number;
          height?: number;
          gender?: string;
          onboarded?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          age?: number;
          weight?: number;
          height?: number;
          gender?: string;
          onboarded?: boolean;
        };
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          total_xp: number;
          level: number;
          finance_streak: number;
          mental_streak: number;
          physical_streak: number;
          nutrition_streak: number;
          last_active_date?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_xp?: number;
          level?: number;
          finance_streak?: number;
          mental_streak?: number;
          physical_streak?: number;
          nutrition_streak?: number;
          last_active_date?: string;
        };
        Update: {
          total_xp?: number;
          level?: number;
          finance_streak?: number;
          mental_streak?: number;
          physical_streak?: number;
          nutrition_streak?: number;
          last_active_date?: string;
        };
      };
    };
  };
};
