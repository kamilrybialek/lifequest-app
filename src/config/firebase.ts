import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence, indexedDBLocalPersistence } from 'firebase/auth';
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
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);

  // Set persistence explicitly to localStorage for iOS PWA compatibility
  console.log('🔧 Setting Firebase persistence...');
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('✅ Firebase persistence: browserLocalPersistence (localStorage)');
    })
    .catch((error) => {
      console.error('❌ Failed to set browserLocalPersistence:', error);
      console.log('🔄 Trying indexedDBLocalPersistence fallback...');
      // Fallback to IndexedDB if localStorage fails
      return setPersistence(auth, indexedDBLocalPersistence)
        .then(() => {
          console.log('✅ Firebase persistence: indexedDBLocalPersistence (IndexedDB)');
        });
    })
    .catch((error) => {
      console.error('❌ CRITICAL: Failed to set any persistence!', error);
      console.error('Auth state will not persist between sessions!');
    });
} else {
  // Only import on native platforms
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore with offline persistence
const db = getFirestore(app);

// Enable offline persistence for Firestore on web
if (Platform.OS === 'web') {
  console.log('🔧 Enabling Firestore offline persistence...');
  enableMultiTabIndexedDbPersistence(db)
    .then(() => {
      console.log('✅ Firestore offline persistence enabled (multi-tab)');
    })
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('⚠️ Firestore persistence failed: Multiple tabs open');
        // Multiple tabs open, persistence can only be enabled in one tab at a time
      } else if (err.code === 'unimplemented') {
        console.warn('⚠️ Firestore persistence not available in this browser');
        // The current browser doesn't support persistence
      } else {
        console.error('❌ Firestore persistence error:', err);
      }
    });
}

export { auth, db };
export default app;
