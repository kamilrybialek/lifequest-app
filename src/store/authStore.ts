import { create } from 'zustand';
import { User } from '../types';
import { auth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  createUserProfile,
  getUserProfile,
  updateUserProfile
} from '../services/firebaseUserService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
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
      console.log('🔐 Logging in with Firebase...');

      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      console.log('✅ Firebase auth successful, loading user data...');

      // Load user profile from Firestore
      let userData = await getUserProfile(firebaseUser.uid);

      // If user doesn't exist in Firestore, create profile
      if (!userData) {
        console.log('Creating user profile in Firestore...');
        await createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email!,
          onboarded: false,
        });

        userData = await getUserProfile(firebaseUser.uid);
      }

      if (!userData) {
        throw new Error('Failed to load user profile');
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        age: userData.age,
        weight: userData.weight,
        height: userData.height,
        gender: userData.gender as 'male' | 'female' | 'other' | undefined,
        onboarded: userData.onboarded ?? false,
        createdAt: userData.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };

      set({ user, isAuthenticated: true });
      console.log('✅ User logged in successfully');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      // Provide user-friendly error messages
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email. Please register first.');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password. Please try again.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed login attempts. Please try again later.');
      }
      throw error;
    }
  },

  loginAsDemo: async () => {
    try {
      console.log('🎭 Logging in as OFFLINE demo user (AsyncStorage only)...');

      // Create demo user WITHOUT Firebase - just local AsyncStorage
      const demoUser: User = {
        id: 'demo-user-local',
        email: 'demo@demo.com',
        onboarded: true,
        age: 25,
        weight: 70,
        height: 175,
        gender: 'male',
        createdAt: new Date().toISOString(),
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem('demo_user', JSON.stringify(demoUser));

      set({ user: demoUser, isAuthenticated: true });
      console.log('✅ Demo user logged in successfully (OFFLINE mode)');
    } catch (error: any) {
      console.error('❌ Demo login error:', error);
      throw new Error('Failed to login as demo user. Please try again.');
    }
  },

  register: async (email: string, password: string) => {
    try {
      console.log('📝 Registering new user with Firebase...');

      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      console.log('✅ Firebase auth user created');

      // Create user profile in Firestore
      await createUserProfile(firebaseUser.uid, {
        email: firebaseUser.email!,
        onboarded: false,
      });

      const newUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        onboarded: false,
        createdAt: new Date().toISOString(),
      };

      set({ user: newUser, isAuthenticated: true });
      console.log('✅ User registered successfully');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      // Provide user-friendly error messages
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists. Please log in instead.');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak. Please use at least 6 characters.');
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      console.log('👋 Logging out...');
      await signOut(auth);
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

      // Update in Firestore
      await updateUserProfile(currentUser.id, {
        age: data.age,
        weight: data.weight,
        height: data.height,
        gender: data.gender,
        onboarded: data.onboarded,
      });

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

      // Check for demo user first (offline mode)
      const demoUserData = await AsyncStorage.getItem('demo_user');
      if (demoUserData) {
        const demoUser = JSON.parse(demoUserData);
        console.log('✅ Demo user found in AsyncStorage (OFFLINE mode)');
        set({ user: demoUser, isAuthenticated: true, isLoading: false });
        return;
      }

      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        console.log('ℹ️ No active session found');
        set({ isLoading: false, isAuthenticated: false, user: null });
        return;
      }

      console.log('✅ Active session found, loading user data...');

      // Load user data from Firestore
      let userData = await getUserProfile(firebaseUser.uid);

      // If user doesn't exist in Firestore, create profile
      if (!userData) {
        console.log('Creating user profile in Firestore...');
        await createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email!,
          onboarded: false,
        });

        userData = await getUserProfile(firebaseUser.uid);
      }

      if (!userData) {
        throw new Error('Failed to load user profile');
      }

      const user: User = {
        id: userData.id,
        email: userData.email,
        age: userData.age,
        weight: userData.weight,
        height: userData.height,
        gender: userData.gender as 'male' | 'female' | 'other' | undefined,
        onboarded: userData.onboarded ?? false,
        createdAt: userData.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
      };

      set({ user, isAuthenticated: true, isLoading: false });
      console.log('✅ User loaded successfully');
    } catch (error) {
      console.error('❌ Error loading user:', error);
      set({ isLoading: false, isAuthenticated: false, user: null });
    }
  },
}));

// Set up Firebase auth state change listener
onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
  console.log('🔄 Auth state changed:', firebaseUser ? 'SIGNED_IN' : 'SIGNED_OUT');

  if (!firebaseUser) {
    // User signed out
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  } else {
    // User signed in - reload user data
    try {
      console.log('🔍 onAuthStateChanged: Loading user profile from Firestore...');
      console.log('🔍 User ID:', firebaseUser.uid);

      let userData = await getUserProfile(firebaseUser.uid);
      console.log('✅ onAuthStateChanged: Got user profile:', userData);

      // Create profile if doesn't exist
      if (!userData) {
        console.log('📝 onAuthStateChanged: Creating user profile...');
        await createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email!,
          onboarded: false,
        });
        userData = await getUserProfile(firebaseUser.uid);
        console.log('✅ onAuthStateChanged: Created user profile:', userData);
      }

      if (userData) {
        const user: User = {
          id: userData.id,
          email: userData.email,
          age: userData.age,
          weight: userData.weight,
          height: userData.height,
          gender: userData.gender as 'male' | 'female' | 'other' | undefined,
          onboarded: userData.onboarded ?? false,
          createdAt: userData.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        };

        console.log('✅ onAuthStateChanged: Setting user in store:', user);
        useAuthStore.setState({ user, isAuthenticated: true, isLoading: false });
      } else {
        console.error('❌ onAuthStateChanged: Failed to load or create user profile');
        useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error: any) {
      console.error('❌ Error in auth state listener:', error);
      console.error('❌ Error code:', error?.code);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));

      // Don't completely fail - set user from Firebase Auth even if Firestore fails
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        onboarded: false,
        createdAt: new Date().toISOString(),
      };

      console.log('⚠️ Using fallback user data (Auth only, no Firestore):', user);
      useAuthStore.setState({ user, isAuthenticated: true, isLoading: false });
    }
  }
});
