import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
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
// For web: Uses default localStorage persistence
// For React Native: Uses AsyncStorage persistence
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
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
