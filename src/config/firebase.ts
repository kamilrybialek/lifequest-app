import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
  // Try multiple persistence methods in order of reliability on iOS
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('✅ Firebase persistence set to browserLocalPersistence (localStorage)');
    })
    .catch((error) => {
      console.error('❌ Failed to set browserLocalPersistence, trying indexedDB:', error);
      // Fallback to IndexedDB if localStorage fails
      return setPersistence(auth, indexedDBLocalPersistence);
    })
    .then(() => {
      console.log('✅ Firebase persistence set to indexedDBLocalPersistence');
    })
    .catch((error) => {
      console.error('❌ Failed to set any persistence, auth state will not persist!', error);
    });
} else {
  // Only import on native platforms
  const { initializeAuth, getReactNativePersistence } = require('firebase/auth');
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;

  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Initialize Firestore
const db = getFirestore(app);

export { auth, db };
export default app;
