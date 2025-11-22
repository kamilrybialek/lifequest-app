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
        firstName: userData.firstName,
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
      console.log('🎭 Logging in as demo user...');
      const demoEmail = 'demo@demo.com';
      const demoPassword = 'demodemo';

      try {
        // Try to login first
        console.log('Attempting to login with existing demo account...');
        await get().login(demoEmail, demoPassword);
        console.log('✅ Demo user logged in successfully');
      } catch (error: any) {
        console.log('Demo login failed, error code:', error.code, 'message:', error.message);

        // If user doesn't exist, create it
        if (error.code === 'auth/user-not-found' || error.message?.includes('No account found')) {
          console.log('📝 Demo user not found, creating new demo account...');

          try {
            // Register demo user
            const userCredential = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
            const firebaseUser = userCredential.user;
            console.log('✅ Demo Firebase user created:', firebaseUser.uid);

            // Create profile with demo data (already onboarded)
            console.log('Creating demo user profile in Firestore...');
            await createUserProfile(firebaseUser.uid, {
              email: firebaseUser.email!,
              onboarded: true,
              age: 25,
              weight: 70,
              height: 175,
              gender: 'male',
            });
            console.log('✅ Demo user profile created');

            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              firstName: undefined,
              onboarded: true,
              age: 25,
              weight: 70,
              height: 175,
              gender: 'male',
              createdAt: new Date().toISOString(),
            };

            set({ user: newUser, isAuthenticated: true });
            console.log('✅ Demo user created and logged in successfully');
          } catch (createError: any) {
            console.error('❌ Error creating demo user:', createError);
            throw new Error(`Failed to create demo user: ${createError.message}`);
          }
        } else {
          // Re-throw other errors
          console.error('❌ Login failed with error:', error);
          throw error;
        }
      }
    } catch (error: any) {
      console.error('❌ Demo login error (outer catch):', error);
      // Re-throw the error as-is to preserve the original message
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
        firstName: undefined,
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
        firstName: userData.firstName,
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

// Guard to prevent multiple simultaneous onAuthStateChanged calls
let isHandlingAuthChange = false;

// Set up Firebase auth state change listener
onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
  console.log('🔄 Auth state changed:', firebaseUser ? 'SIGNED_IN' : 'SIGNED_OUT');

  // Prevent multiple simultaneous calls
  if (isHandlingAuthChange) {
    console.log('⏸️ Already handling auth change, skipping...');
    return;
  }

  try {
    isHandlingAuthChange = true;

    if (!firebaseUser) {
      // User signed out
      const currentState = useAuthStore.getState();
      // Only update if state actually changed
      if (currentState.user !== null || currentState.isAuthenticated !== false) {
        useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
      }
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
          const newUser: User = {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            age: userData.age,
            weight: userData.weight,
            height: userData.height,
            gender: userData.gender as 'male' | 'female' | 'other' | undefined,
            onboarded: userData.onboarded ?? false,
            createdAt: userData.created_at?.toDate?.()?.toISOString() ?? new Date().toISOString(),
          };

          // Only update if user data actually changed (shallow comparison)
          const currentUser = useAuthStore.getState().user;

          // Debug: log detailed comparison with JSON.stringify to see exact values
          console.log('🔍 Comparing users (current):', currentUser ? JSON.stringify({
            id: currentUser.id,
            email: currentUser.email,
            firstName: currentUser.firstName,
            age: currentUser.age,
            weight: currentUser.weight,
            height: currentUser.height,
            gender: currentUser.gender,
            onboarded: currentUser.onboarded,
          }) : 'null');
          console.log('🔍 Comparing users (new):', JSON.stringify({
            id: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            age: newUser.age,
            weight: newUser.weight,
            height: newUser.height,
            gender: newUser.gender,
            onboarded: newUser.onboarded,
          }));

          const hasChanged = !currentUser ||
            currentUser.id !== newUser.id ||
            currentUser.email !== newUser.email ||
            currentUser.firstName !== newUser.firstName ||
            currentUser.age !== newUser.age ||
            currentUser.weight !== newUser.weight ||
            currentUser.height !== newUser.height ||
            currentUser.gender !== newUser.gender ||
            currentUser.onboarded !== newUser.onboarded;

          if (hasChanged) {
            // Debug: log WHY it changed
            if (!currentUser) {
              console.log('📝 User data changed: no current user (first login)');
            } else {
              const changedFields: string[] = [];
              if (currentUser.id !== newUser.id) changedFields.push(`id: ${currentUser.id} → ${newUser.id}`);
              if (currentUser.email !== newUser.email) changedFields.push(`email: ${currentUser.email} → ${newUser.email}`);
              if (currentUser.firstName !== newUser.firstName) changedFields.push(`firstName: ${currentUser.firstName} → ${newUser.firstName}`);
              if (currentUser.age !== newUser.age) changedFields.push(`age: ${currentUser.age} → ${newUser.age}`);
              if (currentUser.weight !== newUser.weight) changedFields.push(`weight: ${currentUser.weight} → ${newUser.weight}`);
              if (currentUser.height !== newUser.height) changedFields.push(`height: ${currentUser.height} → ${newUser.height}`);
              if (currentUser.gender !== newUser.gender) changedFields.push(`gender: ${currentUser.gender} → ${newUser.gender}`);
              if (currentUser.onboarded !== newUser.onboarded) changedFields.push(`onboarded: ${currentUser.onboarded} → ${newUser.onboarded}`);
              console.log('📝 User data changed:', changedFields.join(', '));
            }
            useAuthStore.setState({ user: newUser, isAuthenticated: true, isLoading: false });
          } else {
            console.log('✓ User data unchanged, skipping state update');
            // Still update loading state if needed
            const currentState = useAuthStore.getState();
            if (currentState.isLoading !== false || currentState.isAuthenticated !== true) {
              useAuthStore.setState({ isAuthenticated: true, isLoading: false });
            }
          }
        }
      } catch (error) {
        console.error('Error in auth state listener:', error);
        useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    }
  } finally {
    // Release guard after a small delay to prevent rapid-fire calls
    setTimeout(() => {
      isHandlingAuthChange = false;
    }, 100);
  }
});
