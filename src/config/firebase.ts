import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence, indexedDBLocalPersistence, Auth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { Platform } from 'react-native';

// 🔥 FIREBASE CONFIGURATION
// Configuration from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCTcYT4fxw41MIJFou94siCb3cQ9lNc_jo",
  authDomain: "lifequest-app-331d9.firebaseapp.com",
  projectId: "lifequest-app-331d9",
  storageBucket: "lifequest-app-331d9.firebasestorage.app",
  messagingSenderId: "603629837186",
  appId: "1:603629837186:web:ff6fb1963757044de2cd9b",
  measurementId: "G-Y234GEXYDW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with proper persistence
// CRITICAL for iOS PWA: Use explicit localStorage persistence (not IndexedDB)
// IndexedDB can be cleared on iOS PWA when app closes, localStorage is more reliable
let auth: Auth;

// Check if running as standalone PWA (iOS home screen app)
const isStandalonePWA = Platform.OS === 'web' &&
  typeof window !== 'undefined' &&
  (window.navigator as any).standalone === true;

// Promise that resolves when Auth persistence is ready
// Other modules should await this before using auth
let authPersistenceReady: Promise<void>;

if (Platform.OS === 'web') {
  auth = getAuth(app);

  console.log('🔧 Setting Firebase Auth persistence to localStorage...',
    isStandalonePWA ? '[PWA MODE]' : '[WEB MODE]');

  // Set persistence and export the promise so other modules can wait for it
  authPersistenceReady = setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('✅ Auth persistence ready (localStorage)');
    })
    .catch((error) => {
      console.error('❌ localStorage persistence failed, trying IndexedDB...', error);
      // Fallback to IndexedDB
      return setPersistence(auth, indexedDBLocalPersistence)
        .then(() => {
          console.log('✅ Auth persistence ready (IndexedDB fallback)');
        });
    })
    .catch((fallbackError) => {
      console.error('❌ CRITICAL: All persistence methods failed!', fallbackError);
      console.warn('⚠️ Proceeding without persistence - auth state will NOT survive page reload');
    });
} else {
  // Only import on native platforms
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });

  // Native persistence is synchronous, resolve immediately
  authPersistenceReady = Promise.resolve();
}

// Initialize Firestore with offline persistence
const db = getFirestore(app);

// Enable offline persistence for Firestore on web
// IMPORTANT: Don't enable on iOS PWA as IndexedDB is unreliable there
if (Platform.OS === 'web' && !isStandalonePWA) {
  console.log('🔧 Enabling Firestore offline persistence (web mode)...');
  enableMultiTabIndexedDbPersistence(db)
    .then(() => {
      console.log('✅ Firestore offline persistence enabled');
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('⚠️ Firestore: Multiple tabs open, persistence disabled');
      } else if (err.code === 'unimplemented') {
        console.warn('⚠️ Firestore: Persistence not supported in this browser');
      } else {
        console.error('❌ Firestore persistence error:', err);
      }
    });
} else if (isStandalonePWA) {
  console.log('📱 Running in PWA mode - Firestore offline persistence DISABLED (IndexedDB unreliable on iOS PWA)');
  console.log('📡 Firestore will work in online-only mode');
}

export { auth, db, authPersistenceReady };
export default app;
