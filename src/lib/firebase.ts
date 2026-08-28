import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase Configuration loaded via Vite environment variables.
 * These variables should be configured in your environment or .env file.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
};

/**
 * Helper to check if Firebase is configured with real credentials.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId
);

// Initialize Firebase App safely (singleton pattern)
export const app: FirebaseApp = getApps().length > 0
  ? getApp()
  : initializeApp(
      isFirebaseConfigured
        ? firebaseConfig
        : {
            apiKey: 'demo-api-key',
            authDomain: 'demo-project.firebaseapp.com',
            projectId: 'demo-project',
            storageBucket: 'demo-project.appspot.com',
            messagingSenderId: '123456789',
            appId: '1:123456789:web:abcdef',
          }
    );

// Initialize Firebase Authentication & Cloud Firestore
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
