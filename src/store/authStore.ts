import { create } from 'zustand';
import { User } from '../types';
import { supabase } from '../config/supabase';

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
    try {
      console.log('🔐 Logging in with Supabase...');

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user data returned from Supabase');
      }

      console.log('✅ Supabase auth successful, loading user data...');

      // Load user profile from our users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        console.error('Error loading user data:', userError);
        // If user doesn't exist in users table, create it
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email!,
            onboarded: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const user: User = {
          id: newUser.id,
          email: newUser.email,
          onboarded: false,
          createdAt: newUser.created_at,
        };

        set({ user, isAuthenticated: true });
        return;
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        age: userData.age,
        weight: userData.weight,
        height: userData.height,
        gender: userData.gender,
        onboarded: userData.onboarded,
        createdAt: userData.created_at,
      };

      set({ user, isAuthenticated: true });
      console.log('✅ User logged in successfully');
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  },

  register: async (email: string, password: string) => {
    try {
      console.log('📝 Registering new user with Supabase...');

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error('No user data returned from Supabase');
      }

      console.log('✅ Supabase auth user created');

      // Create user profile in users table (will be auto-created by trigger, but we'll ensure it)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: authData.user.email!,
          onboarded: false,
        })
        .select()
        .single();

      if (userError) throw userError;

      const newUser: User = {
        id: userData.id,
        email: userData.email,
        onboarded: false,
        createdAt: userData.created_at,
      };

      set({ user: newUser, isAuthenticated: true });
      console.log('✅ User registered successfully');
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      console.log('👋 Logging out...');
      await supabase.auth.signOut();
      set({ user: null, isAuthenticated: false });
      console.log('✅ Logged out successfully');
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;

    try {
      console.log('📝 Updating user profile...');

      // Update in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          age: data.age,
          weight: data.weight,
          height: data.height,
          gender: data.gender,
          onboarded: data.onboarded,
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Update local state
      const updatedUser = { ...currentUser, ...data };
      set({ user: updatedUser });
      console.log('✅ Profile updated successfully');
    } catch (error) {
      console.error('❌ Profile update error:', error);
      throw error;
    }
  },

  loadUser: async () => {
    try {
      console.log('🔍 Loading user session...');

      // Check if there's an active session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        console.log('ℹ️ No active session found');
        set({ isLoading: false, isAuthenticated: false, user: null });
        return;
      }

      console.log('✅ Active session found, loading user data...');

      // Load user data from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('❌ Error loading user data:', error);
        // Create user if doesn't exist
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: session.user.id,
            email: session.user.email!,
            onboarded: false,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        const user: User = {
          id: newUser.id,
          email: newUser.email,
          onboarded: false,
          createdAt: newUser.created_at,
        };

        set({ user, isAuthenticated: true, isLoading: false });
        return;
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        age: userData.age,
        weight: userData.weight,
        height: userData.height,
        gender: userData.gender,
        onboarded: userData.onboarded,
        createdAt: userData.created_at,
      };

      set({ user, isAuthenticated: true, isLoading: false });
      console.log('✅ User loaded successfully');
    } catch (error) {
      console.error('❌ Error loading user:', error);
      set({ isLoading: false, isAuthenticated: false, user: null });
    }
  },
}));

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔄 Auth state changed:', event);

  if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  } else if (event === 'SIGNED_IN' && session) {
    // Reload user data when signed in
    useAuthStore.getState().loadUser();
  }
});
