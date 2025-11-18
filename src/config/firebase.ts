import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';

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

// Initialize Firebase Auth
const auth = getAuth(app);

// IMPORTANT: Auth persistence is set by default to LOCAL on web
// This means users stay logged in after page refresh
console.log('✅ Firebase Auth initialized with default LOCAL persistence');

// Initialize Firestore with cache settings to prevent connection issues
let db;
try {
  db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: true, // Use long polling instead of WebSocket
  });
  console.log('✅ Firestore initialized with long polling');
} catch (error) {
  console.error('❌ Error initializing Firestore:', error);
  // Fallback to default Firestore
  db = getFirestore(app);
}

export { auth, db };
export default app;
