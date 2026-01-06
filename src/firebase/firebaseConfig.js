import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase Configuration (Email/Password Auth Only - No Billing Required)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBLxWKWiCaN_gOvRevJvlCiDvMqUvNT7ps",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "bloodsaathi-69e5d.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "bloodsaathi-69e5d",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "bloodsaathi-69e5d.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "511915961648",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:511915961648:web:ec77f4b47303e2fdbaecf5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services (Free tier only)
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configure Auth settings for email/password only
auth.languageCode = 'en';

console.log('✅ Firebase initialized with Email/Password authentication (Free tier)');

// Export Firebase services
export { auth, db, storage };
export default app;