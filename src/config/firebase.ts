import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, indexedDBLocalPersistence, Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
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

  const mode = isStandalonePWA ? '[PWA MODE]' : '[WEB MODE]';
  console.log(`🔧 [1/3] Setting Firebase Auth persistence to localStorage... ${mode}`);

  // Set persistence and export the promise so other modules can wait for it
  authPersistenceReady = setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('✅ [2/3] Auth persistence ready (localStorage)');
      return Promise.resolve();
    })
    .catch((error) => {
      console.error('❌ localStorage persistence failed, trying IndexedDB fallback...', error);
      // Fallback to IndexedDB
      return setPersistence(auth, indexedDBLocalPersistence)
        .then(() => {
          console.log('✅ [2/3] Auth persistence ready (IndexedDB fallback)');
          return Promise.resolve();
        });
    })
    .catch((fallbackError) => {
      console.error('❌ CRITICAL: All persistence methods failed!', fallbackError);
      console.warn('⚠️ Proceeding without persistence - auth state will NOT survive page reload');
      return Promise.resolve(); // Resolve anyway to not block app startup
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

// Initialize Firestore (online-only mode, no offline persistence)
const db = getFirestore(app);

// Initialize Firebase Storage
const storage = getStorage(app);

// DISABLED: Firestore offline persistence causes connection issues on Safari/iOS
// Firestore will work in online-only mode, which is sufficient for this app
// The critical persistence is Auth (localStorage), not Firestore cache
console.log('📡 [3/4] Firestore initialized (online-only mode, no offline cache)');
console.log('📦 [4/4] Firebase Storage initialized');
console.log('💡 Auth persistence: localStorage | Firestore: online-only | Storage: enabled')

export { auth, db, storage, authPersistenceReady };
export default app;
