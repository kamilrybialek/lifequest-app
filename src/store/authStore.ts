import { create } from 'zustand';
import { User } from '../types';
import { auth } from '../config/firebase';
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
        gender: userData.gender,
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
        gender: userData.gender,
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
      let userData = await getUserProfile(firebaseUser.uid);

      // Create profile if doesn't exist
      if (!userData) {
        await createUserProfile(firebaseUser.uid, {
          email: firebaseUser.email!,
          onboarded: false,
        });
        userData = await getUserProfile(firebaseUser.uid);
      }

      if (userData) {
        const user: User = {
          id: userData.id,
          email: userData.email,
          age: userData.age,
          weight: userData.weight,
          height: userData.height,
          gender: userData.gender,
          onboarded: userData.onboarded ?? false,
          createdAt: userData.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
        };

        useAuthStore.setState({ user, isAuthenticated: true, isLoading: false });
      }
    } catch (error) {
      console.error('Error in auth state listener:', error);
      useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
});
